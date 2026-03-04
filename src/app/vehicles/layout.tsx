import { Metadata } from 'next';
import { getClient } from '@/hooks/useClient';

export async function generateMetadata(): Promise<Metadata> {
  const client = await getClient();
  const clientName = client?.seo?.title || client?.name || 'Automotora';

  return {
    title: 'Vehículos',
    description: `Explora nuestro inventario de vehículos en ${clientName}. Encuentra autos nuevos y usados al mejor precio.`,
    alternates: {
      canonical: '/vehicles',
    },
  };
}

export default function VehiclesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
