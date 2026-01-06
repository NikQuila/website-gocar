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
          dealership:dealership_id(*),
          vehicles_sales!vehicle_id(*),
          vehicles_reservations!vehicle_id(*)
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

      // Process event_date for Vendido/Reservado vehicles
      const processedData =
        data?.map((vehicle: any) => {
          let event_date: string | undefined;

          // Process sale date for Vendido vehicles
          if (vehicle.status?.name === 'Vendido' && vehicle.vehicles_sales) {
            if (
              Array.isArray(vehicle.vehicles_sales) &&
              vehicle.vehicles_sales.length > 0
            ) {
              const sortedSales = [...vehicle.vehicles_sales].sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              );
              event_date = sortedSales[0].created_at;
            } else if (
              !Array.isArray(vehicle.vehicles_sales) &&
              (vehicle.vehicles_sales as { created_at: string }).created_at
            ) {
              event_date = (vehicle.vehicles_sales as { created_at: string })
                .created_at;
            }
          }
          // Process reservation date for Reservado vehicles
          else if (
            vehicle.status?.name === 'Reservado' &&
            vehicle.vehicles_reservations
          ) {
            if (
              Array.isArray(vehicle.vehicles_reservations) &&
              vehicle.vehicles_reservations.length > 0
            ) {
              const sortedReservations = [
                ...vehicle.vehicles_reservations,
              ].sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              );
              event_date = sortedReservations[0].created_at;
            } else if (
              !Array.isArray(vehicle.vehicles_reservations) &&
              (vehicle.vehicles_reservations as { created_at: string })
                .created_at
            ) {
              event_date = (
                vehicle.vehicles_reservations as { created_at: string }
              ).created_at;
            }
          }

          return { ...vehicle, event_date };
        }) || [];

      // Apply 3-day filter for sold/reserved vehicles
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      threeDaysAgo.setHours(0, 0, 0, 0);

      // Filtrar los resultados en memoria para quedarnos solo con los publicados o vendidos recientes (3 días)
      // Use show_in_web field if defined, fallback to name-based logic for backward compatibility
      const filteredVehicles = processedData.filter((vehicle) => {
        if (!vehicle.status) return false;

        // Determine if vehicle should be shown based on show_in_web or fallback to names
        let shouldShow = false;
        if (typeof vehicle.status.show_in_web === 'boolean') {
          shouldShow = vehicle.status.show_in_web;
        } else {
          // Fallback: use name-based filtering for legacy states without show_in_web
          shouldShow = ['Publicado', 'Reservado', 'Vendido'].includes(vehicle.status.name || '');
        }

        if (!shouldShow) return false;

        // For sold or reserved vehicles, check if they are within 3 days
        if (
          vehicle.status?.name === 'Vendido' ||
          vehicle.status?.name === 'Reservado'
        ) {
          if (vehicle.event_date) {
            const eventDate = new Date(vehicle.event_date);
            return eventDate >= threeDaysAgo;
          }
          return false; // Exclude if sold/reserved but no event_date
        }

        return true; // Keep other visible statuses
      });

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
