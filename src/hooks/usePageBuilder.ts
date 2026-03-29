'use client';

import { useEffect, useRef } from 'react';
import useClientStore from '@/store/useClientStore';
import useThemeStore from '@/store/useThemeStore';
import { getPageBuilderData } from '@/lib/page-builder-data';

export function usePageBuilder(pageSlug: string) {
  const { client, isLoading } = useClientStore();
  const { theme, setTheme } = useThemeStore();

  // Use a ref so data survives re-renders caused by setTheme
  const dataRef = useRef<{ light: any; dark: any; ready: boolean }>({
    light: null,
    dark: null,
    ready: false,
  });

  // Sync theme from server config (separate from data loading)
  useEffect(() => {
    if (isLoading || !client?.id) return;
    const config = client?.client_website_config;
    const cfg = Array.isArray(config) ? config[0] : config;
    if (!cfg?.color_scheme) return;
    const serverTheme = cfg.color_scheme === 'DARK' ? 'dark' : 'light';
    if (client?.has_dark_mode === false) {
      if (theme !== 'light') setTheme('light');
    } else if (theme !== serverTheme) {
      setTheme(serverTheme);
    }
  }, [client?.id, isLoading]);

  // Load data into ref (doesn't cause re-renders)
  if (!dataRef.current.ready && !isLoading && client?.id) {
    const config = client?.client_website_config;
    const cfg = Array.isArray(config) ? config[0] : config;
    if (cfg?.is_enabled && cfg?.elements_structure) {
      const light = getPageBuilderData(cfg, pageSlug, 'light');
      const dark = getPageBuilderData(cfg, pageSlug, 'dark');
      if (light || dark) {
        dataRef.current = { light, dark, ready: true };
      }
    }
    if (!dataRef.current.ready) {
      dataRef.current.ready = true; // No builder data, mark as ready anyway
    }
  }

  const { light: lightData, dark: darkData, ready } = dataRef.current;
  const builderData = theme === 'dark'
    ? (darkData || lightData)
    : (lightData || darkData);

  return { builderData, theme, loaded: ready };
}
