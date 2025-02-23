'use client';

import { useEffect } from 'react';
import useThemeStore from '@/store/useThemeStore';
import useClientStore from '@/store/useClientStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();
  const { client } = useClientStore();

  // Handle system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // First check if user has a saved preference
    if (localStorage.getItem('theme_mode')) {
      return; // User preference takes priority
    }

    // Then check client theme mode
    if (client?.theme?.mode) {
      setTheme(client.theme.mode);
      return;
    }

    // Finally fall back to system preference
    setTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only follow system preference if user hasn't manually set a preference
      // and there's no client theme mode
      if (!localStorage.getItem('theme_mode') && !client?.theme?.mode) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme, client?.theme?.mode]);

  // Handle theme class and colors
  useEffect(() => {
    // Handle dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Handle client colors (primary/secondary)
    if (client?.theme) {
      // Set primary and secondary colors without swapping
      document.documentElement.style.setProperty(
        '--color-primary',
        client.theme.primary
      );
      document.documentElement.style.setProperty(
        '--color-secondary',
        client.theme.secondary
      );
    }
  }, [theme, client?.theme]);

  return (
    <div className='min-h-screen bg-white dark:bg-dark-bg transition-colors'>
      {children}
    </div>
  );
}
