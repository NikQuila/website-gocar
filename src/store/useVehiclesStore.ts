import { supabase } from '@/lib/supabase';
import { Vehicle } from '@/utils/types';
import { create } from 'zustand';

interface VehiclesStore {
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  fetchVehicles: (clientId: string, hasDemo?: boolean) => Promise<void>;
}

const useVehiclesStore = create<VehiclesStore>((set) => ({
  vehicles: [],
  setVehicles: (vehicles: Vehicle[]) => set({ vehicles }),
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  error: null,

  fetchVehicles: async (clientId: string, hasDemo: boolean = false) => {
    console.log(
      'Iniciando fetchVehicles con clientId:',
      clientId,
      'hasDemo:',
      hasDemo
    );
    set({ isLoading: true });
    try {
      let query = supabase.from('vehicles').select(`
          *,
          brand:brand_id(*),
          model:model_id(*),
          category_new:category_id(*),
          fuel_type_new:fuel_type_id(*),
          condition_new:condition_id(*),
          color_new:color_id(*),
          dealership:dealership_id(*)
        `);

      if (hasDemo) {
        // If has_demo is true, fetch vehicles from both the client and client_id = 1
        query = query.or(`client_id.eq.${clientId},client_id.eq.1`);
      } else {
        // Otherwise, just fetch the client's vehicles
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      });

      if (error) throw error;
      console.log('Respuesta de Supabase:', { data, error });
      set({ vehicles: data || [], error: null });
    } catch (error) {
      console.error('Error en fetchVehicles:', error);
      set({ error: (error as Error).message, vehicles: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useVehiclesStore;
