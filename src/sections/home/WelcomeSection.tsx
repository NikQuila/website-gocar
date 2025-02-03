'use client';

import { Button } from '@heroui/react';
import useVehiclesStore from '../../store/useVehiclesStore';
import useClientStore from '../../store/useClientStore';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton';
import VehicleCard from '@/components/vehicles/VehicleCard';
import SimpleCarousel from '@/components/vehicles/VehicleCarousel';

export default function WelcomeSection() {
  const { client } = useClientStore();
  const { vehicles, isLoading } = useVehiclesStore();

  // Duplicar los vehículos para crear un efecto infinito más suave
  const duplicatedVehicles = [...vehicles, ...vehicles, ...vehicles];

  // Array para los skeletons mientras carga
  const skeletonArray = Array(6).fill(null);

  return (
    <div className='bg-white'>
      <div className='relative isolate overflow-hidden'>
        <div className='mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8'>
          {/* Hero content - Centered */}
          <div className='text-center max-w-3xl mx-auto'>
            <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
              Encuentra tu próximo vehículo en{' '}
              <span className='text-primary'>{client?.name}</span>
            </h1>
            <p className='mt-6 text-xl leading-8 text-gray-600 max-w-2xl mx-auto'>
              Explora nuestra selección de vehículos de alta calidad. Tenemos el
              vehículo perfecto para ti.
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <Button
                as='a'
                href='/vehicles'
                color='primary'
                size='lg'
                className='px-8 font-semibold'
              >
                Ver vehículos
              </Button>
              <Button
                as='a'
                href='/contact'
                variant='bordered'
                size='lg'
                className='px-8 font-semibold'
              >
                Contáctanos
              </Button>
            </div>
          </div>

          {/* Carrusel mejorado con autoloop continuo */}
          <div className='mt-16'>
            <SimpleCarousel vehicles={vehicles} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
