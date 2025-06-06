'use client';

import useClientStore from '@/store/useClientStore';
import Link from 'next/link';
export function Footer() {
  const { client } = useClientStore();

  return (
    <footer className='bg-gray-50 dark:bg-dark-bg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Brand Info */}
          <div>
            <img
              src={client?.logo}
              alt={client?.name}
              className='h-8 w-auto mb-4 dark:brightness-90'
            />
            <p className='text-gray-600 dark:text-gray-400 text-sm'>
              {client?.seo?.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-gray-900 dark:text-dark-text font-semibold mb-4'>
              Enlaces
            </h3>
            <div className='space-y-2'>
              <Link
                href='/vehicles'
                className='block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-dark-text transition-colors'
              >
                Vehículos
              </Link>
              <Link
                href='/about'
                className='block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-dark-text transition-colors'
              >
                Nosotros
              </Link>
              <Link
                href='/contact'
                className='block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-dark-text transition-colors'
              >
                Contacto
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className='text-gray-900 dark:text-dark-text font-semibold mb-4'>
              Contacto
            </h3>
            <div className='space-y-2 text-gray-600 dark:text-gray-400'>
              <p>{client?.contact?.phone}</p>
              <p>{client?.contact?.email}</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className='border-t border-gray-200 dark:border-dark-border mt-8 pt-8 text-center text-gray-600 dark:text-gray-400 text-sm'>
          © {new Date().getFullYear()} {client?.name}. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}
