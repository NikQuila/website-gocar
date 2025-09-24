'use client';
import { Button } from '@heroui/react';
import Link from 'next/link';
import { useTranslation } from '@/i18n/hooks/useTranslation';

const ContactCTA = () => {
  const { t } = useTranslation();
  return (
    <section className='bg-white dark:bg-dark-card'>
      <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between'>
        <h2 className='text-3xl font-extrabold tracking-tight text-secondary sm:text-4xl'>
          <span className='block text-black dark:text-white'>
            {t('home.contactCTA.title')}
          </span>
          <span className='block text-black dark:text-white'>
            {t('home.contactCTA.subtitle')}
          </span>
        </h2>
        <div className='mt-8 flex lg:mt-0 lg:flex-shrink-0'>
          <Link href='/contact' prefetch>
            <Button
              color='primary'
              variant='shadow'
              size='lg'
              className='font-semibold hover:scale-105 bg-primary hover:bg-primary/90 text-secondary transition-all duration-300'
            >
              {t('home.contactCTA.button')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
