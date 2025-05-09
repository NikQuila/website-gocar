'use client';

import { useEffect } from 'react';
import useThemeStore from '@/store/useThemeStore';
import useClientStore from '@/store/useClientStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();
  const { client } = useClientStore();

  // Initialize theme
  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme_mode');

    // If client has dark mode disabled, force light mode
    if (client?.has_dark_mode === false) {
      root.classList.remove('dark');
      setTheme('light');
    } else if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      root.classList.add('dark');
      setTheme('dark');
    } else {
      root.classList.remove('dark');
      setTheme('light');
    }
  }, [client?.has_dark_mode]);

  useEffect(() => {
    const root = document.documentElement;

    // Don't save theme if dark mode is disabled
    if (client?.has_dark_mode !== false) {
      localStorage.setItem('theme_mode', theme);
    }

    if (theme === 'dark' && client?.has_dark_mode !== false) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply theme colors
    if (client?.theme?.light && client?.theme?.dark) {
      const colors = theme === 'dark' ? client.theme.dark : client.theme.light;

      root.style.setProperty('--color-primary', colors.primary || '');
      root.style.setProperty('--color-secondary', colors.secondary || '');
    }
  }, [theme, client?.theme, client?.has_dark_mode]);

  return (
    <div className='min-h-screen bg-white dark:bg-dark-bg transition-colors'>
      {children}
    </div>
  );
}
