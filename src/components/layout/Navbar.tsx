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

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Vehículos', href: '/vehicles' },
];

const Navbar = () => {
  const { client } = useClientStore();
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
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white'
      }`}
    >
      {/* Logo a la izquierda */}
      <NavbarContent justify='start'>
        <NavbarBrand>
          <Link href='/'>
            <img src={client?.logo} alt={client?.name} className='h-8 w-auto' />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Links de navegación en el centro */}
      <NavbarContent className='hidden sm:flex gap-4' justify='center'>
        {navigation.map((item) => (
          <NavbarItem key={item.name}>
            <Link
              href={item.href}
              className={`px-3 py-2 transition-colors ${
                isActive(item.href)
                  ? 'text-primary font-semibold'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* Botón de contacto y hamburger a la derecha */}
      <NavbarContent justify='end'>
        <NavbarItem className='hidden sm:flex'>
          <Button
            as='a'
            color='primary'
            href='/contact'
            className='font-semibold'
          >
            Contactar
          </Button>
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className='sm:hidden'
        />
      </NavbarContent>

      {/* Menú móvil */}
      <NavbarMenu>
        {navigation.map((item) => (
          <NavbarMenuItem key={item.name}>
            <Link
              href={item.href}
              className={`w-full py-2 transition-colors ${
                isActive(item.href)
                  ? 'text-primary font-medium'
                  : 'text-gray-700 hover:text-gray-900'
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
            className={`mt-4 w-full ${
              isActive('/contact') ? 'font-medium' : ''
            }`}
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
