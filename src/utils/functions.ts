export const mapFuelTypeToSpanish = (
  fuelType: 'Gasoline' | 'Diesel' | 'Hybrid' | 'Electric' | 'Gas'
): string => {
  const fuelTypeMap = {
    Gasoline: 'Gasolina',
    Diesel: 'Diésel',
    Hybrid: 'Híbrido',
    Electric: 'Eléctrico',
    Gas: 'Gas',
  };

  return fuelTypeMap[fuelType];
};

export const mapTransmissionTypeToSpanish = (
  transmissionType: string
): string => {
  if (transmissionType?.toLowerCase()?.includes('auto')) {
    return 'Automático';
  }

  const transmissionTypeMap: { [key: string]: string } = {
    Automatic: 'Automático',
    Manual: 'Manual',
  };

  return transmissionTypeMap[transmissionType] || transmissionType;
};

export const mapConditionTypeToSpanish = (
  conditionType: 'New' | 'Used' | 'Certified Pre-Owned'
): string => {
  const conditionTypeMap = {
    New: 'Nuevo',
    Used: 'Usado',
    'Certified Pre-Owned': 'Certificado Pre-Vendido',
  };

  return conditionTypeMap[conditionType];
};

export const contactByWhatsApp = (phone: string, message?: string): string => {
  // Remove any non-numeric characters from phone (including +)
  const cleanPhone = phone.replace(/\D/g, '');

  // Handle different phone formats
  let fullPhone = cleanPhone;
  if (cleanPhone.length === 9) {
    // Format: 955675053
    fullPhone = `56${cleanPhone}`;
  } else if (cleanPhone.length === 11) {
    // Format: 56955675053
    fullPhone = cleanPhone;
  }

  // Encode message for URL
  const encodedMessage = message ? encodeURIComponent(message) : '';

  // Generate WhatsApp URL
  const whatsappUrl = `https://wa.me/${fullPhone}${
    encodedMessage ? `?text=${encodedMessage}` : ''
  }`;

  return whatsappUrl;
};

/**
 * Normalizes builder links: converts hash-based anchors like "#contact"
 * to proper routes like "/contact". Leaves absolute URLs and already
 * correct paths unchanged.
 */
export const normalizeBuilderLink = (link: string): string => {
  if (!link) return link;
  // Already a proper path or external URL
  if (link.startsWith('/') || link.startsWith('http')) return link;
  // Convert #section to /section
  if (link.startsWith('#')) return `/${link.slice(1)}`;
  return link;
};
