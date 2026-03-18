'use client';

import useClientStore from '@/store/useClientStore';
import { Footer } from './Footer';

/**
 * Renders the static Footer only when the builder is NOT active.
 * When the builder is enabled, the footer comes from the builder's own
 * Footer component inside the Craft.js canvas.
 */
export default function ConditionalFooter() {
  const { client } = useClientStore();

  const config = client?.client_website_config;
  // client_website_config can be an array (from Supabase join) or object
  const cfg = Array.isArray(config) ? config[0] : config;

  const builderEnabled = cfg?.is_enabled && cfg?.elements_structure;

  if (builderEnabled) return null;

  return <Footer />;
}
