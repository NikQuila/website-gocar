'use client';

import { usePathname } from 'next/navigation';
import useClientStore from '@/store/useClientStore';
import { Footer } from './Footer';

/**
 * Shows the static Footer ONLY when the builder is not active.
 * When builder is enabled, the Footer component inside the builder data handles the footer.
 * Exception: /vehicles/* pages always use static footer.
 */
export default function ConditionalFooter() {
  const { client, isLoading } = useClientStore();
  const pathname = usePathname();

  // Always show static footer on vehicle detail pages and other non-builder routes
  const alwaysStaticRoutes = ['/vehicles', '/embed'];
  const isStaticRoute = alwaysStaticRoutes.some(r => pathname?.startsWith(r));

  if (isStaticRoute) {
    return <Footer />;
  }

  // While loading, show nothing — prevents flash of static footer
  if (isLoading) return null;

  // If builder is enabled, the BuilderRenderer handles the footer
  const config = client?.client_website_config;
  const cfg = Array.isArray(config) ? config[0] : config;
  const builderEnabled = cfg?.is_enabled && cfg?.elements_structure;

  if (builderEnabled) {
    return null;
  }

  return <Footer />;
}
