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
      console.log(domain);
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*, dealerships(*)')
        .eq('domain', domain)
        .single();

      if (clientData) {
        setClient(clientData);
        // Fetch vehicles for this client
        await fetchVehicles(clientData.id);
      }

      console.log('Client data:', clientData);
      setIsLoading(false);
    }

    loadClientAndVehicles();
  }, []);

  return children;
}
