'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import useClientStore from '@/store/useClientStore';
import useVehiclesStore from '@/store/useVehiclesStore';
import { useInitializeStore } from '@/hooks/useInitializeStore';
import { useLanguageStore, isValidLanguage } from '@/store/useLanguageStore';

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const { setClient, setIsLoading } = useClientStore();
  const { fetchVehicles } = useVehiclesStore();
  const { isLoading } = useInitializeStore();
  const { setLanguage } = useLanguageStore();

  useEffect(() => {
    async function loadClientAndVehicles() {
      const domain = window.location.host;

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*, dealerships(*), client_website_config(*)')
        .eq('domain', domain)
        .single();

      if (clientData) {
        setClient(clientData);
        // Fetch vehicles for this client, including demo vehicles if has_demo is true
        await fetchVehicles(clientData.id, clientData.has_demo);

        // Initialize language from client default if no user preference is persisted
        try {
          const persisted = localStorage.getItem('language-storage');
          const parsed = persisted ? JSON.parse(persisted) : null;
          const existing = parsed?.state?.currentLanguage as string | undefined;
          const clientDefault = (clientData as any)?.default_language as
            | string
            | undefined;
          if (!existing && clientDefault && isValidLanguage(clientDefault)) {
            setLanguage(clientDefault);
          }
        } catch (e) {
          // ignore persistence errors
        }
      }

      console.log('Client data:', clientData);
      setIsLoading(false);
    }

    loadClientAndVehicles();
  }, []);

  return children;
}
