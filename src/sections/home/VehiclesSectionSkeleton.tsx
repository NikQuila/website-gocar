'use client';

import { ScrollShadow, Button, Skeleton } from '@heroui/react';
import { Icon } from '@iconify/react';
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton';

const vehicleCategories = [
  { id: 'all', name: 'Todos', icon: 'mdi:car-multiple' },
  { id: 'SUV', name: 'SUV', icon: 'mdi:car-suv' },
  { id: 'Sedan', name: 'Sedán', icon: 'mdi:car' },
  { id: 'Hatchback', name: 'Hatchback', icon: 'mdi:car-hatchback' },
  { id: 'Pickup', name: 'Pickup', icon: 'mdi:truck-pickup' },
];

const VehiclesSectionSkeleton = () => {
  return (
    <div id='vehicles-section' className='min-h-screen bg-slate-50/50 dark:bg-dark-bg'>
      {/* Fixed Categories Navigation */}
      <div className='sticky top-[var(--navbar-height)] z-30 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2'>
          <div className='flex flex-col gap-2'>
            {/* Categories */}
            <ScrollShadow orientation='horizontal' className='w-full'>
              <div className='flex justify-start lg:justify-center items-center w-full'>
                <div className='flex gap-2 pt-2 pb-2 min-w-max'>
                  {vehicleCategories.map((category, index) => (
                    <Button
                      key={category.id}
                      variant={index === 0 ? 'solid' : 'light'}
                      color={index === 0 ? 'primary' : 'default'}
                      className='whitespace-nowrap px-4 py-2 rounded-full opacity-70 cursor-default'
                      startContent={<Icon icon={category.icon} className='text-xl' />}
                      size='md'
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </ScrollShadow>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20'>
        <div className='flex flex-col md:flex-row gap-8'>
          {/* Botón de filtros colapsado (como en el componente real) */}
          <div className='hidden md:block sticky top-24 h-fit shrink-0'>
            <Skeleton className='rounded-xl dark:bg-dark-border'>
              <div className='p-3 w-12 h-20 rounded-xl bg-white dark:bg-[#0B0B0F]' />
            </Skeleton>
          </div>

          {/* Vehicles Content */}
          <div className='flex-1 min-w-0'>
            {/* Vehicle Cards - grid igual al componente real con filtros colapsados */}
            <div className='grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'>
              {Array(8)
                .fill(null)
                .map((_, index) => (
                  <VehicleCardSkeleton key={index} />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclesSectionSkeleton;
