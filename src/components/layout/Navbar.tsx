'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  Button,
} from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion, useReducedMotion, MotionConfig } from 'framer-motion';

import useClientStore from '@/store/useClientStore';
import useThemeStore from '@/store/useThemeStore';
import ThemeToggle from '../ThemeToggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useTranslation } from '@/i18n/hooks/useTranslation';

const Navbar = () => {
  const { client } = useClientStore();
  const { theme, setTheme } = useThemeStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();

  const navigation = useMemo(
    () => [
      { name: t('navigation.links.home'), href: '/', icon: 'solar:home-line-duotone' },
      { name: t('navigation.links.financing'), href: '/financing', icon: 'solar:card-2-line-duotone' },
      { name: t('navigation.links.consignments'), href: '/consignments', icon: 'solar:bag-5-line-duotone' },
      { name: t('navigation.links.buyDirect'), href: '/buy-direct', icon: 'solar:cart-5-line-duotone' },
      { name: t('navigation.links.weSearchForYou'), href: '/we-search-for-you', icon: 'solar:compass-line-duotone' },
    ],
    [t]
  );

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (client?.client_website_config?.is_enabled) {
      setTheme(client?.client_website_config?.color_scheme === 'LIGHT' ? 'light' : 'dark');
    }
  }, [client, setTheme]);

  const isActive = useCallback(
    (href: string) => (href === '/' ? pathname === href : pathname.startsWith(href)),
    [pathname]
  );

  const shouldShowThemeToggle = !!client?.has_dark_mode;

  // Transiciones globales más baratas si el usuario pide menos motion
  const transition = prefersReduced
    ? { type: false as const, duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.5 };

  return (
    <MotionConfig transition={transition}>
      <NextUINavbar
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        className={`transition-colors duration-300 fixed top-0 z-50 ${
          isScrolled
            ? 'bg-white/90 dark:bg-black/90 shadow-sm supports-[backdrop-filter]:backdrop-blur-md'
            : 'bg-white dark:bg-dark-bg'
        }`}
        maxWidth="xl"
      >
        {/* Brand */}
        <NavbarContent justify="start">
          <NavbarBrand>
            <Link href="/" className="flex items-center gap-2" prefetch={false}>
              <img
                src={theme === 'dark' && client?.logo_dark ? client.logo_dark : client?.logo}
                alt={client?.name}
                className="h-10 w-auto object-contain dark:brightness-200"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </Link>
          </NavbarBrand>
        </NavbarContent>

        {/* Desktop nav (simple, sin Framer por item) */}
        <NavbarContent className="hidden sm:flex" justify="center">
          {navigation.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                href={item.href}
                prefetch={false}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary font-semibold dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        {/* Right side */}
        <NavbarContent justify="end" className="gap-3">
          <NavbarItem className="hidden sm:flex">
            <LanguageSelector variant="minimal" className="rounded-full" />
          </NavbarItem>
          {shouldShowThemeToggle && (
            <NavbarItem className="hidden sm:flex">
              <ThemeToggle />
            </NavbarItem>
          )}
          <NavbarItem className="hidden sm:flex">
            <Button
              as={Link}
              href="/contact"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md px-4"
              variant="solid"
              prefetch={false}
            >
              {t('navigation.links.contact')}
            </Button>
          </NavbarItem>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="sm:hidden text-gray-700 dark:text-white"
          />
        </NavbarContent>

        {/* Mobile Menu (panel único animado; items con CSS) */}
        <NavbarMenu className="bg-transparent p-0" onClick={() => setIsMenuOpen(false)}>
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                key="panel"
                initial={{ y: prefersReduced ? 0 : -12, opacity: prefersReduced ? 1 : 0.001 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: prefersReduced ? 0 : -12, opacity: prefersReduced ? 1 : 0 }}
                className="
                  mx-3 mt-3 mb-4 rounded-2xl border border-black/5 dark:border-white/10
                  bg-white/90 dark:bg-black/70
                  supports-[backdrop-filter]:backdrop-blur-xl
                  shadow-xl
                  overflow-hidden
                "
              >
                {/* Header panel */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <LanguageSelector variant="minimal" className="rounded-full" />
                    {shouldShowThemeToggle && <ThemeToggle />}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[50%]">
                    {client?.name}
                  </span>
                </div>

                {/* Lista */}
                <ul className="px-1 py-1">
                  {navigation.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <li key={item.href} className="list-none">
                        <Link
                          href={item.href}
                          prefetch={false}
                          onClick={() => setIsMenuOpen(false)}
                          className={`group block w-full select-none rounded-xl px-4 py-3 transition
                            ${active
                              ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="grid place-items-center rounded-lg size-9 bg-black/[0.03] dark:bg-white/[0.06]">
                              <Icon icon={item.icon} className="text-xl" />
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-base leading-none">{item.name}</span>
                                <Icon
                                  icon="solar:alt-arrow-right-linear"
                                  className={`text-lg transition-transform duration-200 group-hover:translate-x-0.5 ${
                                    active ? 'opacity-100' : 'opacity-60'
                                  }`}
                                />
                              </div>
                              <div
                                className={`mt-2 h-[2px] rounded-full transition-all duration-200 ${
                                  active
                                    ? 'w-14 bg-primary'
                                    : 'w-0 bg-transparent group-hover:w-10 group-hover:bg-white/40 dark:group-hover:bg-white/30'
                                }`}
                              />
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Footer acciones */}
                <div className="p-3 border-t border-black/5 dark:border-white/10">
                  <Button
                    as={Link}
                    href="/contact"
                    prefetch={false}
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-xl h-11"
                    variant="solid"
                    startContent={<Icon icon="solar:chat-round-dots-line-duotone" className="text-xl" />}
                  >
                    {t('navigation.links.contact')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </NavbarMenu>
      </NextUINavbar>
    </MotionConfig>
  );
};

export default Navbar;
