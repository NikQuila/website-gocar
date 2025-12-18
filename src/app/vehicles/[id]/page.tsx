import { getVehicleById } from '@/lib/vehicles';
import { Metadata, ResolvingMetadata } from 'next';
import VehicleDetailsPageClient from './VehicleDetailsPageClient';

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent?: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    return {
      title: 'Vehículo no encontrado',
      description: 'Este vehículo no existe.',
    };
  }

  const newTitle = `${vehicle.brand.name} ${vehicle.model.name} ${vehicle.year}`;

  return {
    title: newTitle,
    description: vehicle.description,
    openGraph: {
      title: newTitle,
      description: vehicle.description,
      images: [vehicle.main_image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: newTitle,
      description: vehicle.description,
      images: [vehicle.main_image],
    },
  };
}

export default function VehicleDetailsPage() {
  return <VehicleDetailsPageClient />;
}
