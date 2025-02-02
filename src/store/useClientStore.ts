import { Client } from '@/utils/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ClientStore = {
  client: Client | null;
  setClient: (client: Client | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
};

const useClientStore = create<ClientStore>()(
  persist(
    (set) => ({
      client: null,
      setClient: (client: Client | null) => set({ client }),
      isLoading: true,
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      error: null,
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'client-storage', // unique name for localStorage key
      partialize: (state) => ({ client: state.client }), // only persist client data
    }
  )
);

/* const useClientStoreNoPersist = create<ClientStore>()((set) => ({
  client: null,
  setClient: (client: Client | null) => set({ client }),
  isLoading: true,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  error: null,
  setError: (error: string | null) => set({ error }),
})); */

export default useClientStore;
