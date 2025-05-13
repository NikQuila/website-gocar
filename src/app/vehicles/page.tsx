'use client';
import { useState, useEffect } from 'react';
import VehicleFilters from '../../sections/vehicles/FilterSection';
import { Icon } from '@iconify/react';
import useMediaQuery from '../../hooks/useMediaQuery';
import useVehiclesStore from '../../store/useVehiclesStore';
import { Vehicle, VehicleFilters as VehicleFiltersType } from '@/utils/types';
import { Button, Skeleton } from '@heroui/react';
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton';
import ModalSlideFilter from '@/components/filters/ModalSlideFilter';
import VehicleVerticalCard from '@/components/vehicles/VehicleVerticalCard';
import { useGeneralStore } from '@/store/useGeneralStore';

const VehiclesPage = () => {
  const { vehicles, isLoading } = useVehiclesStore();
  const {
    initializeStore,
    colors,
    fuelTypes,
    conditions,
    isLoading: isGeneralStoreLoading,
  } = useGeneralStore();
  const isMd = useMediaQuery('(min-width: 768px)');
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [filters, setFilters] = useState<VehicleFiltersType>({});
  const [priceRange, setPriceRange] = useState([0, 1000000000]);

  // Inicializar el store para cargar categorías, tipos de combustible, etc.
  useEffect(() => {
    initializeStore();
    console.log('GeneralStore inicializado');
  }, [initializeStore]);

  // Para depuración - verificar datos cargados
  useEffect(() => {
    console.log('Datos del GeneralStore:');
    console.log('Colores:', colors);
    console.log('Tipos de combustible:', fuelTypes);
    console.log('Condiciones:', conditions);
  }, [colors, fuelTypes, conditions]);

  // Extraer valores únicos para los filtros
  const brands = [...new Set(vehicles.map((v) => v.brand))];

  const handleFilterChange = (key: keyof VehicleFiltersType, value: any) => {
    setFilters((prev) => {
      if (value === undefined) {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      }
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
  };

  const clearFilters = () => {
    setFilters({});
    setPriceRange([0, 1000000000]);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    let matches = true;

    // Filtros desde la barra lateral
    if (filters.brand && vehicle?.brand?.id.toString() !== filters.brand) {
      matches = false;
    }

    if (
      filters.fuel_type &&
      vehicle?.fuel_type?.id.toString() !== filters.fuel_type
    ) {
      matches = false;
    }

    if (
      filters.condition &&
      vehicle?.condition?.id.toString() !== filters.condition
    ) {
      matches = false;
    }

    if (filters.color && vehicle?.color?.id.toString() !== filters.color) {
      matches = false;
    }

    if (vehicle?.price < priceRange[0] || vehicle?.price > priceRange[1]) {
      matches = false;
    }

    if (matches) {
      console.log(`✓ Vehículo ${vehicle.id} coincide con todos los filtros`);
    }

    return matches;
  });

  // Mostrar loading si cualquiera de los stores está cargando
  const isPageLoading = isLoading || isGeneralStoreLoading;

  const sortVehicles = (vehicles: Vehicle[]) => {
    return [...vehicles].sort((a, b) => {
      if (a.status?.name === 'Vendido' && b.status?.name !== 'Vendido')
        return 1;
      if (a.status?.name !== 'Vendido' && b.status?.name === 'Vendido')
        return -1;

      if (a.status?.name === 'Reservado' && b.status?.name !== 'Reservado')
        return 1;
      if (a.status?.name !== 'Reservado' && b.status?.name === 'Reservado')
        return -1;

      return 0;
    });
  };

  const sortedVehicles = sortVehicles(filteredVehicles);

  const LoadingState = () => (
    <div className='w-full'>
      <div className='mb-4'>
        <div className='flex justify-between items-center'>
          <div className='space-y-2'>
            <Skeleton className='w-32 rounded-lg dark:bg-dark-card'>
              <div className='h-7 w-32 rounded-lg bg-default-300 dark:bg-dark-border'></div>
            </Skeleton>
            <Skeleton className='w-48 rounded-lg dark:bg-dark-card'>
              <div className='h-4 w-48 rounded-lg bg-default-200 dark:bg-dark-border'></div>
            </Skeleton>
          </div>
          {!isMd && (
            <Skeleton className='w-24 rounded-lg dark:bg-dark-card'>
              <div className='h-9 w-24 rounded-lg bg-default-300 dark:bg-dark-border'></div>
            </Skeleton>
          )}
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pb-4'>
        {Array(6)
          .fill(null)
          .map((_, index) => (
            <VehicleCardSkeleton key={index} />
          ))}
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-dark-bg'>
      <main className='flex flex-col md:flex-row'>
        {/* Sidebar de filtros para desktop */}
        {isMd && (
          <aside
            className={`w-80 bg-white dark:bg-dark-bg border-r border-gray-200 dark:border-dark-border fixed top-[3.5rem] bottom-0 transition-transform duration-300 z-40 ${
              isFilterOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <VehicleFilters
              filters={filters}
              priceRange={priceRange}
              brands={brands}
              onFilterChange={handleFilterChange}
              onPriceRangeChange={handlePriceRangeChange}
              onClearFilters={clearFilters}
            />
          </aside>
        )}

        {/* Modal de filtros para mobile */}
        {!isMd && (
          <ModalSlideFilter
            filters={filters}
            priceRange={priceRange}
            brands={brands}
            onFilterChange={handleFilterChange}
            onPriceRangeChange={handlePriceRangeChange}
            onClearFilters={clearFilters}
          />
        )}

        {/* Contenido principal */}
        <div
          className={`flex-1 transition-all duration-300 ${
            isMd && isFilterOpen ? 'md:ml-80' : ''
          }`}
        >
          <div className='px-2 sm:px-6 pt-20'>
            {isPageLoading ? (
              <LoadingState />
            ) : (
              <>
                <div className='mb-6'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                        Vehículos
                      </h2>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        {filteredVehicles.length} vehículos encontrados
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsFilterOpen(true)}
                      className='md:hidden'
                      color='primary'
                      variant='light'
                      startContent={
                        <Icon
                          icon='solar:filter-linear'
                          width={20}
                          className='dark:text-white'
                        />
                      }
                    >
                      Filtros
                    </Button>
                  </div>
                </div>

                {/* Grid de vehículos */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pb-4 mt-2 sm:mt-8 sm:max-w-none'>
                  {sortedVehicles.map((vehicle) => (
                    <VehicleVerticalCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VehiclesPage;
