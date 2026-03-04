import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute['sitemap']> {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost';
  const baseUrl = `https://${host}`;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  );

  // Get client by domain to filter vehicles
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('domain', host)
    .single();

  // Static pages
  const staticPages: MetadataRoute['sitemap'] = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/vehicles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/financing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/consignments`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/buy-direct`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/we-search-for-you`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  if (!client) {
    return staticPages;
  }

  // Fetch all active vehicles for this client
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, updated_at')
    .eq('client_id', client.id)
    .eq('status', 'available');

  const vehiclePages: MetadataRoute['sitemap'] = (vehicles || []).map((vehicle) => ({
    url: `${baseUrl}/vehicles/${vehicle.id}`,
    lastModified: vehicle.updated_at ? new Date(vehicle.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...vehiclePages];
}
