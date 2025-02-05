import { supabase } from '@/lib/supabase';
import { Vehicle } from '@/utils/types';
import { create } from 'zustand';

interface VehiclesStore {
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  fetchVehicles: (clientId: string) => Promise<void>;
}

const useVehiclesStore = create<VehiclesStore>((set) => ({
  vehicles: [],
  setVehicles: (vehicles: Vehicle[]) => set({ vehicles }),
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  error: null,

  fetchVehicles: async (clientId: string) => {
    console.log('Iniciando fetchVehicles con clientId:', clientId);
    set({ isLoading: true });
    try {
      console.log('clientId:', clientId);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, brand:brand_id(id, name), model:model_id(id, name)')
        .or(`client_id.eq.${clientId},client_id.eq.1`)
        .order('created_at', { ascending: false });
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
