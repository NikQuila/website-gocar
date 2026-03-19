'use client';

import { usePathname } from 'next/navigation';
import useClientStore from '@/store/useClientStore';
import { Footer } from './Footer';

/**
 * Renders the static Footer only when the builder is NOT active on this route.
 * The builder provides its own Footer only on the home page ("/"),
 * so we hide the static footer only there. All other routes always get it.
 */
export default function ConditionalFooter() {
  const { client } = useClientStore();
  const pathname = usePathname();

  const config = client?.client_website_config;
  const cfg = Array.isArray(config) ? config[0] : config;

  const builderEnabled = cfg?.is_enabled && cfg?.elements_structure;

  if (builderEnabled && pathname === '/') return null;

  return <Footer />;
}
