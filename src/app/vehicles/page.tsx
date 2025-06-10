'use client';
import { useState, useEffect } from 'react';
import NewVehicleFilters from '../../sections/vehicles/new-vehicle-filters';
import { Icon } from '@iconify/react';
import useMediaQuery from '../../hooks/useMediaQuery';
import useVehiclesStore from '../../store/useVehiclesStore';
import { Vehicle, VehicleFilters as VehicleFiltersType } from '@/utils/types';
import {
  Button,
  Skeleton,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton';
import ModalSlideFilter from '@/components/filters/ModalSlideFilter';
import VehicleVerticalCard from '@/components/vehicles/VehicleVerticalCard';
import { useGeneralStore } from '@/store/useGeneralStore';

import { Input } from '@/components/ui/input';

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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<VehicleFiltersType>({});
  const [priceRange, setPriceRange] = useState([0, 1000000000]);
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [searchQuery, setSearchQuery] = useState('');

  const sortOptions = [
    {
      key: 'date_desc',
      label: 'Recientes primero',
      icon: 'mdi:clock-outline',
    },
    {
      key: 'date_asc',
      label: 'Antiguos primero',
      icon: 'mdi:clock',
    },
    {
      key: 'price_asc',
      label: 'Precio: Menor a Mayor',
      icon: 'mdi:sort-ascending',
    },
    {
      key: 'price_desc',
      label: 'Precio: Mayor a Menor',
      icon: 'mdi:sort-descending',
    },
    { key: 'year_desc', label: 'Año: Más Reciente', icon: 'mdi:calendar' },
    {
      key: 'year_asc',
      label: 'Año: Más Antiguo',
      icon: 'mdi:calendar-outline',
    },
    {
      key: 'mileage_asc',
      label: 'Kilometraje: Menor a Mayor',
      icon: 'mdi:speedometer-slow',
    },
  ];

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
  const models = [...new Set(vehicles.map((v) => v.model))].filter(Boolean);

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
    setSortOrder('date_desc');
    setSearchQuery('');
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    let matches = true;

    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const searchTerms = query.split(' ').filter((term) => term.length > 0);

      const matchesSearch = searchTerms.every((term) => {
        const brandMatch = vehicle.brand?.name?.toLowerCase().includes(term);
        const modelMatch = vehicle.model?.name?.toLowerCase().includes(term);
        const categoryMatch = vehicle.category?.name
          ?.toLowerCase()
          .includes(term);
        const yearMatch = vehicle.year?.toString().includes(term);

        return brandMatch || modelMatch || categoryMatch || yearMatch;
      });

      if (!matchesSearch) {
        matches = false;
      }
    }

    // Filtros desde la barra lateral
    if (filters.brand && vehicle?.brand?.id.toString() !== filters.brand) {
      matches = false;
    }

    if (filters.model && vehicle?.model?.id.toString() !== filters.model) {
      matches = false;
    }

    if (
      filters.category &&
      vehicle?.category?.id.toString() !== filters.category
    ) {
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

    if (filters.year && vehicle?.year?.toString() !== filters.year) {
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
      // Primero ordenar por estado (disponible primero)
      if (a.status?.name === 'Vendido' && b.status?.name !== 'Vendido')
        return 1;
      if (a.status?.name !== 'Vendido' && b.status?.name === 'Vendido')
        return -1;
      if (a.status?.name === 'Reservado' && b.status?.name !== 'Reservado')
        return 1;
      if (a.status?.name !== 'Reservado' && b.status?.name === 'Reservado')
        return -1;

      // Luego aplicar el ordenamiento seleccionado
      switch (sortOrder) {
        case 'date_desc':
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        case 'date_asc':
          return (
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
          );
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'year_desc':
          return (b.year || 0) - (a.year || 0);
        case 'year_asc':
          return (a.year || 0) - (b.year || 0);
        case 'mileage_asc':
          return (a.mileage || 0) - (b.mileage || 0);
        default:
          return 0;
      }
    });
  };

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

  const availableYears = [
    ...new Set(vehicles.map((v) => v.year).filter(Boolean)),
  ]
    .map(String)
    .sort((a, b) => b.localeCompare(a));

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-dark-bg'>
      <main className='grid grid-cols-1 md:grid-cols-4'>
        {/* Sidebar de filtros para desktop */}
        {isMd && (
          <aside className='col-span-1 md:sticky md:top-[3.5rem] mt-20 ml-20'>
            <div className='overflow-y-auto max-h-[calc(100vh-130px)] bg-white dark:bg-dark-bg rounded-lg shadow-sm'>
              <NewVehicleFilters
                filters={filters}
                priceRange={priceRange}
                brands={brands}
                onFilterChange={handleFilterChange}
                onPriceRangeChange={handlePriceRangeChange}
                onClearFilters={clearFilters}
                sortBy={sortOrder}
                searchQuery={searchQuery}
                availableYears={availableYears}
              />
            </div>
          </aside>
        )}

        {/* Modal de filtros para mobile */}
        {!isMd && (
          <ModalSlideFilter
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
          >
            <NewVehicleFilters
              filters={filters}
              priceRange={priceRange}
              brands={brands}
              onFilterChange={handleFilterChange}
              onPriceRangeChange={handlePriceRangeChange}
              onClearFilters={clearFilters}
              sortBy={sortOrder}
              searchQuery={searchQuery}
              availableYears={availableYears}
            />
          </ModalSlideFilter>
        )}

        {/* Contenido principal */}
        <div className='col-span-1 md:col-span-3 flex-1 transition-all duration-300 md:mr-10 mx-1'>
          <div className='px-4 sm:px-6 pt-20'>
            {isPageLoading ? (
              <LoadingState />
            ) : (
              <>
                <div className='mb-6'>
                  <div className='flex-1 flex flex-col max-w-full'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                          Vehículos
                        </h2>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          {filteredVehicles.length} vehículos encontrados
                        </p>
                      </div>
                      <Button
                        onClick={() => setIsFilterModalOpen(true)}
                        className='md:hidden h-8 px-3 text-sm'
                        color='primary'
                        variant='light'
                        startContent={
                          <Icon
                            icon='solar:filter-linear'
                            width={18}
                            className='dark:text-white'
                          />
                        }
                      >
                        Filtros
                      </Button>
                    </div>
                    <div className='flex flex-col sm:flex-row gap-4 mt-4 w-full'>
                      <div className='w-full sm:flex-[3] relative mt-1'>
                        <Icon
                          icon='mdi:magnify'
                          className='absolute left-3 mt-5 transform -translate-y-1/2 text-gray-400 -mb-1'
                          width={20}
                        />
                        <Input
                          type='text'
                          placeholder='Buscar vehículos...'
                          className='pl-12 pr-3 py-2 min-h-[36px] rounded-xl border border-gray-400 bg-gray-100 text-sm text-gray-700 shadow-md focus:border-primary focus:ring-2 focus:ring-primary transition-all w-full max-w-xxl'
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className='w-full sm:w-1/4 flex-1 min-w-[30px] flex sm:mt-0 '>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              variant='light'
                              startContent={
                                <Icon icon='mdi:sort' className='text-base' />
                              }
                              className='w-full flex items-center gap-x-1 px-3 min-h-[44px] text-sm shadow-none bg-transparent hover:bg-gray-100 focus:bg-gray-100 transition-colors rounded-xl'
                            >
                              {sortOptions.find(
                                (option) => option.key === sortOrder
                              )?.label || 'Ordenar por'}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            selectionMode='single'
                            selectedKeys={new Set([sortOrder])}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys)[0];
                              if (selected) setSortOrder(selected.toString());
                            }}
                          >
                            {sortOptions.map((option) => (
                              <DropdownItem
                                key={option.key}
                                startContent={
                                  <Icon
                                    icon={option.icon}
                                    className='text-sm'
                                  />
                                }
                              >
                                {option.label}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid de vehículos */}
                <div className='grid gap-4 pb-4 mt-2 sm:mt-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'>
                  {sortVehicles(filteredVehicles).map((vehicle) => (
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
