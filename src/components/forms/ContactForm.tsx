'use client';

import { useState } from 'react';
import { Button, Input, Select, SelectItem, Textarea } from '@heroui/react';
import useClientStore from '@/store/useClientStore';
import useCustomerStore from '@/store/useCustomerStore';
import { supabase } from '@/lib/supabase';
import { Mail } from '@/utils/types';

interface FormStyleProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
}

const ContactForm = ({ title, subtitle, bgColor, textColor, accentColor }: FormStyleProps = {}) => {
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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    reason: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      // Primero inicializamos o actualizamos el customer
      const customerResponse = await initializeCustomer({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        client_id: client?.id || '',
      });

      // Guardamos el email en la base de datos
      const { error: mailError } = await supabase.from('mails').insert([
        {
          customer_id: customerResponse.id, // Usamos el ID del customer
          subject: `Nuevo contacto desde ${client?.name}`,
          body: `
Nombre: ${formData.first_name} ${formData.last_name}
Email: ${formData.email}
Teléfono: ${formData.phone}
Motivo: ${formData.reason}

Mensaje:
${formData.message}
        `,
          reason: mapReasonToType(formData.reason),
        },
      ]);

      if (mailError) throw mailError;

      // Crear la URL del mailto con los parámetros codificados
      const emailBody = `
Nuevo mensaje de contacto:

Nombre: ${formData.first_name} ${formData.last_name}
Email: ${formData.email}
Teléfono: ${formData.phone}
Motivo: ${formData.reason}

Mensaje:
${formData.message}
    `;

      const mailtoUrl = `mailto:${
        client?.contact?.email
      }?subject=Nuevo contacto desde ${client?.name}&body=${encodeURIComponent(
        emailBody
      )}`;

      // Abrir el cliente de correo predeterminado
      window.location.href = mailtoUrl;
    } catch (error) {
      console.error('Error al procesar el formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string, id: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Función auxiliar para mapear el motivo a los tipos permitidos
  const mapReasonToType = (reason: string): Mail['reason'] => {
    switch (reason) {
      case 'Compra de Vehículo':
        return 'buy';
      case 'Venta de Vehículo':
        return 'sell';
      default:
        return 'other';
    }
  };

  return (
    <div data-form-section="contact">
      {title && (
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h1 className={titleClass} style={titleStyle}>{title}</h1>
          {subtitle && <p className={subtitleClass} style={subtitleStyle}>{subtitle}</p>}
        </div>
      )}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-16'>
        {/* Contact Form */}
        <div className={cardClass} style={cardStyle}>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <Input
                type='text'
                label='Nombre'
                value={formData.first_name}
                onValueChange={(value) => handleChange(value, 'first_name')}
                isRequired
                variant='bordered'
              />
              <Input
                type='text'
                label='Apellido'
                value={formData.last_name}
                onValueChange={(value) => handleChange(value, 'last_name')}
                isRequired
                variant='bordered'
              />
            </div>

            <Input
              type='email'
              label='Email'
              value={formData.email}
              onValueChange={(value) => handleChange(value, 'email')}
              isRequired
              variant='bordered'
            />

            <Input
              type='tel'
              label='Teléfono'
              value={formData.phone}
              onValueChange={(value) => handleChange(value, 'phone')}
              isRequired
              variant='bordered'
            />

            <Select
              label='Motivo de Contacto'
              value={formData.reason}
              onChange={(e) => handleChange(e.target.value, 'reason')}
              isRequired
              variant='bordered'
            >
              <SelectItem key='Compra de Vehículo' value='Compra de Vehículo'>
                Compra de Vehículo
              </SelectItem>
              <SelectItem key='Venta de Vehículo' value='Venta de Vehículo'>
                Venta de Vehículo
              </SelectItem>
              <SelectItem key='Consulta General' value='Consulta General'>
                Consulta General
              </SelectItem>
              <SelectItem key='Otro' value='Otro'>
                Otro
              </SelectItem>
            </Select>

            <Textarea
              label='Mensaje'
              value={formData.message}
              onValueChange={(value) => handleChange(value, 'message')}
              minRows={4}
              isRequired
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
              Enviar Mensaje
            </Button>
          </form>
        </div>

        {/* Contact Information */}
        <div className={infoCardClass} style={infoCardStyle}>
          <div className='space-y-8'>
            <h2 className={headingClass} style={headingStyle}>
              Información de Contacto
            </h2>

            {/*  <div>
              <h3 className={subHeadingClass} style={headingStyle}>
                Ubicación
              </h3>
              <p className={`mt-2 ${bodyClass}`} style={bodyStyle}>
                {client?.contact?.address}
              </p>
            </div> */}

            <div>
              <h3 className={subHeadingClass} style={headingStyle}>
                Horario
              </h3>
              <p className={`mt-2 ${bodyClass}`} style={bodyStyle}>
                Lunes a Viernes: 9:00 AM - 6:00 PM
                <br />
                Sábado: 10:00 AM - 2:00 PM
                <br />
                Domingo: Cerrado
              </p>
            </div>

            <div>
              <h3 className={subHeadingClass} style={headingStyle}>
                Contacto Directo
              </h3>
              <p className={`mt-2 ${bodyClass}`} style={bodyStyle}>
                Email: {client?.contact?.email}
                <br />
                Teléfono: {client?.contact?.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
