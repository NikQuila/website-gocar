/**
 * Extrae y formatea un número de teléfono para WhatsApp desde la información de contacto
 * @param contact Objeto o string con la información de contacto
 * @returns Número de teléfono formateado para WhatsApp
 */
export const formatWhatsAppNumber = (contact: any) => {
  try {
    if (!contact) return '56996366455';

    if (typeof contact === 'string') {
      try {
        const contactData = JSON.parse(contact);
        if (contactData.phone) {
          const cleanPhone = contactData.phone
            .replace(/\s+/g, '')
            .replace(/[()-]/g, '');
          if (cleanPhone.startsWith('+')) {
            return cleanPhone.substring(1); // WhatsApp no necesita el +
          } else if (cleanPhone.startsWith('9')) {
            return `56${cleanPhone}`;
          } else {
            return `56${cleanPhone}`;
          }
        }
      } catch (e) {
        return `56${contact.replace(/\s+/g, '')}`;
      }
    } else if (typeof contact === 'object' && contact.phone) {
      const cleanPhone = contact.phone
        .replace(/\s+/g, '')
        .replace(/[()-]/g, '');
      if (cleanPhone.startsWith('+')) {
        return cleanPhone.substring(1);
      } else {
        return `56${cleanPhone}`;
      }
    }

    return '56996366455';
  } catch (error) {
    console.error('Error al formatear número de WhatsApp:', error);
    return '56996366455';
  }
};
