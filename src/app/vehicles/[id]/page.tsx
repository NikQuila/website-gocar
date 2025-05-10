import { getVehicleById } from '@/lib/vehicles';
import { Metadata, ResolvingMetadata } from 'next';
import VehicleDetailsPageClient from './VehicleDetailsPageClient';

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent?: ResolvingMetadata
): Promise<Metadata> {
  const vehicle = await getVehicleById(params.id);

  if (!vehicle) {
    return {
      title: 'Vehículo no encontrado',
      description: 'Este vehículo no existe.',
    };
  }

  return {
    title: vehicle.title,
    description: vehicle.description,
    openGraph: {
      title: vehicle.title,
      description: vehicle.description,
      images: [
        {
          url: vehicle.main_image,
          width: 1200,
          height: 630,
          alt: vehicle.title,
        },
      ],

      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: vehicle.title,
      description: vehicle.description,
      images: [vehicle.main_image],
    },
  };
}

export default function VehicleDetailsPage() {
  return <VehicleDetailsPageClient />;
}
