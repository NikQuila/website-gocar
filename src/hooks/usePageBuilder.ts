'use client';

import { useMemo } from 'react';
import useClientStore from '@/store/useClientStore';
import useThemeStore from '@/store/useThemeStore';
import { getPageBuilderData, PageSlug } from '@/lib/page-builder-data';

export function usePageBuilder(pageSlug: PageSlug) {
  const { client } = useClientStore();
  const { theme } = useThemeStore();

  const builderData = useMemo(() => {
    const config = client?.client_website_config;
    const cfg = Array.isArray(config) ? config[0] : config;
    return getPageBuilderData(cfg, pageSlug, theme);
  }, [client, pageSlug, theme]);

  return { builderData };
}
