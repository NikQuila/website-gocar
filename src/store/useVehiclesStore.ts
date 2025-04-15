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
      // Realizar una consulta simple para obtener los vehículos con estados Publicado o Vendido
      let query = supabase.from('vehicles').select(`
          *,
          brand:brand_id(*),
          model:model_id(*),
          category:category_id(*),
          fuel_type:fuel_type_id(*),
          condition:condition_id(*),
          status:clients_vehicles_states(*),
          color:color_id(*),
          dealership:dealership_id(*)
        `);

      // Filtrado por cliente
      if (hasDemo) {
        // Si has_demo es true, obtenemos vehículos del cliente y del cliente_id = 1
        query = query.or(`client_id.eq.${clientId},client_id.eq.1`);
      } else {
        // Solo obtenemos los vehículos del cliente
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      });

      if (error) throw error;

      // Filtrar los resultados en memoria para quedarnos solo con los publicados o vendidos
      const filteredVehicles =
        data?.filter(
          (vehicle) =>
            vehicle.status?.name === 'Publicado' ||
            vehicle.status?.name === 'Vendido' ||
            vehicle.status?.name === 'Reservado'
        ) || [];

      console.log('Vehículos filtrados:', filteredVehicles.length);
      set({ vehicles: filteredVehicles, error: null });
    } catch (error) {
      console.error('Error en fetchVehicles:', error);
      set({ error: (error as Error).message, vehicles: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useVehiclesStore;
