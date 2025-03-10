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

const navigation = [{ name: 'Inicio', href: '/' }];

const Navbar = () => {
  const { client } = useClientStore();
  const { theme } = useThemeStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <NextUINavbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className={`transition-all duration-300 fixed top-0 ${
        isScrolled
          ? 'bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md shadow-sm'
          : 'bg-white dark:bg-dark-bg'
      }`}
    >
      {/* Logo a la izquierda */}
      <NavbarContent justify='start'>
        <NavbarBrand>
          <Link href='/'>
            <img
              src={
                theme === 'dark' && client?.logo_dark
                  ? client?.logo_dark
                  : client?.logo
              }
              alt={client?.name}
              className='h-8 w-auto object-contain dark:brightness-200'
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Links de navegación en el centro */}
      <NavbarContent className='hidden sm:flex gap-4' justify='center'>
        {navigation.map((item) => (
          <NavbarItem key={item.name}>
            <Link
              href={item.href}
              prefetch={true}
              className={`px-3 py-2 transition-colors ${
                isActive(item.href)
                  ? 'text-primary dark:text-secondary font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* Botón de contacto, theme toggle y hamburger a la derecha */}
      <NavbarContent justify='end' className='gap-2'>
        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>
        <NavbarItem className='hidden sm:flex'>
          <Button
            as='a'
            color='primary'
            href='/contact'
            className='font-semibold bg-primary text-secondary hover:bg-primary/90 dark:bg-primary dark:text-secondary dark:hover:bg-primary/90'
          >
            Contactar
          </Button>
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className='sm:hidden text-gray-700 dark:text-white'
        />
      </NavbarContent>

      {/* Menú móvil */}
      <NavbarMenu className='bg-white dark:bg-dark-bg pt-6'>
        {navigation.map((item) => (
          <NavbarMenuItem key={item.name}>
            <Link
              href={item.href}
              className={`w-full py-2 transition-colors ${
                isActive(item.href)
                  ? 'text-primary dark:text-secondary font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Button
            as='a'
            color='primary'
            href='/contact'
            className='mt-4 w-full font-semibold bg-primary text-secondary hover:bg-primary/90 dark:bg-secondary dark:text-primary dark:hover:bg-secondary/90'
            onPress={() => setIsMenuOpen(false)}
          >
            Contactar
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </NextUINavbar>
  );
};

export default Navbar;
