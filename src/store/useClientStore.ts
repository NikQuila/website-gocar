import { Client } from '@/utils/types';
import { create } from 'zustand';

type ClientStore = {
  client: Client | null;
  setClient: (client: Client | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
};

const useClientStore = create<ClientStore>()((set) => ({
  client: null,
  setClient: (client: Client | null) => set({ client }),
  isLoading: true,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  error: null,
  setError: (error: string | null) => set({ error }),
}));

export default useClientStore;
