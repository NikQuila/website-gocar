import { Metadata } from 'next';
import { getClient } from '@/hooks/useClient';

export async function generateMetadata(): Promise<Metadata> {
  const client = await getClient();
  const clientName = client?.seo?.title || client?.name || 'Automotora';

  return {
    title: 'Compra Directa',
    description: `Vende tu vehículo directamente a ${clientName}. Recibe una oferta rápida y justa por tu auto.`,
    alternates: {
      canonical: '/buy-direct',
    },
  };
}

export default function BuyDirectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
