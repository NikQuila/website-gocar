'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import useClientStore from '@/store/useClientStore';
import { ClientWebsiteConfig } from '@/utils/types';
import { supabase } from '@/lib/supabase';

// Create context
const ClientWebsiteConfigContext = createContext<{
  websiteConfig: ClientWebsiteConfig | null;
  isLoading: boolean;
  error: Error | null;
}>({
  websiteConfig: null,
  isLoading: true,
  error: null,
});

// Hook to use the context
export const useWebsiteConfig = () => useContext(ClientWebsiteConfigContext);

// Provider component
export function ClientWebsiteConfigProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { client } = useClientStore();
  const [websiteConfig, setWebsiteConfig] =
    useState<ClientWebsiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!client?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching website configuration for client ID:', client.id);

        const { data, error } = await supabase
          .from('client_website_config')
          .select('*')
          .eq('client_id', client.id)
          .eq('is_enabled', true)
          .single();

        if (error) {
          console.error('Error loading website configuration:', error);
          setError(new Error(error.message));
          setIsLoading(false);
          return;
        }

        console.log('Website config loaded:', data);
        setWebsiteConfig(data as ClientWebsiteConfig);
      } catch (err) {
        console.error('Failed to fetch website configuration:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [client?.id]);

  return (
    <ClientWebsiteConfigContext.Provider
      value={{ websiteConfig, isLoading, error }}
    >
      {children}
    </ClientWebsiteConfigContext.Provider>
  );
}
