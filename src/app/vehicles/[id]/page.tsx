import { getVehicleById } from '@/lib/vehicles';
import { getClient } from '@/hooks/useClient';
import { Metadata } from 'next';
import VehicleDetailsPageClient from './VehicleDetailsPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const [vehicle, client] = await Promise.all([
    getVehicleById(id),
    getClient(),
  ]);

  if (!vehicle) {
    return {
      title: 'Vehículo no encontrado',
      description: 'Este vehículo no existe.',
    };
  }

  const newTitle = `${vehicle.brand?.name || ''} ${vehicle.model?.name || ''} ${vehicle.year || ''}`.trim();
  const description = vehicle.description || `${newTitle} disponible`;

  const domain = client?.domain ? `https://${client.domain}` : '';
  const ogImageUrl = domain ? `${domain}/vehicles/${id}/opengraph-image` : undefined;

  return {
    title: newTitle,
    description,
    openGraph: {
      title: newTitle,
      description,
      type: 'article',
      ...(ogImageUrl && {
        images: [{
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: newTitle,
        }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: newTitle,
      description,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  };
}

export default function VehicleDetailsPage() {
  return <VehicleDetailsPageClient />;
}
