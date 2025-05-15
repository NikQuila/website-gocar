'use client';

import { useState, useEffect } from 'react';
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from '@heroui/react';
import useClientStore from '@/store/useClientStore';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';
import useThemeStore from '@/store/useThemeStore';
import { Client } from '@/utils/types';

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Financiamiento', href: '/financing' },
  { name: 'Consignaciones', href: '/consignments' },
  { name: 'Compramos Tu Auto', href: '/buy-direct' },
];

const Navbar = () => {
  const { client } = useClientStore();
  const { theme, setTheme } = useThemeStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Force light mode if client-website_config.isenabled is true
  useEffect(() => {
    if (client?.client_website_config?.is_enabled) {
      if (client?.client_website_config?.color_scheme === 'LIGHT') {
        setTheme('light');
      } else {
        setTheme('dark');
      }
    }
  }, [client]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Should show theme toggle only if has_dark_mode is true AND client-website_config.isenabled is false
  const shouldShowThemeToggle =
    client?.has_dark_mode && !client?.client_website_config?.is_enabled;

  return (
    <NextUINavbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className={`transition-all duration-300 fixed top-0 z-50 ${
        isScrolled
          ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-sm'
          : 'bg-white dark:bg-dark-bg'
      }`}
      maxWidth='xl'
    >
      {/* Logo */}
      <NavbarContent justify='start'>
        <NavbarBrand>
          <Link href='/' className='flex items-center gap-2'>
            <img
              src={
                theme === 'dark' && client?.logo_dark
                  ? client?.logo_dark
                  : client?.logo
              }
              alt={client?.name}
              className='h-10 w-auto object-contain dark:brightness-200'
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Navigation */}
      <NavbarContent className='hidden sm:flex' justify='center'>
        {navigation.map((item) => (
          <NavbarItem key={item.name}>
            <Link
              href={item.href}
              prefetch={true}
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

      {/* Right side - Contact & Theme Toggle */}
      <NavbarContent justify='end' className='gap-3'>
        {shouldShowThemeToggle && (
          <NavbarItem className='hidden sm:flex'>
            <ThemeToggle />
          </NavbarItem>
        )}
        <NavbarItem className='hidden sm:flex'>
          <Button
            as={Link}
            href='/contact'
            size='sm'
            className='bg-primary text-white dark:text-black hover:bg-primary/90 transition-colors rounded-md px-4'
            variant='solid'
          >
            Contactar
          </Button>
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className='sm:hidden text-gray-700 dark:text-white'
        />
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className='bg-white/98 dark:bg-dark-bg/98 backdrop-blur-md pt-12 px-6'>
        {shouldShowThemeToggle && (
          <div className='absolute top-4 right-4'>
            <ThemeToggle />
          </div>
        )}
        <div className='flex flex-col gap-4'>
          {navigation.map((item) => (
            <NavbarMenuItem key={item.name} className='p-0'>
              <Link
                href={item.href}
                className={`block py-3 transition-colors ${
                  isActive(item.href)
                    ? 'text-primary dark:text-white font-medium'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem className='mt-4 p-0'>
            <Button
              as={Link}
              href='/contact'
              className='w-full bg-primary text-white dark:text-black hover:bg-primary/90 transition-colors'
              onClick={() => setIsMenuOpen(false)}
            >
              Contactar
            </Button>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};

export default Navbar;
