import { Metadata } from 'next';
import { getClient } from '@/hooks/useClient';

export async function generateMetadata(): Promise<Metadata> {
  const client = await getClient();
  const clientName = client?.seo?.title || client?.name || 'Automotora';

  return {
    title: 'Consignaciones',
    description: `Consigna tu vehículo con ${clientName}. Vendemos tu auto de forma rápida y segura.`,
    alternates: {
      canonical: '/consignments',
    },
  };
}

export default function ConsignmentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
