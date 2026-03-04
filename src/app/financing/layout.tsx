import { Metadata } from 'next';
import { getClient } from '@/hooks/useClient';

export async function generateMetadata(): Promise<Metadata> {
  const client = await getClient();
  const clientName = client?.seo?.title || client?.name || 'Automotora';

  return {
    title: 'Financiamiento',
    description: `Opciones de financiamiento en ${clientName}. Cotiza tu crédito automotriz de forma rápida y sencilla.`,
    alternates: {
      canonical: '/financing',
    },
  };
}

export default function FinancingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
