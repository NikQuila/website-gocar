'use client';

import { usePathname } from 'next/navigation';
import useClientStore from '@/store/useClientStore';
import Navbar from './Navbar';

/**
 * Shows the static Navbar ONLY when the builder is not active.
 * When builder is enabled, the BuilderNavbar component inside the builder data handles navigation.
 * Exception: /embed pages always use static navbar.
 * /vehicles pages use static navbar only when builder is NOT enabled.
 */
export default function ConditionalNavbar() {
  const { client, isLoading } = useClientStore();
  const pathname = usePathname();

  // Embed pages always use static navbar
  if (pathname?.startsWith('/embed')) {
    return <Navbar />;
  }

  // While loading, show nothing — prevents flash of static navbar
  if (isLoading) return null;

  // If builder is enabled, the BuilderRenderer handles the navbar (including on /vehicles)
  const config = client?.client_website_config;
  const cfg = Array.isArray(config) ? config[0] : config;
  const builderEnabled = cfg?.is_enabled && cfg?.elements_structure;

  if (builderEnabled) {
    // On /vehicles, we still need a navbar since builder doesn't render on this route
    // Use the static Navbar but builder theme/colors are already applied by ThemeProvider
    if (pathname?.startsWith('/vehicles')) {
      return <Navbar />;
    }
    return null;
  }

  return <Navbar />;
}
