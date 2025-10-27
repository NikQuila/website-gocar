'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  Button,
  Divider,
} from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'framer-motion';

import useClientStore from '@/store/useClientStore';
import useThemeStore from '@/store/useThemeStore';
import ThemeToggle from '../ThemeToggle';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useTranslation } from '@/i18n/hooks/useTranslation';

const spring = { type: 'spring', stiffness: 400, damping: 30, mass: 0.6 };

const Navbar = () => {
  const { client } = useClientStore();
  const { theme, setTheme } = useThemeStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

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

  // Forzar esquema desde el backend si está habilitado
  useEffect(() => {
    if (client?.client_website_config?.is_enabled) {
      setTheme(client?.client_website_config?.color_scheme === 'LIGHT' ? 'light' : 'dark');
    }
  }, [client, setTheme]);

  const isActive = (href: string) => (href === '/' ? pathname === href : pathname.startsWith(href));

  // Mostrar toggle de tema solo si tiene dark mode y NO está forzado por el backend
  const shouldShowThemeToggle =
    !!client?.has_dark_mode && !client?.client_website_config?.is_enabled;

  return (
    <NextUINavbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className={`transition-all duration-300 fixed top-0 z-50 ${
        isScrolled
          ? 'bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm'
          : 'bg-white dark:bg-dark-bg'
      }`}
      maxWidth="xl"
    >
      {/* Brand */}
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-2">
            <img
              src={theme === 'dark' && client?.logo_dark ? client.logo_dark : client?.logo}
              alt={client?.name}
              className="h-10 w-auto object-contain dark:brightness-200"
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop nav */}
      <NavbarContent className="hidden sm:flex" justify="center">
        {navigation.map((item) => (
          <NavbarItem key={item.href}>
            <Link
              href={item.href}
              prefetch
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
            className="bg-primary text-white dark:text-black hover:bg-primary/90 transition-colors rounded-md px-4"
            variant="solid"
          >
            {t('navigation.links.contact')}
          </Button>
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden text-gray-700 dark:text-white"
        />
      </NavbarContent>

      {/* Mobile Menu – sin <li> anidados */}
      <NavbarMenu className="bg-transparent p-0">
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[-1] backdrop-blur-[6px]"
              />
              {/* Gradients decorativos */}
              <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
                <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-60 bg-primary/20" />
                <div className="absolute top-1/4 -right-20 h-80 w-80 rounded-full blur-3xl opacity-50 bg-fuchsia-500/20 dark:bg-fuchsia-400/10" />
                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl opacity-50 bg-emerald-400/20 dark:bg-emerald-300/10" />
              </div>

              {/* Panel */}
              <motion.div
                key="panel"
                initial={{ y: -16, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -16, opacity: 0, scale: 0.98 }}
                transition={spring}
                className="mx-3 mt-3 mb-4 rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl shadow-xl"
              >
                {/* Header panel */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <LanguageSelector variant="minimal" className="rounded-full" />
                    {shouldShowThemeToggle && <ThemeToggle />}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{client?.name}</span>
                </div>

                <Divider className="opacity-50" />

                {/* Lista: SOLO un <li> por item (motion.li) */}
                <motion.ul
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  variants={{
                    hidden: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
                    show: { transition: { staggerChildren: 0.05 } },
                  }}
                  className="px-1 py-2"
                >
                  {navigation.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <motion.li
                        key={item.href}
                        variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: spring } }}
                        className="relative list-none" // evita bullets en caso de reset
                      >
                        {/* Indicador activo */}
                        <motion.span
                          layout
                          className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 rounded-r-full ${
                            active ? 'bg-primary' : 'bg-transparent'
                          }`}
                          style={{ width: active ? 4 : 0 }}
                          transition={spring}
                        />
                        {/* Enlace (sin NavbarMenuItem) */}
                        <Link
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`group block w-full select-none rounded-xl px-4 py-3 active:scale-[0.99] transition-all
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
                                  className={`text-lg transition-transform group-hover:translate-x-0.5 ${
                                    active ? 'opacity-100' : 'opacity-60'
                                  }`}
                                />
                              </div>
                              <div
                                className={`mt-2 h-[2px] rounded-full transition-all ${
                                  active
                                    ? 'w-14 bg-primary'
                                    : 'w-0 bg-transparent group-hover:w-10 group-hover:bg-white/40 dark:group-hover:bg-white/30'
                                }`}
                              />
                            </div>
                          </div>
                        </Link>
                      </motion.li>
                    );
                  })}
                </motion.ul>

                <Divider className="opacity-50" />

                {/* Footer acciones */}
                <div className="p-3">
                  <Button
                    as={Link}
                    href="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full bg-primary text-white dark:text-black hover:bg-primary/90 transition-colors rounded-xl h-11"
                    variant="solid"
                    startContent={<Icon icon="solar:chat-round-dots-line-duotone" className="text-xl" />}
                  >
                    {t('navigation.links.contact')}
                  </Button>
                  <div className="mt-2 text-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('navigation.links.weSearchForYou')}
                    </span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </NavbarMenu>
    </NextUINavbar>
  );
};

export default Navbar;
