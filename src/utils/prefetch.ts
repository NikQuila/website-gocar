'use client';
import { useRouter } from 'next/navigation';

/**
 * Prefetches an array of routes to minimize transition delays
 * @param routes Array of routes to prefetch
 */
export function prefetchRoutes(routes: string[]) {
  const router = useRouter();

  // Prefetch each route
  routes.forEach((route) => {
    router.prefetch(route);
  });
}
