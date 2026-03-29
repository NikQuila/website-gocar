'use client';

import { useEffect, useRef } from 'react';
import useThemeStore from '@/store/useThemeStore';
import useClientStore from '@/store/useClientStore';

/**
 * Theme modes from the builder:
 *
 *  - "Solo claro"   → has_dark_mode=false, color_scheme='LIGHT'  → always light, no toggle
 *  - "Solo oscuro"  → has_dark_mode=false, color_scheme='DARK'   → always dark, no toggle
 *  - "Ambos"        → has_dark_mode=true,  color_scheme='LIGHT'|'DARK' (= default theme)
 *                     → user can toggle, color_scheme is only the initial default
 *
 * Priority:
 *  1. Single theme (has_dark_mode=false) → FORCE color_scheme, ignore user preference
 *  2. Dual theme, first visit          → use color_scheme as default
 *  3. Dual theme, returning visit      → use saved user preference from Zustand/localStorage
 */

// ── Color helpers ──

function hexToHslComponents(hex: string): { hsl: string; lightness: number } {
  if (!hex) return { hsl: '', lightness: 50 };
  hex = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16); g = parseInt(hex[1] + hex[1], 16); b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16); g = parseInt(hex.substring(2, 4), 16); b = parseInt(hex.substring(4, 6), 16);
  } else {
    return { hsl: '', lightness: 50 };
  }
  const rN = r / 255, gN = g / 255, bN = b / 255;
  const max = Math.max(rN, gN, bN), min = Math.min(rN, gN, bN);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN: h = (gN - bN) / d + (gN < bN ? 6 : 0); break;
      case gN: h = (bN - rN) / d + 2; break;
      case bN: h = (rN - gN) / d + 4; break;
    }
    h /= 6;
  }
  return {
    hsl: `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`,
    lightness: Math.round(l * 100),
  };
}

function getForegroundHsl(lightness: number): string {
  return lightness > 50 ? '0 0% 9%' : '0 0% 98%';
}

// ── Apply dark/light to DOM ──

function applyThemeToDom(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    root.style.backgroundColor = '#141414';
    document.body.style.backgroundColor = '#141414';
  } else {
    root.classList.remove('dark');
    root.style.backgroundColor = '#ffffff';
    document.body.style.backgroundColor = '#ffffff';
  }
}

// ── Provider ──

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();
  const { client } = useClientStore();
  const initializedRef = useRef(false);

  // Step 1: Initialize theme from builder config (runs ONCE when client loads)
  useEffect(() => {
    if (!client || initializedRef.current) return;

    const config = (client as any)?.client_website_config;
    const cfg = Array.isArray(config) ? config[0] : config;
    const builderScheme = cfg?.color_scheme as string | undefined; // 'LIGHT' | 'DARK'
    const hasDualTheme = !!(client as any)?.has_dark_mode;

    if (!builderScheme) {
      initializedRef.current = true;
      return;
    }

    const builderDefault = builderScheme === 'DARK' ? 'dark' : 'light';

    if (!hasDualTheme) {
      // SINGLE THEME — always force, user cannot change
      setTheme(builderDefault);
    } else {
      // DUAL THEME — use builder default only on first visit
      // Check if user has a saved preference
      let userHasSavedPref = false;
      try {
        const stored = localStorage.getItem('theme_mode');
        if (stored) {
          const parsed = JSON.parse(stored);
          userHasSavedPref = !!parsed?.state?.theme;
        }
      } catch { /* no saved pref */ }

      if (!userHasSavedPref) {
        // First visit — use builder's default
        setTheme(builderDefault);
      }
      // Returning visit — Zustand already has user's choice from persistence, don't touch it
    }

    initializedRef.current = true;
  }, [client]);

  // Step 2: Apply theme to DOM whenever it changes
  useEffect(() => {
    applyThemeToDom(theme === 'dark');

    // Apply CSS custom properties for primary/secondary colors
    if (client?.theme?.light && client?.theme?.dark) {
      const root = document.documentElement;
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
  }, [theme, client?.theme]);

  return <>{children}</>;
}
