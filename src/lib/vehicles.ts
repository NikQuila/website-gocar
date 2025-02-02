import { supabase } from './supabase';
import { Vehicle } from '../utils/types';

export const getVehiclesByClientId = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select(
        `
        *,
        brand:brand_id(id, name),
        model:model_id(id, name)
      `
      )
      .eq('client_id', clientId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

export const getVehicleById = async (vehicleId: string) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select(
        `
        *,
        brand:brand_id(id, name),
        model:model_id(id, name)
      `
      )
      .eq('id', vehicleId)
      .single();
    if (error) throw error;
    return data as Vehicle;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    throw error;
  }
};

export const incrementVehicleViews = async (vehicleId: number) => {
  try {
    const { data, error } = await supabase.rpc('increment_vehicle_views', {
      vehicle_id: vehicleId,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error incrementing vehicle views:', error);
    throw error;
  }
};
