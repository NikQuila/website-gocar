import { Metadata } from 'next';
import { getClient } from '@/hooks/useClient';

export async function generateMetadata(): Promise<Metadata> {
  const client = await getClient();
  const clientName = client?.seo?.title || client?.name || 'Automotora';

  return {
    title: 'Te Lo Buscamos',
    description: `¿No encuentras el vehículo que buscas? En ${clientName} te lo buscamos. Cuéntanos qué necesitas.`,
    alternates: {
      canonical: '/we-search-for-you',
    },
  };
}

export default function WeSearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
