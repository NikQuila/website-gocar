import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNode, useEditor } from '@craftjs/core';
import useClientStore from '@/store/useClientStore';
import useThemeStore from '@/store/useThemeStore';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

interface NavLink {
  text: string;
  url: string;
}

interface BuilderNavbarProps {
  links?: NavLink[];
  ctaText?: string;
  ctaUrl?: string;
  bgColor?: string;
  textColor?: string;
  ctaBgColor?: string;
  ctaTextColor?: string;
  logoUrl?: string;
  showLogo?: boolean;
  sticky?: boolean;
}

/** Sun icon */
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

/** Moon icon */
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export const BuilderNavbar = ({
  links = [
    { text: 'Inicio', url: '/' },
    { text: 'Financiamiento', url: '/financing' },
    { text: 'Consignaciones', url: '/consignments' },
    { text: 'Compra directa', url: '/buy-direct' },
    { text: 'Buscamos por ti', url: '/we-search-for-you' },
  ],
  ctaText = 'Contacto',
  ctaUrl = '/contact',
  bgColor = '#ffffff',
  textColor = '#4b5563',
  ctaBgColor = '',
  ctaTextColor = '#ffffff',
  logoUrl = '',
  showLogo = true,
  sticky = true,
}: BuilderNavbarProps) => {
  const { connectors } = useNode();
  const { client } = useClientStore();
  const { theme, toggleTheme } = useThemeStore();

  // Get current path safely (usePathname crashes inside CraftJS Frame)
  const [pathname, setPathname] = useState('/');
  useEffect(() => {
    setPathname(window.location.pathname);
    // Update on popstate (back/forward navigation)
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  // Also update when Link navigation changes the URL (Next.js client-side)
  useEffect(() => {
    setPathname(window.location.pathname);
  });

  const { isEnabled } = useEditor((state) => ({
    isEnabled: state.options.enabled,
  }));

  // Scroll state — transparent at top, solid on scroll
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!sticky || isEnabled) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sticky, isEnabled]);

  const primaryColor = client?.theme?.light?.primary || '#e05d31';
  const finalCtaBgColor = ctaBgColor || primaryColor;
  const companyName = client?.name || 'Automotora';
  const hasDarkMode = !!client?.has_dark_mode;
  const hasLanguageSelector = !!client?.has_language_selector;

  const isDarkBg = (() => {
    const c = bgColor.replace('#', '');
    if (c.length !== 6) return false;
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b < 0.4;
  })();
  const logoDark = client?.logo_dark || '';
  const logoLight = logoUrl || client?.logo || '';
  const useDarkLogo = isDarkBg || theme === 'dark';
  const finalLogoUrl = useDarkLogo && logoDark ? logoDark : logoLight;

  const effectiveBg = theme === 'dark' && !isDarkBg ? '#141414' : bgColor;
  const effectiveText = theme === 'dark' && !isDarkBg ? '#d4d4d4' : textColor;

  // In builder editor, always show solid bg
  const showSolidBg = isEnabled || scrolled;

  // Active route detection
  const isActiveLink = (url: string) => {
    if (url === '/') return pathname === '/';
    return pathname?.startsWith(url);
  };

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      style={{
        backgroundColor: showSolidBg ? effectiveBg : 'transparent',
        position: sticky ? 'sticky' : 'relative',
        top: sticky ? 0 : undefined,
        zIndex: 100,
        backdropFilter: showSolidBg ? undefined : 'blur(12px)',
        boxShadow: showSolidBg ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
      }}
      className="w-full transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showLogo && finalLogoUrl ? (
              <Link href="/">
                <img
                  src={finalLogoUrl}
                  alt={companyName}
                  className="h-9 w-auto object-contain"
                />
              </Link>
            ) : (
              <Link href="/" className="text-lg font-bold" style={{ color: effectiveText }}>
                {companyName}
              </Link>
            )}
          </div>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map((link, i) => (
              <Link
                key={i}
                href={link.url}
                className="px-3 py-2 text-sm font-medium rounded-md transition-colors hover:opacity-80"
                style={{
                  color: isActiveLink(link.url) ? primaryColor : effectiveText,
                  fontWeight: isActiveLink(link.url) ? 600 : 500,
                }}
              >
                {link.text}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {hasLanguageSelector && (
              <LanguageSelector variant="minimal" className="rounded-full" />
            )}
            {hasDarkMode && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full transition-colors hover:opacity-80"
                style={{ color: effectiveText }}
                aria-label="Cambiar tema"
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            )}
            <Link
              href={ctaUrl}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:opacity-90"
              style={{
                backgroundColor: finalCtaBgColor,
                color: ctaTextColor,
              }}
            >
              {ctaText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

BuilderNavbar.craft = {
  displayName: 'BuilderNavbar',
  props: {
    links: [
      { text: 'Inicio', url: '/' },
      { text: 'Financiamiento', url: '/financing' },
      { text: 'Consignaciones', url: '/consignments' },
      { text: 'Compra directa', url: '/buy-direct' },
    ],
    ctaText: 'Contacto',
    ctaUrl: '/contact',
    bgColor: '#ffffff',
    textColor: '#4b5563',
    ctaBgColor: '',
    ctaTextColor: '#ffffff',
    logoUrl: '',
    showLogo: true,
    sticky: true,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
