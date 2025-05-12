import { supabase } from '@/lib/supabase';

interface EmailOptions {
  to: string[];
  subject: string;
  content: string;
  from?: string;
  template_id?: string;
  template_data?: Record<string, any>;
}

/**
 * Método de respaldo que usa fetch directo para enviar email
 * en caso que el SDK de Supabase falle
 */
async function sendEmailFallback(options: EmailOptions): Promise<void> {
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

/**
 * Envía un email utilizando la función de Supabase
 * @param options Opciones del email a enviar
 * @returns Resultado de la operación
 */
export async function sendEmail(
  options: EmailOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    // Usar el SDK de Supabase en lugar de fetch directo
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

/**
 * Crea una plantilla HTML para leads de vehículos
 */
export function createVehicleLeadEmailTemplate({
  leadType,
  customerName,
  customerEmail,
  customerPhone,
  vehicleDetails,
  additionalMessage,
}: {
  leadType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleDetails: {
    brand: string;
    model: string;
    year: string;
    mileage: string;
    condition: string;
    price?: string;
  };
  additionalMessage?: string;
}): string {
  const leadTypeMap: Record<string, string> = {
    'buy-direct': 'Venta de Vehículo',
    'buy-consignment': 'Consignación',
    'sell-financing': 'Financiamiento',
    'sell-vehicle': 'Compra de Vehículo',
  };

  const leadTypeName = leadTypeMap[leadType] || leadType;

  // Formatear los valores del vehículo para mejor visualización
  const formattedVehicleDetails = {
    brand: vehicleDetails.brand || 'No especificado',
    model: vehicleDetails.model || 'No especificado',
    year: vehicleDetails.year || 'No especificado',
    mileage: vehicleDetails.mileage
      ? `${vehicleDetails.mileage} km`
      : 'No especificado',
    condition: vehicleDetails.condition || 'No especificado',
    price: vehicleDetails.price
      ? `$${vehicleDetails.price}`
      : 'No especificado',
  };

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuevo Lead de ${leadTypeName}</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="background-color: #f8f9fa; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #51bde5; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Nuevo Lead: ${leadTypeName}</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 25px;">
          <!-- Customer Info -->
          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 0;">
              Información del Cliente
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; width: 120px;"><strong>Nombre:</strong></td>
                <td style="padding: 8px 0;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Email:</strong></td>
                <td style="padding: 8px 0;"><a href="mailto:${customerEmail}" style="color: #51bde5; text-decoration: none;">${customerEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Teléfono:</strong></td>
                <td style="padding: 8px 0;"><a href="tel:${customerPhone}" style="color: #51bde5; text-decoration: none;">${customerPhone}</a></td>
              </tr>
            </table>
          </div>
          
          <!-- Vehicle Details -->
          <div style="margin-bottom: 25px; background: #f1f8fe; padding: 20px; border-radius: 6px; border-left: 4px solid #51bde5;">
            <h2 style="color: #333; font-size: 18px; margin-top: 0; margin-bottom: 15px;">
              Detalles del Vehículo
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; width: 120px;"><strong>Marca:</strong></td>
                <td style="padding: 8px 0;">${
                  formattedVehicleDetails.brand
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Modelo:</strong></td>
                <td style="padding: 8px 0;">${
                  formattedVehicleDetails.model
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Año:</strong></td>
                <td style="padding: 8px 0;">${formattedVehicleDetails.year}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Kilometraje:</strong></td>
                <td style="padding: 8px 0;">${
                  formattedVehicleDetails.mileage
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Condición:</strong></td>
                <td style="padding: 8px 0;">${
                  formattedVehicleDetails.condition
                }</td>
              </tr>
              ${
                vehicleDetails.price
                  ? `
              <tr>
                <td style="padding: 8px 0;"><strong>Precio:</strong></td>
                <td style="padding: 8px 0;">${formattedVehicleDetails.price}</td>
              </tr>
                  `
                  : ''
              }
            </table>
          </div>
          
          <!-- Additional Message -->
          ${
            additionalMessage
              ? `
          <div style="margin-bottom: 25px;">
            <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 0;">
              Información Adicional
            </h2>
            <div style="padding: 10px 0; white-space: pre-wrap;">${additionalMessage}</div>
          </div>
              `
              : ''
          }
          
          <!-- CTA Button -->
          <div style="margin: 30px 0; text-align: center;">
            <a href="https://portal.goauto.cl/leads" 
               style="background-color: #51bde5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Ver detalles en el Portal
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #666; border-top: 1px solid #ddd;">
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
