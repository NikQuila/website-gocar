'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Autocomplete,
  AutocompleteItem,
} from '@heroui/react';
import useClientStore from '@/store/useClientStore';
import useCustomerStore from '@/store/useCustomerStore';
import { supabase } from '@/lib/supabase';
import { LeadTypes, Vehicle } from '@/utils/types';
import { sendEmail, createFinancingLeadEmailTemplate } from '@/lib/send-email2';
import SuccessModal from '@/components/ui/SuccessModal';
import useVehiclesStore from '@/store/useVehiclesStore';
import { useTranslation } from '@/i18n/hooks/useTranslation';

const FinancingPage = () => {
  const { vehicles } = useVehiclesStore();
  const { client } = useClientStore();
  const { initializeCustomer } = useCustomerStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    vehicle_id: '',
    message: '',
    down_payment: '',
    monthly_income: '',
    employment_type: '',
    rut: '',
    birth_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // 1. Create/initialize customer
      const customerResponse = await initializeCustomer({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        client_id: client?.id || '',
        rut: formData.rut,
        birth_date: formData.birth_date,
      });

      // 2. Create lead with vehicle_id if selected
      const { error: leadError } = await supabase.from('leads').insert([
        {
          client_id: client?.id,
          customer_id: customerResponse.id,
          vehicle_id: formData.vehicle_id || null,
          type: LeadTypes.SELL_FINANCING,
          status: 'pending',
          notes: formData.message,
          financing_data: {
            monthly_income: getNumericValue(formData.monthly_income),
            down_payment: getNumericValue(formData.down_payment),
            employment_type: formData.employment_type,
          },
        },
      ]);

      if (leadError) throw leadError;

      // 3. Send email notification

      const selectedVehicle: Vehicle | undefined = vehicles.find(
        (v) => v.id.toString() === formData.vehicle_id.toString()
      );

      console.log('Selected vehicle found:', selectedVehicle);

      let vehicleInfo = {
        brand: 'No especificado',
        model: 'No especificado',
        year: '',
        mileage: '',
        condition: 'N/A',
        price: '',
        plate: '',
      };

      if (selectedVehicle) {
        vehicleInfo = {
          brand: selectedVehicle.brand?.name || 'No especificado',
          model: selectedVehicle.model?.name || 'No especificado',
          plate: selectedVehicle.license_plate || selectedVehicle.plate || '',
          year: selectedVehicle.year?.toString() || '',
          mileage: selectedVehicle.mileage?.toString() || '',
          condition: selectedVehicle.condition?.name || 'N/A',
          price: selectedVehicle.price
            ? Number(selectedVehicle.price).toLocaleString('es-CL')
            : '',
        };
      }

      console.log('Vehicle info being sent:', vehicleInfo);

      // Use the email function
      const emailContent = createFinancingLeadEmailTemplate({
        customerName: `${formData.first_name} ${formData.last_name}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerRut: formData.rut,
        vehicleDetails: vehicleInfo,
        additionalMessage: `
Información Financiera:
- Actividad Laboral: ${formData.employment_type || 'No especificado'}
- Renta Líquida Mensual: $${formData.monthly_income || '0'}
- Monto Pie: $${formData.down_payment || '0'}
- Fecha de Nacimiento: ${formData.birth_date || 'No especificada'}

${formData.message ? `Mensaje del cliente:\n${formData.message}` : ''}`,
      });

      // Determinar emails de destino para financiamiento
      const financeEmails =
        client?.contact?.finance_emails &&
        client.contact.finance_emails.length > 0
          ? client.contact.finance_emails
          : [client?.contact?.email || ''];

      // Enviar email al cliente/automotora
      const emailResult = await sendEmail({
        to: financeEmails,
        subject: `Solicitud de Financiamiento${
          selectedVehicle ? `: ${vehicleInfo.brand} ${vehicleInfo.model}` : ''
        }`,
        content: emailContent,
      });

      if (!emailResult.success) {
        console.error(
          'Error al enviar el email a la automotora:',
          emailResult.error
        );
        // Continue with flow even if email fails
      }

      // Enviar email al vendedor si el vehículo tiene un seller_id asociado
      if (selectedVehicle?.seller_id) {
        try {
          // Obtener email del vendedor
          const { data: sellerData, error: sellerError } = await supabase
            .from('users')
            .select('email, first_name, last_name')
            .eq('id', selectedVehicle.seller_id)
            .single();

          if (!sellerError && sellerData?.email) {
            const sellerEmailResult = await sendEmail({
              to: [sellerData.email],
              subject: `Solicitud de Financiamiento para tu vehículo: ${vehicleInfo.brand} ${vehicleInfo.model}`,
              content: emailContent,
            });

            if (!sellerEmailResult.success) {
              console.error(
                'Error al enviar el email al vendedor:',
                sellerEmailResult.error
              );
            } else {
              console.log(
                `Email enviado al vendedor: ${sellerData.first_name} ${sellerData.last_name} (${sellerData.email})`
              );
            }
          }
        } catch (sellerEmailError) {
          console.error(
            'Error al procesar el envío de email al vendedor:',
            sellerEmailError
          );
        }
      }

      /*    // Clear form after successful submission
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        vehicle_id: '',
        message: '',
        down_payment: '',
        monthly_income: '',
        employment_type: '',
        rut: '',
        birth_date: '',
      });
 */
      // Show success modal
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error al procesar el formulario:', error);

      // More specific message based on error type
      let errorMessage =
        'Hubo un error al enviar tu solicitud. Por favor intenta nuevamente.';

      if (error.message?.includes('email')) {
        errorMessage =
          'No se pudo enviar la notificación por email, pero tu solicitud fue registrada. Te contactaremos pronto.';
      } else if (error.code === '23505') {
        errorMessage =
          'Ya existe una solicitud con estos datos. Por favor, verifica la información.';
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string, id: string) => {
    if (id === 'monthly_income' || id === 'down_payment') {
      // Remove non-numeric characters
      const numericValue = value.replace(/\D/g, '');

      // Format with thousand separators
      const formattedValue =
        numericValue === '' ? '' : Number(numericValue).toLocaleString('es-CL');

      setFormData((prev) => ({
        ...prev,
        [id]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  // Helper to get clean numeric value from formatted string
  const getNumericValue = (formattedValue: string): number => {
    return parseInt(formattedValue.replace(/\D/g, '') || '0');
  };

  // Helper to format vehicle information for display
  const formatVehicleOption = (vehicle: any) => {
    const brand = vehicle.brand?.name || '';
    const model = vehicle.model?.name || '';
    const year = vehicle.year || '';
    const price = vehicle.price
      ? `$${Number(vehicle.price).toLocaleString('es-CL')}`
      : '';

    return `${brand} ${model} (${year}) - ${price}`;
  };

  // Helper para obtener las opciones de actividad laboral
  const employmentTypes = [
    t('financing.employmentTypes.employeeNonProfessional'),
    t('financing.employmentTypes.employeeProfessional'),
    t('financing.employmentTypes.selfEmployedNonProfessional'),
    t('financing.employmentTypes.selfEmployedProfessional'),
    t('financing.employmentTypes.retired'),
    t('financing.employmentTypes.other'),
  ];

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white dark:bg-dark-bg transition-colors duration-300'>
      {/* Hero Section */}
      <div className='text-center mb-16'>
        <h1 className='text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl'>
          {t('financing.hero.title')}
        </h1>
        <p className='mt-4 text-xl text-gray-500 dark:text-gray-400'>
          {t('financing.hero.description')}
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-16'>
        {/* Financing Form */}
        <div className='bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-gray-200 dark:border-dark-border'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Input
                type='text'
                label={t('financing.form.firstName')}
                value={formData.first_name}
                onValueChange={(value) => handleChange(value, 'first_name')}
                isRequired
                variant='bordered'
              />
              <Input
                type='text'
                label={t('financing.form.lastName')}
                value={formData.last_name}
                onValueChange={(value) => handleChange(value, 'last_name')}
                isRequired
                variant='bordered'
              />
            </div>

            <Input
              type='email'
              label={t('financing.form.email')}
              value={formData.email}
              onValueChange={(value) => handleChange(value, 'email')}
              isRequired
              variant='bordered'
            />

            <Input
              type='tel'
              label={t('financing.form.phone')}
              value={formData.phone}
              onValueChange={(value) => handleChange(value, 'phone')}
              isRequired
              variant='bordered'
            />

            <Input
              type='text'
              label={t('financing.form.rut')}
              value={formData.rut}
              onValueChange={(value) => handleChange(value, 'rut')}
              isRequired
              variant='bordered'
            />

            <Input
              type='date'
              label={t('financing.form.birthDate')}
              value={formData.birth_date}
              onValueChange={(value) => handleChange(value, 'birth_date')}
              isRequired
              variant='bordered'
              placeholder=' '
            />

            {/* Actividad Laboral */}
            <Select
              label={t('financing.form.employmentType')}
              selectedKeys={
                formData.employment_type ? [formData.employment_type] : []
              }
              onChange={(e) => handleChange(e.target.value, 'employment_type')}
              isRequired
              variant='bordered'
            >
              {employmentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </Select>

            {/* Renta Líquida Mensual */}
            <Input
              type='text'
              label={t('financing.form.monthlyIncome')}
              value={formData.monthly_income}
              onValueChange={(value) => handleChange(value, 'monthly_income')}
              startContent='$'
              isRequired
              variant='bordered'
            />

            {/* Vehicle Selection */}
            {vehicles.filter((v) => v?.status?.name === 'Publicado').length >
            0 ? (
              <Autocomplete
                label={t('financing.form.vehicleInterest')}
                placeholder={t('financing.form.vehicleSearchPlaceholder')}
                selectedKey={formData.vehicle_id}
                onSelectionChange={(key) =>
                  handleChange(key as string, 'vehicle_id')
                }
                isRequired
                variant='bordered'
              >
                {vehicles
                  .filter((v) => v?.status?.name === 'Publicado')
                  .map((vehicle) => (
                    <AutocompleteItem key={vehicle.id} value={vehicle.id}>
                      {formatVehicleOption(vehicle)}
                    </AutocompleteItem>
                  ))}
              </Autocomplete>
            ) : (
              <div className='p-4 text-center text-gray-500 border border-gray-200 rounded-md'>
                {t('financing.form.noVehiclesAvailable')}
              </div>
            )}

            {/* Monto Pie */}
            <Input
              type='text'
              label={t('financing.form.downPayment')}
              value={formData.down_payment}
              onValueChange={(value) => handleChange(value, 'down_payment')}
              isRequired
              variant='bordered'
              startContent='$'
            />

            <Textarea
              label={t('financing.form.message')}
              value={formData.message}
              onValueChange={(value) => handleChange(value, 'message')}
              minRows={4}
              variant='bordered'
            />

            <Button
              type='submit'
              color='primary'
              fullWidth
              className='font-semibold bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/90'
              isLoading={loading}
            >
              {t('financing.form.submit')}
            </Button>
          </form>
        </div>

        {/* Information Section */}
        <div className='bg-gray-50 dark:bg-dark-card rounded-xl p-8 border border-gray-200 dark:border-dark-border'>
          <div className='space-y-8'>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              {t('financing.info.optionsTitle')}
            </h2>

            <div>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                {t('financing.info.benefitsTitle')}
              </h3>
              <ul className='mt-2 text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-5'>
                <li>{t('financing.info.benefitsList.item1')}</li>
                <li>{t('financing.info.benefitsList.item2')}</li>
                <li>{t('financing.info.benefitsList.item3')}</li>
                <li>{t('financing.info.benefitsList.item4')}</li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                {t('financing.info.requirementsTitle')}
              </h3>
              <ul className='mt-2 text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-5'>
                <li>{t('financing.info.requirementsList.item1')}</li>
                <li>{t('financing.info.requirementsList.item2')}</li>
                <li>{t('financing.info.requirementsList.item3')}</li>
                <li>{t('financing.info.requirementsList.item4')}</li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                {t('financing.info.directContactTitle')}
              </h3>
              <p className='mt-2 text-gray-600 dark:text-gray-400'>
                {t('financing.info.emailLabel')}: {client?.contact?.email}
                <br />
                {t('financing.info.phoneLabel')}: {client?.contact?.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        leadType={LeadTypes.SELL_FINANCING}
      />
    </div>
  );
};

export default FinancingPage;
