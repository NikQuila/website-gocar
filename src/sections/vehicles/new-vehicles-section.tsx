'use client';

import { useState, useEffect, useRef } from 'react';

import {
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
  ScrollShadow,
} from '@heroui/react';

import { Icon } from '@iconify/react';
import NewVehicleFilters from './new-vehicle-filters';
import useVehiclesStore from '@/store/useVehiclesStore';
import { Vehicle, VehicleFilters as VehicleFiltersType } from '@/utils/types';
import VehicleVerticalCard from '@/components/vehicles/VehicleVerticalCard';
import VehicleHorizontalCard from '@/components/vehicles/VehicleHorizontalCard';
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton';
import useMediaQuery from '@/hooks/useMediaQuery';
import useThemeStore from '@/store/useThemeStore';
import Link from 'next/link';
import useClientStore from '@/store/useClientStore';
import { formatWhatsAppNumber } from '@/utils/contact-utils';

const vehicleCategories = [
  {
    id: 'all',
    name: 'Todos los Vehículos',
    icon: 'mdi:car-multiple',
    description: 'Explora todos nuestros vehículos disponibles',
  },
  {
    id: 'SUV',
    name: 'SUVs',
    icon: 'mdi:car-suv',
    description: 'Vehículos espaciosos y versátiles',
  },
  {
    id: 'Sedan',
    name: 'Sedanes',
    icon: 'mdi:car',
    description: 'Autos familiares cómodos',
  },
  {
    id: 'Hatchback',
    name: 'Hatchbacks',
    icon: 'mdi:car-hatchback',
    description: 'Compactos y eficientes',
  },
  {
    id: 'Pickup',
    name: 'Pickups',
    icon: 'mdi:truck-pickup',
    description: 'Vehículos de carga y trabajo',
  },
  {
    id: 'Van',
    name: 'Vans',
    icon: 'mdi:van-passenger',
    description: 'Vehículos espaciosos para pasajeros',
  },
  {
    id: 'Coupe',
    name: 'Coupés',
    icon: 'mdi:car-sports',
    description: 'Elegantes y deportivos',
  },
  {
    id: 'Wagon',
    name: 'Wagons',
    icon: 'mdi:car-estate',
    description: 'Vehículos familiares versátiles',
  },
];

const sortOptions = [
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
  { key: 'year_asc', label: 'Año: Más Antiguo', icon: 'mdi:calendar-outline' },
  {
    key: 'mileage_asc',
    label: 'Kilometraje: Menor a Mayor',
    icon: 'mdi:speedometer-slow',
  },
];

const NewVehiclesSection = () => {
  const { theme } = useThemeStore();
  const { vehicles, isLoading } = useVehiclesStore();
  const { client } = useClientStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<VehicleFiltersType>({});
  const [priceRange, setPriceRange] = useState([0, 1000000000]);
  const [sortBy, setSortBy] = useState('price_asc');
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMd = useMediaQuery('(min-width: 768px)');
  const isMobile = useMediaQuery('(max-width: 639px)'); // xs
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)'); // sm-md
  const isDesktop = useMediaQuery('(min-width: 1024px)'); // lg+
  // Extract unique values for filters

  const brands = [...new Set(vehicles.map((v) => v.brand))];

  const handleFilterChange = (key: keyof VehicleFiltersType, value: any) => {
    setFilters((prev) => ({
      ...prev,

      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});

    setPriceRange([0, 1000000000]);

    setSelectedCategory('all');
  };

  const filteredVehicles = vehicles

    .filter((vehicle) => {
      let matches = true;

      // Category from tabs

      if (
        selectedCategory !== 'all' &&
        vehicle?.category?.name.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        matches = false;
      }

      // Filters from sidebar

      if (filters.brand && vehicle?.brand?.id.toString() !== filters.brand) {
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

      if (vehicle?.price < priceRange[0] || vehicle?.price > priceRange[1]) {
        matches = false;
      }

      return matches;
    })

    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;

        case 'price_desc':
          return b.price - a.price;

        case 'year_desc':
          return b.year - a.year;

        case 'year_asc':
          return a.year - b.year;

        case 'mileage_asc':
          return a.mileage - b.mileage;

        default:
          return 0;
      }
    });

  const sortVehicles = (vehicles: Vehicle[]) => {
    return [...vehicles].sort((a, b) => {
      // Primero los no vendidos

      if (a.status?.name === 'Vendido' && b.status?.name !== 'Vendido')
        return 1;

      if (a.status?.name !== 'Vendido' && b.status?.name === 'Vendido')
        return -1;

      return 0;
    });
  };

  // Aplicar el ordenamiento antes de renderizar

  const sortedVehicles = sortVehicles(filteredVehicles);

  const activeFiltersCount =
    Object.keys(filters).length +
    (priceRange[0] > 0 || priceRange[1] < 1000000000 ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0);

  const selectedCategoryData = vehicleCategories.find(
    (cat) => cat.id === selectedCategory
  );

  const whatsappNumber = client?.contact
    ? formatWhatsAppNumber(client.contact)
    : '56996366455';

  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  // Estado para controlar la visibilidad del botón de WhatsApp en móvil
  const [showMobileWhatsApp, setShowMobileWhatsApp] = useState(false);

  // Detectar scroll para mostrar/ocultar el botón en móvil
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 300) {
        setShowMobileWhatsApp(true);
      } else {
        setShowMobileWhatsApp(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-dark-bg'>
      {/* Botón de WhatsApp (posición fija con z-index extremadamente alto) - Solo visible en pantallas mayores a sm */}
      <div className='fixed bottom-6 right-8 xl:right-12 2xl:right-96 z-[99999] hidden sm:block'>
        <Link href={whatsappUrl} target='_blank' rel='noopener noreferrer'>
          <Button
            isIconOnly
            className='bg-[#25D366] text-white rounded-full hover:bg-[#22c35e] hover:shadow-lg transition-all duration-200 shadow-md w-12 h-12'
            aria-label='WhatsApp'
          >
            <Icon icon='logos:whatsapp-icon' className='text-xl' />
          </Button>
        </Link>
      </div>

      {/* Botón de WhatsApp para móvil que aparece solo al hacer scroll */}
      <div
        className={`sm:hidden fixed bottom-6 right-6 z-[99999] transition-all duration-300 ${
          showMobileWhatsApp
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <Link href={whatsappUrl} target='_blank' rel='noopener noreferrer'>
          <Button
            isIconOnly
            className='bg-[#25D366] text-white rounded-full hover:bg-[#22c35e] hover:shadow-lg transition-all duration-200 shadow-md w-12 h-12'
            aria-label='WhatsApp'
          >
            <Icon icon='logos:whatsapp-icon' className='text-xl' />
          </Button>
        </Link>
      </div>

      {/* Fixed Categories Navigation */}

      <div className='sticky top-[var(--navbar-height)] z-30 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex flex-col gap-4'>
            {/* Title and Actions */}

            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                    {selectedCategoryData?.name || 'Todos los Vehículos'}

                    <Chip size='sm' variant='flat' color='primary'>
                      {filteredVehicles.length}
                    </Chip>
                  </h1>

                  <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                    {selectedCategoryData?.description ||
                      'Explora nuestra selección de vehículos de calidad'}
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}

            <ScrollShadow orientation='horizontal' className='w-full'>
              <div className='flex justify-between items-center w-full'>
                <div className='flex gap-2 pb-2 min-w-max'>
                  {vehicleCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? 'solid' : 'light'
                      }
                      color={
                        selectedCategory === category.id ? 'primary' : 'default'
                      }
                      onClick={() => setSelectedCategory(category.id)}
                      className={`whitespace-nowrap hover:-translate-y-0.5 transition-transform

${selectedCategory === category.id && theme === 'dark' ? 'text-black' : ''}`}
                      startContent={
                        <Icon icon={category.icon} className='text-xl' />
                      }
                      size='sm'
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

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='flex flex-col md:flex-row gap-6'>
          {/* Filters - Desktop */}

          {isMd && (
            <div className='hidden md:block w-80 flex-shrink-0'>
              <div
                className='sticky'
                style={{ top: 'calc(var(--navbar-height) + 180px)' }}
              >
                <NewVehicleFilters
                  filters={filters}
                  priceRange={priceRange}
                  brands={brands}
                  onFilterChange={handleFilterChange}
                  onPriceRangeChange={setPriceRange}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
          )}

          {/* Vehicles Content */}

          <div className='flex-1 min-w-0'>
            {/* Sort and View Options */}

            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sticky bg-gray-50 dark:bg-dark-bg py-2 px-4 -mx-4 sm:px-0 sm:mx-0 rounded-lg relative'>
              {/* Columna izquierda - Filtros */}

              {/* Columna central - Dropdown de ordenamiento */}
              <div className='flex-grow flex justify-start'>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant='light'
                      startContent={
                        <Icon icon='mdi:sort' className='text-xl' />
                      }
                      className='w-full sm:w-auto justify-between'
                    >
                      {sortOptions.find((option) => option.key === sortBy)
                        ?.label || 'Ordenar por'}
                    </Button>
                  </DropdownTrigger>

                  <DropdownMenu
                    selectionMode='single'
                    selectedKeys={new Set([sortBy])}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      if (selected) setSortBy(selected.toString());
                    }}
                  >
                    {sortOptions.map((option) => (
                      <DropdownItem
                        key={option.key}
                        startContent={
                          <Icon icon={option.icon} className='text-xl' />
                        }
                      >
                        {option.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>

              {activeFiltersCount > 0 && (
                <Chip
                  variant='flat'
                  color='primary'
                  onClose={clearFilters}
                  className='w-full sm:w-auto justify-center ml-auto sm:ml-0'
                >
                  {activeFiltersCount}{' '}
                  {activeFiltersCount === 1 ? 'filtro' : 'filtros'} activos
                </Chip>
              )}
            </div>

            {/* Vehicle Cards */}

            <div
              className={`grid gap-4 sm:gap-6 ${
                activeView === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {isLoading
                ? Array(6)
                    .fill(null)

                    .map((_, index) => <VehicleCardSkeleton key={index} />)
                : sortedVehicles.map((vehicle) =>
                    activeView === 'grid' ? (
                      <VehicleVerticalCard key={vehicle.id} vehicle={vehicle} />
                    ) : (
                      <VehicleHorizontalCard
                        key={vehicle.id}
                        vehicle={vehicle}
                      />
                    )
                  )}
            </div>

            {/* No Results State */}

            {!isLoading && filteredVehicles.length === 0 && (
              <div className='text-center py-12'>
                <Icon
                  icon='mdi:car-off'
                  className='text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4'
                />

                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                  No se encontraron vehículos
                </h3>

                <p className='text-gray-500 dark:text-gray-400 mb-4'>
                  Intenta ajustar los filtros o criterios de búsqueda
                </p>

                <Button
                  color='primary'
                  variant='light'
                  onPress={clearFilters}
                  startContent={<Icon icon='mdi:filter-off' />}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}

      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement='left'
        className='bg-white dark:bg-dark-card'
        classNames={{
          base: 'sm:max-w-[90%] md:max-w-[400px] ',

          header: 'border-b border-gray-200 dark:border-dark-border',

          body: 'p-0',

          footer: 'border-t border-gray-200 dark:border-dark-border px-4 py-4',
        }}
      >
        <DrawerContent>
          <DrawerBody>
            <ScrollShadow className='h-[calc(100vh-8rem)]'>
              <div className='p-4'>
                <NewVehicleFilters
                  filters={filters}
                  priceRange={priceRange}
                  brands={brands}
                  onFilterChange={handleFilterChange}
                  onPriceRangeChange={setPriceRange}
                  onClearFilters={clearFilters}
                />
              </div>
            </ScrollShadow>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default NewVehiclesSection;
