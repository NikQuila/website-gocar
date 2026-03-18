'use client';

import useClientStore from '@/store/useClientStore';
import Navbar from './Navbar';

/**
 * Renders the static Navbar only when the builder is NOT active.
 * When the builder is enabled, the navbar comes from the builder's own
 * BuilderNavbar component inside the Craft.js canvas.
 */
export default function ConditionalNavbar() {
  const { client } = useClientStore();

  const config = client?.client_website_config;
  // client_website_config can be an array (from Supabase join) or object
  const cfg = Array.isArray(config) ? config[0] : config;

  const builderEnabled = cfg?.is_enabled && cfg?.elements_structure;

  if (builderEnabled) return null;

  return <Navbar />;
}
