'use client';

import useClientStore from '@/store/useClientStore';
import { useEffect } from 'react';

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { client } = useClientStore();
  console.log(client);

  useEffect(() => {
    if (client?.theme) {
      document.documentElement.style.setProperty(
        '--color-primary',
        client.theme.primary
      );
      document.documentElement.style.setProperty(
        '--color-secondary',
        client.theme.secondary
      );
    }
  }, [client]);

  return <>{children}</>;
}
