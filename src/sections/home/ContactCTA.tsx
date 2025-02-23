'use client';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';

const ContactCTA = () => {
  const router = useRouter();

  return (
    <section className='bg-white dark:bg-dark-bg'>
      <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between'>
        <h2 className='text-3xl font-extrabold tracking-tight text-gray-900 dark:text-dark-text sm:text-4xl'>
          <span className='block'>
            ¿Listo para encontrar tu próximo vehículo?
          </span>
          <span className='block text-primary dark:text-secondary'>
            Contáctanos hoy mismo.
          </span>
        </h2>
        <div className='mt-8 flex lg:mt-0 lg:flex-shrink-0'>
          <Button
            color='primary'
            variant='shadow'
            size='lg'
            onPress={() => router.push('/contact')}
            className='font-semibold hover:scale-105 bg-primary hover:bg-primary/90 dark:bg-secondary dark:hover:bg-secondary/90 transition-all duration-300 text-white dark:text-primary'
          >
            Contactar
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
