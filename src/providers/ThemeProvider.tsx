'use client';

import { useEffect } from 'react';
import useThemeStore from '@/store/useThemeStore';
import useClientStore from '@/store/useClientStore';

// Helper function to convert HEX to HSL component string
function hexToHslComponents(hex: string): { hsl: string; lightness: number } {
  if (!hex) return { hsl: '', lightness: 50 };
  hex = hex.replace('#', '');

  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 3) {
    // Expand shorthand form (e.g. "03F")
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    // Full form (e.g. "0033FF")
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return { hsl: '', lightness: 50 }; // Invalid hex string
  }

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPc = Math.round(s * 100);
  const lPc = Math.round(l * 100);

  return { hsl: `${hDeg} ${sPc}% ${lPc}%`, lightness: lPc };
}

// Get contrasting foreground color based on background lightness
function getForegroundHsl(lightness: number): string {
  // If background is light (>50%), use dark text; otherwise use light text
  return lightness > 50 ? '0 0% 9%' : '0 0% 98%';
}

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

      const primary = hexToHslComponents(colors.primary);
      const secondary = hexToHslComponents(colors.secondary);

      if (primary.hsl) {
        root.style.setProperty('--primary', primary.hsl);
        root.style.setProperty('--primary-foreground', getForegroundHsl(primary.lightness));
      }
      if (secondary.hsl) {
        root.style.setProperty('--secondary', secondary.hsl);
        root.style.setProperty('--secondary-foreground', getForegroundHsl(secondary.lightness));
      }
    }
  }, [theme, client?.theme, client?.has_dark_mode]);

  return <>{children}</>;
}
