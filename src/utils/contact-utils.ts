/**
 * Extrae y formatea un número de teléfono para WhatsApp desde la información de contacto
 * @param contact Objeto o string con la información de contacto
 * @returns Número de teléfono formateado para WhatsApp
 */
export const formatWhatsAppNumber = (contact: any) => {
  try {
    let phoneNumber = '';

    // Extraer el número de teléfono según el tipo de datos
    if (typeof contact === 'string') {
      try {
        // Intentar parsear como JSON
        const contactData = JSON.parse(contact);
        phoneNumber = contactData.phone || contact;
      } catch (e) {
        // Si no es JSON válido, usar el string directamente
        phoneNumber = contact;
      }
    } else if (typeof contact === 'object' && contact.phone) {
      phoneNumber = contact.phone;
    }

    const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '');

    // Dar formato adecuado para WhatsApp
    if (cleanPhone.startsWith('+')) {
      return cleanPhone.substring(1); // WhatsApp no necesita el +
    } else if (cleanPhone.startsWith('56')) {
      return cleanPhone;
    } else {
      return `56${cleanPhone}`;
    }
  } catch (error) {
    console.error('Error al formatear número de WhatsApp:', error);
  }
};
