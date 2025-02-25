'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RoutePrefetcherProps {
  routes: string[];
}

export default function RoutePrefetcher({ routes }: RoutePrefetcherProps) {
  const router = useRouter();

  useEffect(() => {
    // Prefetch each route
    routes.forEach((route) => {
      router.prefetch(route);
    });
  }, []); // Empty dependency array means this runs once on mount

  return null; // This component doesn't render anything
}
