import { supabase } from '@/lib/supabase';
import { ClientWebsiteConfig } from '@/utils/types';

export async function getWebsiteConfig(
  clientId: string
): Promise<ClientWebsiteConfig | null> {
  if (!clientId) return null;

  try {
    console.log('Fetching website configuration for client ID:', clientId);

    const { data, error } = await supabase
      .from('client_website_config')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error) {
      console.error('Error loading website configuration:', error);
      return null;
    }

    return data as ClientWebsiteConfig;
  } catch (error) {
    console.error('Failed to fetch website configuration:', error);
    return null;
  }
}
