'use client';

import useClientStore from '../../store/useClientStore';
import AISearchBar from '@/components/search/AISearchBar';
import { useTranslation } from '@/i18n/hooks/useTranslation';

export default function WelcomeSection() {
  const { client } = useClientStore();
  const { t } = useTranslation();

  return (
    <div className='bg-white dark:bg-dark-bg transition-colors'>
      <div className='relative isolate overflow-hidden'>
        <div className='mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8'>
          {/* Hero content - Centered */}
          <div className='text-center'>
            <h1
              className='text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl max-w-3xl mx-auto'
              style={{ lineHeight: '1.1' }}
            >
              {t('home.welcome.title')}{' '}
              <span className='text-primary'>{client?.name}</span>
            </h1>

            <p className='mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
              {t('home.welcome.description')}
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
