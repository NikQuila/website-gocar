import { getVehicleById } from '@/lib/vehicles';
import { headers } from 'next/headers';
import { Metadata } from 'next';
import VehicleDetailsPageClient from './VehicleDetailsPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const headersList = await headers();
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || '';
  const baseUrl = `https://${host}`;

  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    return {
      title: 'Vehículo no encontrado',
      description: 'Este vehículo no existe.',
    };
  }

  const newTitle = `${vehicle.brand?.name || ''} ${vehicle.model?.name || ''} ${vehicle.year || ''}`.trim();
  const description = vehicle.description || `${newTitle} disponible`;

  // Use vehicle's main image directly for fast OG previews
  // The dynamic ImageResponse API was too slow (3-5s) causing WhatsApp timeouts
  const ogImageUrl = vehicle.main_image || `${baseUrl}/api/og/${id}`;

  return {
    title: newTitle,
    description,
    alternates: {
      canonical: `/vehicles/${id}`,
    },
    openGraph: {
      title: newTitle,
      description,
      type: 'article',
      url: `${baseUrl}/vehicles/${id}`,
      images: [{
        url: ogImageUrl,
        alt: newTitle,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: newTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function VehicleDetailsPage() {
  return <VehicleDetailsPageClient />;
}
