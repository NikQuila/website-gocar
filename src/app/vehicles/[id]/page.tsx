import { getVehicleById } from '@/lib/vehicles';
import { Metadata } from 'next';
import VehicleDetailsPageClient from './VehicleDetailsPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    return {
      title: 'Vehículo no encontrado',
      description: 'Este vehículo no existe.',
    };
  }

  const newTitle = `${vehicle.brand?.name || ''} ${vehicle.model?.name || ''} ${vehicle.year || ''}`.trim();
  const description = vehicle.description || `${newTitle} disponible en GoCar`;

  return {
    title: newTitle,
    description,
    openGraph: {
      title: newTitle,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: newTitle,
      description,
    },
  };
}

export default function VehicleDetailsPage() {
  return <VehicleDetailsPageClient />;
}
