'use client';

import { Button } from '@heroui/react';
import useClientStore from '../../store/useClientStore';
import ContinuousCarousel from '@/components/vehicles/VehicleCarousel';

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 4,
    slidesToSlide: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

export default function WelcomeSection() {
  const { client } = useClientStore();

  return (
    <div className='bg-white dark:bg-dark-bg transition-colors'>
      <div className='relative isolate overflow-hidden'>
        <div className='mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8'>
          {/* Hero content - Centered */}
          <div className='text-center max-w-3xl mx-auto'>
            <h1 className='text-4xl font-bold   text-gray-900 dark:text-white sm:text-6xl'>
              Encuentra tu próximo vehículo en{' '}
              <span className='text-primary'>{client?.name}</span>
            </h1>
            <p className='mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
              Explora nuestra selección de vehículos de alta calidad. Tenemos el
              vehículo perfecto para ti.
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <Button
                as='a'
                href='/vehicles'
                color='primary'
                size='lg'
                className='px-8 font-semibold bg-primary text-secondary hover:bg-primary/90 '
              >
                Ver vehículos
              </Button>
              <Button
                as='a'
                href='/contact'
                variant='bordered'
                size='lg'
                className='px-8 font-semibold border-primary text-primary hover:bg-primary/10'
              >
                Contáctanos
              </Button>
            </div>
          </div>

          {/* Carousel */}
          <div className='mt-16'>
            <ContinuousCarousel />
          </div>
        </div>
      </div>
    </div>
  );
}
