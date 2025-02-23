'use client';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';

const ContactCTA = () => {
  const router = useRouter();

  return (
    <section className='bg-primary'>
      <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between'>
        <h2 className='text-3xl font-extrabold tracking-tight text-secondary sm:text-4xl'>
          <span className='block'>
            ¿Listo para encontrar tu próximo vehículo?
          </span>
          <span className='block'>Contáctanos hoy mismo.</span>
        </h2>
        <div className='mt-8 flex lg:mt-0 lg:flex-shrink-0'>
          <Button
            color='primary'
            variant='shadow'
            size='lg'
            onPress={() => router.push('/contact')}
            className='font-semibold hover:scale-105 bg-secondary hover:bg-secondary/90  text-primary transition-all duration-300'
          >
            Contactar
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
