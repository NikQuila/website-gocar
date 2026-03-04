import { Metadata } from 'next';
import { getClient } from '@/hooks/useClient';

export async function generateMetadata(): Promise<Metadata> {
  const client = await getClient();
  const clientName = client?.seo?.title || client?.name || 'Automotora';

  return {
    title: 'Contacto',
    description: `Contáctanos en ${clientName}. Estamos disponibles para ayudarte a encontrar tu vehículo ideal.`,
    alternates: {
      canonical: '/contact',
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
