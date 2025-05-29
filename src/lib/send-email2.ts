import { supabase } from '@/lib/supabase';

export function createFinancingLeadEmailTemplate({
  customerName,
  customerEmail,
  customerPhone,
  customerRut,
  vehicleDetails,
  additionalMessage,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerRut: string;
  vehicleDetails: {
    brand: string;
    model: string;
    year: string;
    plate?: string;
    price?: string;
  };
  additionalMessage?: string;
}): string {
  // Formatear los valores del vehículo para mejor visualización
  const formattedVehicleDetails = {
    brand: vehicleDetails.brand || 'No especificado',
    model: vehicleDetails.model || 'No especificado',
    year: vehicleDetails.year || 'No especificado',
    plate: vehicleDetails.plate || 'No especificado',
    price: vehicleDetails.price
      ? `$${vehicleDetails.price}`
      : 'No especificado',
  };

  // Extraer información financiera del mensaje adicional
  let actividadLaboral = 'No especificado';
  let rentaMensual = 'No especificado';
  let pie = 'No especificado';
  let fechaNacimiento = 'No especificada';
  let mensajeCliente = '';
  if (additionalMessage) {
    const matchActividad = additionalMessage.match(/- Actividad Laboral: (.*)/);
    const matchRenta = additionalMessage.match(
      /- Renta Líquida Mensual: \$(.*)/
    );
    const matchPie = additionalMessage.match(/- Monto Pie: \$(.*)/);
    const matchFecha = additionalMessage.match(/- Fecha de Nacimiento: (.*)/);
    const matchMensaje = additionalMessage.match(
      /Mensaje del cliente:\n([\s\S]*)/
    );
    if (matchActividad) actividadLaboral = matchActividad[1].trim();
    if (matchRenta) rentaMensual = `$${matchRenta[1].trim()}`;
    if (matchPie) pie = `$${matchPie[1].trim()}`;
    if (matchFecha) fechaNacimiento = matchFecha[1].trim();
    if (matchMensaje) mensajeCliente = matchMensaje[1].trim();
  }

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuevo Lead de Financiamiento</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; color: #333; background: #f8f9fa;">
      <div style="background: #f1f8fe; border-left: 6px solid #51bde5; border-radius: 10px; padding: 0 0 24px 0;">
        <!-- Header -->
        <div style="background-color: #51bde5; padding: 24px 24px 20px 24px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 26px;">Nuevo Lead: Financiamiento</h1>
        </div>
        <!-- Bloque Cliente -->
        <div style="padding: 24px 24px 0 24px;">
          <h2 style="color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;">Información del Cliente</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr><td style="padding: 7px 0; width: 180px;"><strong>Nombre:</strong></td><td style="padding: 7px 0;">${customerName}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Email:</strong></td><td style="padding: 7px 0;"><a href="mailto:${customerEmail}" style="color: #51bde5; text-decoration: none;">${customerEmail}</a></td></tr>
            <tr><td style="padding: 7px 0;"><strong>Teléfono:</strong></td><td style="padding: 7px 0;"><a href="tel:${customerPhone}" style="color: #51bde5; text-decoration: none;">${customerPhone}</a></td></tr>
            <tr><td style="padding: 7px 0;"><strong>Rut:</strong></td><td style="padding: 7px 0;">${
              customerRut || 'No especificado'
            }</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Fecha de nacimiento:</strong></td><td style="padding: 7px 0;">${fechaNacimiento}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Actividad laboral:</strong></td><td style="padding: 7px 0;">${actividadLaboral}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Renta líquida mensual:</strong></td><td style="padding: 7px 0;">${rentaMensual}</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Pie:</strong></td><td style="padding: 7px 0;">${pie}</td></tr>
          </table>
        </div>
        <!-- Bloque Vehículo -->
        <div style="padding: 24px 24px 0 24px;">
          <h2 style="color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;">Detalles del Vehículo</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr><td style="padding: 7px 0; width: 180px;"><strong>Marca:</strong></td><td style="padding: 7px 0;">${
              formattedVehicleDetails.brand
            }</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Modelo:</strong></td><td style="padding: 7px 0;">${
              formattedVehicleDetails.model
            }</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Año:</strong></td><td style="padding: 7px 0;">${
              formattedVehicleDetails.year
            }</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Placa:</strong></td><td style="padding: 7px 0;">${
              formattedVehicleDetails.plate
            }</td></tr>
            <tr><td style="padding: 7px 0;"><strong>Precio:</strong></td><td style="padding: 7px 0;">${
              formattedVehicleDetails.price
            }</td></tr>
          </table>
        </div>
        <!-- Mensaje del cliente -->
        ${
          mensajeCliente
            ? `<div style=\"padding: 24px 24px 0 24px;\"><h2 style=\"color: #222; font-size: 18px; margin: 0 0 18px 0; letter-spacing: 1px;\">Mensaje del cliente</h2><div style=\"padding: 10px 0; white-space: pre-wrap; font-size: 15px;\">${mensajeCliente}</div></div>`
            : ''
        }
        <!-- CTA Button -->
        <div style="margin: 30px 0 0 0; text-align: center;">
          <a href="https://portal.goauto.cl/leads" 
             style="background-color: #51bde5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Ver detalles en el Portal
          </a>
        </div>
        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #ddd; margin-top: 32px; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">
            Este es un email automático generado por <a href="https://goauto.cl" style="color: #51bde5; text-decoration: none;">GoAuto</a>. 
            <br>Por favor no responda a este mensaje.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendEmail(options: {
  to: string[];
  subject: string;
  content: string;
  from?: string;
  template_id?: string;
  template_data?: Record<string, any>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: options.to,
        subject: options.subject,
        content: options.content,
        from: options.from,
        template_id: options.template_id,
        template_data: options.template_data,
      },
    });

    if (error) {
      console.warn('Error using Supabase SDK, trying fallback method:', error);
      // Si falla el SDK, intentar con el método de fetch directo
      await sendEmailFallback(options);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al enviar el email',
    };
  }
}

async function sendEmailFallback(options: {
  to: string[];
  subject: string;
  content: string;
  from?: string;
  template_id?: string;
  template_data?: Record<string, any>;
}): Promise<void> {
  const response = await fetch(
    'https://miuiujntdjrjhhcysiba.supabase.co/functions/v1/send-email',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        content: options.content,
        from: options.from,
        template_id: options.template_id,
        template_data: options.template_data,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Error al enviar el email');
  }
}
