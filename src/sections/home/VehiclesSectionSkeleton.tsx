'use client';
import { ScrollShadow, Chip, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton';

const vehicleCategories = [
  {
    id: 'all',
    name: 'Todos los Vehículos',
    icon: 'mdi:car-multiple',
  },
  {
    id: 'SUV',
    name: 'SUV',
    icon: 'mdi:car-suv',
  },
  {
    id: 'Sedan',
    name: 'Sedán',
    icon: 'mdi:car',
  },
  {
    id: 'Hatchback',
    name: 'Hatchback',
    icon: 'mdi:car-hatchback',
  },
  {
    id: 'Pickup',
    name: 'Pickup',
    icon: 'mdi:truck-pickup',
  },
  {
    id: 'Van',
    name: 'Van',
    icon: 'mdi:van-passenger',
  },
  {
    id: 'Coupe',
    name: 'Coupé',
    icon: 'mdi:car-sports',
  },
  {
    id: 'Wagon',
    name: 'Wagon',
    icon: 'mdi:car-estate',
  },
];

const VehiclesSectionSkeleton = () => {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-dark-bg'>
      {/* Fixed Categories Navigation */}
      <div className='sticky top-[var(--navbar-height)] z-30 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex flex-col gap-4'>
            {/* Title and Actions */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div>
                <div className='h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse'></div>
                <div className='h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mt-2'></div>
              </div>
            </div>

            {/* Categories */}
            <ScrollShadow orientation='horizontal' className='w-full'>
              <div className='flex gap-2 pb-2 min-w-max'>
                {vehicleCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant='light'
                    className='whitespace-nowrap cursor-default opacity-70'
                    startContent={
                      <Icon icon={category.icon} className='text-xl' />
                    }
                    size='sm'
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </ScrollShadow>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='flex flex-col md:flex-row gap-6'>
          {/* Filters - Desktop */}
          <div className='hidden md:block w-80 flex-shrink-0'>
            <div
              className='sticky'
              style={{ top: 'calc(var(--navbar-height) + 180px)' }}
            >
              {/* Filters Skeleton */}
              <div className='bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm'>
                <div className='h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-4'></div>

                {/* Filter Groups */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className='mb-6'>
                    <div className='h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-3'></div>
                    <div className='flex flex-wrap gap-2'>
                      {[1, 2, 3].map((j) => (
                        <div
                          key={j}
                          className='h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse'
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className='h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mt-4'></div>
              </div>
            </div>
          </div>

          {/* Vehicles Content */}
          <div className='flex-1 min-w-0'>
            {/* Sort and View Options */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sticky bg-gray-50 dark:bg-dark-bg py-2 px-4 -mx-4 sm:px-0 sm:mx-0 rounded-lg'>
              <div className='w-24 h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse'></div>

              <div className='flex flex-wrap items-center gap-3'>
                <div className='w-36 h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse'></div>
                <div className='hidden sm:flex border-l border-gray-200 dark:border-dark-border pl-3 gap-2'>
                  <div className='w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse'></div>
                  <div className='w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse'></div>
                </div>
              </div>
            </div>

            {/* Vehicle Cards */}
            <div className='grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
              {Array(9)
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
