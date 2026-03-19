'use client';

import { usePathname } from 'next/navigation';
import useClientStore from '@/store/useClientStore';
import Navbar from './Navbar';

/**
 * Renders the static Navbar only when the builder is NOT active on this route.
 * The builder provides its own BuilderNavbar only on the home page ("/"),
 * so we hide the static navbar only there. All other routes always get it.
 */
export default function ConditionalNavbar() {
  const { client } = useClientStore();
  const pathname = usePathname();

  const config = client?.client_website_config;
  const cfg = Array.isArray(config) ? config[0] : config;

  const builderEnabled = cfg?.is_enabled && cfg?.elements_structure;

  if (builderEnabled && pathname === '/') return null;

  return <Navbar />;
}
