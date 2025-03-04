'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import useClientStore from '@/store/useClientStore';
import useVehiclesStore from '@/store/useVehiclesStore';

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const { setClient, setIsLoading } = useClientStore();
  const { fetchVehicles } = useVehiclesStore();

  useEffect(() => {
    async function loadClientAndVehicles() {
      const domain = window.location.host;

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*, dealerships(*)')
        .eq('domain', domain)
        .single();

      if (clientData) {
        setClient(clientData);
        // Fetch vehicles for this client, including demo vehicles if has_demo is true
        await fetchVehicles(clientData.id, clientData.has_demo);
      }

      console.log('Client data:', clientData);
      setIsLoading(false);
    }

    loadClientAndVehicles();
  }, []);

  return children;
}
