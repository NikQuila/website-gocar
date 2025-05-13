import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Customer } from '@/utils/types';
import { supabase } from '@/lib/supabase';

interface CustomerStore {
  customer: Customer | null;
  likes: string[];
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  initializeCustomer: (customerData?: Partial<Customer>) => Promise<Customer>;
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
          // Primero, buscar todos los clientes con ese email
          const { data: existingCustomersWithEmail, error: searchError } =
            await supabase
              .from('customers')
              .select('*')
              .eq('email', customerData.email);

          // Buscar si existe un cliente con el mismo email Y client_id
          const existingCustomerWithSameClientId =
            existingCustomersWithEmail?.find(
              (c) => c.client_id === customerData.client_id
            );

          if (existingCustomerWithSameClientId) {
            // Actualizar cliente existente
            const { error: updateError } = await supabase
              .from('customers')
              .update({
                first_name: customerData.first_name,
                last_name: customerData.last_name,
                phone: customerData.phone,
                rut: customerData.rut,
              })
              .eq('id', existingCustomerWithSameClientId.id);

            if (updateError) throw updateError;

            const updatedCustomer = {
              ...existingCustomerWithSameClientId,
              ...customerData,
            };
            set({ customer: updatedCustomer, isModalOpen: false });
            return updatedCustomer;
          } else {
            // Crear nuevo cliente (email diferente o mismo email pero diferente client_id)

            const { data: newCustomer, error: insertError } = await supabase
              .from('customers')
              .insert([customerData])
              .select()
              .single();

            if (insertError) throw insertError;

            set({ customer: newCustomer, isModalOpen: false });
            return newCustomer;
          }
        } catch (error) {
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

        set({ likes: newLikes, isModalOpen: false });

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
