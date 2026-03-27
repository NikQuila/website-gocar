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
import { LeadTypes, Brand, Model, Condition, Vehicle } from '@/utils/types';
import { sendEmail, createVehicleLeadEmailTemplate } from '@/lib/send-email';
import SuccessModal from '@/components/ui/SuccessModal';
import { useTranslation } from '@/i18n/hooks/useTranslation';

interface FormStyleProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
}

const BuyDirectForm = ({ title, subtitle, bgColor, textColor, accentColor }: FormStyleProps = {}) => {
  // When builder passes bgColor, use inline styles. Otherwise use default Tailwind classes.
  const hasBuilderStyles = !!bgColor;
  const cardStyle = hasBuilderStyles
    ? { backgroundColor: bgColor, borderColor: textColor ? `${textColor}15` : undefined }
    : undefined;
  const cardClass = hasBuilderStyles
    ? 'rounded-xl shadow-lg p-8 border'
    : 'bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-gray-200 dark:border-dark-border';
  const infoCardStyle = hasBuilderStyles
    ? { backgroundColor: bgColor ? `${bgColor}f0` : undefined, borderColor: textColor ? `${textColor}15` : undefined }
    : undefined;
  const infoCardClass = hasBuilderStyles
    ? 'rounded-xl p-8 border'
    : 'bg-gray-50 dark:bg-dark-card rounded-xl p-8 border border-gray-200 dark:border-dark-border';
  const titleStyle = hasBuilderStyles ? { color: textColor } : undefined;
  const titleClass = hasBuilderStyles ? 'text-3xl sm:text-4xl font-extrabold' : 'text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white';
  const subtitleStyle = hasBuilderStyles ? { color: textColor, opacity: 0.6 } : undefined;
  const subtitleClass = hasBuilderStyles ? 'mt-4 text-lg' : 'mt-4 text-lg text-gray-500 dark:text-gray-400';
  const headingStyle = hasBuilderStyles ? { color: textColor } : undefined;
  const headingClass = hasBuilderStyles ? 'text-2xl font-bold' : 'text-2xl font-bold text-gray-900 dark:text-white';
  const subHeadingClass = hasBuilderStyles ? 'text-lg font-medium' : 'text-lg font-medium text-gray-900 dark:text-white';
  const bodyStyle = hasBuilderStyles ? { color: textColor, opacity: 0.7 } : undefined;
  const bodyClass = hasBuilderStyles ? '' : 'text-gray-600 dark:text-gray-400';

  const { client } = useClientStore();
  const { initializeCustomer } = useCustomerStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    brand_id: '',
    model_id: '',
    vehicle_year: '',
    vehicle_mileage: '',
    condition_id: '',
    asking_price: '',
    message: '',
  });

  // Fetch brands, models, and conditions on component mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch brands
      const { data: brandsData } = await supabase.from('brands').select('*');
      if (brandsData) setBrands(brandsData);

      // Fetch conditions
      const { data: conditionsData } = await supabase
        .from('conditions')
        .select('*');
      if (conditionsData) setConditions(conditionsData);
    };

    fetchData();
  }, []);

  // Fetch models when brand changes
  useEffect(() => {
    if (selectedBrandId) {
      const fetchModels = async () => {
        const { data } = await supabase
          .from('models')
          .select('*')
          .eq('brand_id', selectedBrandId);

        if (data) setModels(data);
      };

      fetchModels();
    } else {
      setModels([]);
    }
  }, [selectedBrandId]);

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
      });

      // 2. Create vehicle
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert([
          {
            client_id: client?.id,
            brand_id: formData.brand_id,
            model_id: formData.model_id,
            year: parseInt(formData.vehicle_year),
            mileage: parseInt(formData.vehicle_mileage),
            condition_id: formData.condition_id,
            price: formData.asking_price
              ? parseInt(formData.asking_price.replace(/\D/g, ''))
              : null,
            show_in_stock: false,
          },
        ])
        .select()
        .single();

      if (vehicleError) throw vehicleError;

      // 3. Create lead
      const { error: leadError } = await supabase.from('leads').insert([
        {
          client_id: client?.id,
          customer_id: customerResponse.id,
          vehicle_id: vehicle.id,
          type: LeadTypes.BUY_DIRECT,
          status: 'pending',
          notes: formData.message,
        },
      ]);

      if (leadError) throw leadError;

      // 4. Send email notification
      const selectedBrand =
        brands.find((b) => b.id === formData.brand_id)?.name || '';
      const selectedModel =
        models.find((m) => m.id === parseInt(formData.model_id))?.name || '';
      const selectedCondition =
        conditions.find((c) => c.id === parseInt(formData.condition_id))
          ?.name || '';

      // Format price with thousands separators
      const formattedPrice = formData.asking_price
        ? parseInt(formData.asking_price.replace(/\D/g, '')).toLocaleString(
            'es-CL'
          )
        : '';

      // Usar la función de email
      const emailContent = createVehicleLeadEmailTemplate({
        leadType: LeadTypes.BUY_DIRECT,
        customerName: `${formData.first_name} ${formData.last_name}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        vehicleDetails: {
          brand: selectedBrand,
          model: selectedModel,
          year: formData.vehicle_year,
          mileage: formData.vehicle_mileage,
          condition: selectedCondition,
          price: formattedPrice,
        },
        additionalMessage: formData.message,
      });

      // Determinar emails de destino para compras
      const buyEmails =
        client?.contact?.buy_emails && client.contact.buy_emails.length > 0
          ? client.contact.buy_emails
          : [client?.contact?.email || ''];

      const emailResult = await sendEmail({
        to: buyEmails,
        subject: `Solicitud de Compra: ${selectedBrand} ${selectedModel} (${formData.vehicle_year})`,
        content: emailContent,
      });

      if (!emailResult.success) {
        console.error('Error al enviar el email:', emailResult.error);
        // Continuar con el flujo aunque el email falle
        // La solicitud ya se guardó en la base de datos
      }

      // Clear form after successful submission
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        brand_id: '',
        model_id: '',
        vehicle_year: '',
        vehicle_mileage: '',
        condition_id: '',
        asking_price: '',
        message: '',
      });

      // Mostrar modal de éxito en lugar de alert
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error al procesar el formulario:', error);

      // Mensaje más específico según el tipo de error
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
    if (id === 'asking_price') {
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

    // Update selected brand when brand changes
    if (id === 'brand_id') {
      setSelectedBrandId(value);
      // Reset model when brand changes
      setFormData((prev) => ({ ...prev, model_id: '' }));
    }
  };

  return (
    <div data-form-section="buy-direct">
      {title && (
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h1 className={titleClass} style={titleStyle}>{title}</h1>
          {subtitle && <p className={subtitleClass} style={subtitleStyle}>{subtitle}</p>}
        </div>
      )}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-16'>
        {/* Sale Form */}
        <div className={cardClass} style={cardStyle}>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Input
                type='text'
                label={t('buyDirect.form.firstName')}
                value={formData.first_name}
                onValueChange={(value) => handleChange(value, 'first_name')}
                isRequired
                variant='bordered'
              />
              <Input
                type='text'
                label={t('buyDirect.form.lastName')}
                value={formData.last_name}
                onValueChange={(value) => handleChange(value, 'last_name')}
                isRequired
                variant='bordered'
              />
            </div>

            <Input
              type='email'
              label={t('buyDirect.form.email')}
              value={formData.email}
              onValueChange={(value) => handleChange(value, 'email')}
              isRequired
              variant='bordered'
            />

            <Input
              type='tel'
              label={t('buyDirect.form.phone')}
              value={formData.phone}
              onValueChange={(value) => handleChange(value, 'phone')}
              isRequired
              variant='bordered'
            />

            {/* Vehicle Info */}
            <Autocomplete
              label={t('buyDirect.form.brand')}
              placeholder={t('buyDirect.form.brandPlaceholder')}
              selectedKey={formData.brand_id}
              onSelectionChange={(key) =>
                handleChange(key as string, 'brand_id')
              }
              isRequired
              variant='bordered'
            >
              {brands.map((brand) => (
                <AutocompleteItem key={brand.id} value={brand.id}>
                  {brand.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>

            <Autocomplete
              label={t('buyDirect.form.model')}
              placeholder={t('buyDirect.form.modelPlaceholder')}
              selectedKey={formData.model_id}
              onSelectionChange={(key) =>
                handleChange(key as string, 'model_id')
              }
              isRequired
              isDisabled={!selectedBrandId}
              variant='bordered'
            >
              {models.map((model) => (
                <AutocompleteItem
                  key={model.id.toString()}
                  value={model.id.toString()}
                >
                  {model.name}
                </AutocompleteItem>
              ))}
            </Autocomplete>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Input
                type='text'
                label={t('buyDirect.form.year')}
                value={formData.vehicle_year}
                onValueChange={(value) => handleChange(value, 'vehicle_year')}
                isRequired
                variant='bordered'
              />
              <Input
                type='text'
                label={t('buyDirect.form.mileage')}
                value={formData.vehicle_mileage}
                onValueChange={(value) =>
                  handleChange(value, 'vehicle_mileage')
                }
                isRequired
                variant='bordered'
              />
            </div>

            <Select
              label={t('buyDirect.form.condition')}
              selectedKeys={
                formData.condition_id ? [formData.condition_id] : []
              }
              onChange={(e) => handleChange(e.target.value, 'condition_id')}
              isRequired
              variant='bordered'
            >
              {conditions.map((condition) => (
                <SelectItem
                  key={condition.id.toString()}
                  value={condition.id.toString()}
                >
                  {condition.name}
                </SelectItem>
              ))}
            </Select>

            <Input
              type='text'
              label={t('buyDirect.form.askingPrice')}
              value={formData.asking_price}
              onValueChange={(value) => handleChange(value, 'asking_price')}
              startContent='$'
              variant='bordered'
              isRequired
            />

            <Textarea
              label={t('buyDirect.form.message')}
              value={formData.message}
              onValueChange={(value) => handleChange(value, 'message')}
              minRows={4}
              variant='bordered'
            />

            <Button
              type='submit'
              color='primary'
              fullWidth
              className='font-semibold bg-primary text-secondary hover:bg-primary/90 dark:bg-primary dark:text-secondary dark:hover:bg-primary/90'
              style={accentColor ? { backgroundColor: accentColor } : undefined}
              isLoading={loading}
            >
              {t('buyDirect.form.submit')}
            </Button>
          </form>
        </div>

        {/* Information Section */}
        <div className={infoCardClass} style={infoCardStyle}>
          <div className='space-y-8'>
            <h2 className={headingClass} style={headingStyle}>
              {t('buyDirect.info.advantagesTitle')}
            </h2>

            <div>
              <h3 className={subHeadingClass} style={headingStyle}>
                {t('buyDirect.info.benefitsTitle')}
              </h3>
              <ul className={`mt-2 space-y-2 list-disc pl-5 ${bodyClass}`} style={bodyStyle}>
                <li>{t('buyDirect.info.benefitsList.item1')}</li>
                <li>{t('buyDirect.info.benefitsList.item2')}</li>
                <li>{t('buyDirect.info.benefitsList.item3')}</li>
                <li>{t('buyDirect.info.benefitsList.item4')}</li>
                <li>{t('buyDirect.info.benefitsList.item5')}</li>
              </ul>
            </div>

            <div>
              <h3 className={subHeadingClass} style={headingStyle}>
                {t('buyDirect.info.processTitle')}
              </h3>
              <ol className={`mt-2 space-y-2 list-decimal pl-5 ${bodyClass}`} style={bodyStyle}>
                <li>{t('buyDirect.info.processList.step1')}</li>
                <li>{t('buyDirect.info.processList.step2')}</li>
                <li>{t('buyDirect.info.processList.step3')}</li>
                <li>{t('buyDirect.info.processList.step4')}</li>
                <li>{t('buyDirect.info.processList.step5')}</li>
              </ol>
            </div>

            <div>
              <h3 className={subHeadingClass} style={headingStyle}>
                {t('buyDirect.info.directContactTitle')}
              </h3>
              <p className={`mt-2 ${bodyClass}`} style={bodyStyle}>
                {t('buyDirect.info.emailLabel')}: {client?.contact?.email}
                <br />
                {t('buyDirect.info.phoneLabel')}: {client?.contact?.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        leadType={LeadTypes.BUY_DIRECT}
      />
    </div>
  );
};

export default BuyDirectForm;
