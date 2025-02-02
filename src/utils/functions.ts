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
  transmissionType: 'Automatic' | 'Manual'
): string => {
  const transmissionTypeMap = {
    Automatic: 'Automático',
    Manual: 'Manual',
  };
  return transmissionTypeMap[transmissionType];
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
