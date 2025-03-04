'use client';

import useClientStore from '../../store/useClientStore';
import AISearchBar from '@/components/search/AISearchBar';

export default function WelcomeSection() {
  const { client } = useClientStore();

  return (
    <div className='bg-white dark:bg-dark-bg transition-colors'>
      <div className='relative isolate overflow-hidden'>
        <div className='mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8'>
          {/* Hero content - Centered */}
          <div className='text-center'>
            <h1
              className='text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl max-w-3xl mx-auto'
              style={{ lineHeight: '1.1' }}
            >
              Encuentra tu próximo vehículo en{' '}
              <span className='text-primary'>{client?.name}</span>
            </h1>

            <p className='mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
              Describe el vehículo de tus sueños y deja que nuestra IA encuentre
              las mejores opciones para ti.
            </p>

            <div className='mt-8 w-full'>
              {client && (
                <AISearchBar clientId={client.id} clientName={client.name} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
