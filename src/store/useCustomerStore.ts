import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer } from '@/utils/types';
import { supabase } from '@/lib/supabase';

interface CustomerStore {
  customer: Customer | null;
  likes: string[];
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  initializeCustomer: (customerData?: Partial<Customer>) => Promise<void>;
  toggleLike: (vehicleId: string) => Promise<void>;
  getLikes: () => string[];
}

const useCustomerStore = create(
  persist<CustomerStore>(
    (set, get) => ({
      customer: null,
      likes: [],
      isModalOpen: false,

      setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

      initializeCustomer: async (customerData) => {
        if (!customerData?.email) {
          throw new Error('El email es requerido');
        }

        try {
          // Buscar si existe un customer con ese email
          const { data: existingCustomerData, error: searchError } =
            await supabase
              .from('customers')
              .select('*')
              .eq('email', customerData?.email)
              .single();

          if (searchError && searchError.code !== 'PGRST116') {
            // PGRST116 es el código cuando no se encuentra
            throw searchError;
          }

          if (existingCustomerData) {
            // Si existe, actualizar el estado local con los datos de Supabase
            const updatedCustomer = {
              ...existingCustomerData,
              ...customerData,
            };

            set({ customer: updatedCustomer });

            // Opcionalmente actualizar en Supabase si hay nuevos datos
            if (customerData) {
              await supabase
                .from('customers')
                .update(customerData)
                .eq('id', existingCustomerData.id);
            }

            return;
          }

          // Si no existe, crear nuevo customer en Supabase
          const { data: newCustomerData, error: insertError } = await supabase
            .from('customers')
            .insert([
              {
                ...customerData,
              },
            ])
            .select()
            .single();

          if (insertError) throw insertError;

          // Actualizar el estado local con los datos de Supabase (incluyendo el ID generado)
          set({ customer: newCustomerData });
        } catch (error) {
          console.error('Error en initializeCustomer:', error);
          throw error;
        }
      },

      toggleLike: async (vehicleId) => {
        const { customer, likes } = get();
        const newLikes = likes.includes(vehicleId)
          ? likes.filter((id) => id !== vehicleId)
          : [...likes, vehicleId];

        if (!customer) {
          set({ isModalOpen: true });
          return;
        }

        set({ likes: newLikes });

        // Sincronizar con Supabase
        if (newLikes.includes(vehicleId)) {
          await supabase.from('vehicles_likes').insert([
            {
              vehicle_id: vehicleId,
              customer_id: customer.id,
            },
          ]);
        } else {
          await supabase
            .from('vehicles_likes')
            .delete()
            .match({ vehicle_id: vehicleId, customer_id: customer.id });
        }
      },

      getLikes: () => get().likes,
    }),
    {
      name: 'customer-storage',
    }
  )
);

export default useCustomerStore;
