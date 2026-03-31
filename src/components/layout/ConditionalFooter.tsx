'use client';

import { usePathname } from 'next/navigation';
import useClientStore from '@/store/useClientStore';
import { Footer } from './Footer';

/**
 * Shows the static Footer ONLY when the builder is not active.
 * When builder is enabled, the Footer component inside the builder data handles the footer.
 * Exception: /embed pages always use static footer.
 * /vehicles pages use static footer only when builder is NOT enabled.
 */
export default function ConditionalFooter() {
  const { client, isLoading } = useClientStore();
  const pathname = usePathname();

  // Embed pages always use static footer
  if (pathname?.startsWith('/embed')) {
    return <Footer />;
  }

  // While loading, show nothing — prevents flash of static footer
  if (isLoading) return null;

  // If builder is enabled, the BuilderRenderer handles the footer
  const config = client?.client_website_config;
  const cfg = Array.isArray(config) ? config[0] : config;
  const builderEnabled = cfg?.is_enabled && cfg?.elements_structure;

  if (builderEnabled) {
    // On /vehicles, we still need a footer since builder doesn't render on this route
    if (pathname?.startsWith('/vehicles')) {
      return <Footer />;
    }
    return null;
  }

  return <Footer />;
}
