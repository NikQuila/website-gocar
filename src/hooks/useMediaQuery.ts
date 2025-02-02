'use client';
import { useEffect, useState } from 'react';

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => {
    // Initialize with the current match state if window is available
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    // Modern event listener approach
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Use modern addEventListener if available, fallback to addListener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [query]); // Remove matches from dependencies

  return matches;
};

export default useMediaQuery;
