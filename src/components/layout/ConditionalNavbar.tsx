'use client';

import { usePathname } from 'next/navigation';
import useClientStore from '@/store/useClientStore';
import Navbar from './Navbar';

/**
 * Shows the static Navbar ONLY when the builder is not active.
 * When builder is enabled, the BuilderNavbar component inside the builder data handles navigation.
 * Exception: /vehicles/* pages always use static navbar (they're not builder pages).
 */
export default function ConditionalNavbar() {
  const { client, isLoading } = useClientStore();
  const pathname = usePathname();

  // Always show static navbar on vehicle detail pages and other non-builder routes
  const alwaysStaticRoutes = ['/vehicles', '/embed'];
  const isStaticRoute = alwaysStaticRoutes.some(r => pathname?.startsWith(r));

  if (isStaticRoute) {
    return <Navbar />;
  }

  // While loading, show nothing — prevents flash of static navbar
  if (isLoading) return null;

  // If builder is enabled, the BuilderRenderer handles the navbar
  const config = client?.client_website_config;
  const cfg = Array.isArray(config) ? config[0] : config;
  const builderEnabled = cfg?.is_enabled && cfg?.elements_structure;

  if (builderEnabled) {
    return null;
  }

  return <Navbar />;
}
