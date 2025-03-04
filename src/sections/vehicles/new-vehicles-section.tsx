'use client';
import { useState, useEffect } from 'react';
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
import { VehicleFilters as VehicleFiltersType } from '@/utils/types';
import VehicleVerticalCard from '@/components/vehicles/VehicleVerticalCard';
import VehicleHorizontalCard from '@/components/vehicles/VehicleHorizontalCard';
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton';
import useMediaQuery from '@/hooks/useMediaQuery';

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
  const { vehicles, isLoading } = useVehiclesStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<VehicleFiltersType>({});
  const [priceRange, setPriceRange] = useState([0, 1000000000]);
  const [sortBy, setSortBy] = useState('price_asc');
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMd = useMediaQuery('(min-width: 768px)');

  // Extract unique values for filters
  const brands = [...new Set(vehicles.map((v) => v.brand))];
  const categories = [
    'SUV',
    'Sedan',
    'Hatchback',
    'Pickup',
    'Van',
    'Coupe',
    'Wagon',
  ];
  const fuelTypes = ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Gas'];
  const transmissions = ['Manual', 'Automatic'];
  const conditions = ['New', 'Used', 'Certified Pre-Owned'];

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

      if (selectedCategory !== 'all' && vehicle?.category !== selectedCategory)
        matches = false;
      if (filters.brand && vehicle?.brand?.id !== filters.brand)
        matches = false;
      if (filters.category && vehicle?.category !== filters.category)
        matches = false;
      if (filters.fuel_type && vehicle?.fuel_type !== filters.fuel_type)
        matches = false;
      if (filters.transmission && vehicle.transmission !== filters.transmission)
        matches = false;
      if (filters.condition && vehicle?.condition !== filters.condition)
        matches = false;
      if (vehicle?.price < priceRange[0] || vehicle?.price > priceRange[1])
        matches = false;

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

  const activeFiltersCount =
    Object.keys(filters).length +
    (priceRange[0] > 0 || priceRange[1] < 1000000000 ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0);

  const selectedCategoryData = vehicleCategories.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-dark-bg'>
      {/* Fixed Categories Navigation */}
      <div className='sticky top-[var(--navbar-height)] z-30 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex flex-col gap-4'>
            {/* Title and Actions */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
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

            {/* Categories */}
            <ScrollShadow orientation='horizontal' className='w-full'>
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
                    className='whitespace-nowrap hover:-translate-y-0.5 transition-transform dark:text-black'
                    startContent={
                      <Icon
                        icon={category.icon}
                        className='text-xl dark:text-black'
                      />
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
                  categories={categories}
                  fuelTypes={fuelTypes}
                  transmissions={transmissions}
                  conditions={conditions}
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

            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sticky bg-gray-50 dark:bg-dark-bg py-2 px-4 -mx-4 sm:px-0 sm:mx-0 rounded-lg'>
              {!isMd && (
                <Button
                  color='primary'
                  variant='flat'
                  onPress={onOpen}
                  startContent={<Icon icon='mdi:filter' className='text-xl' />}
                  className=''
                >
                  Filtros
                </Button>
              )}
              <div className='flex flex-wrap items-center gap-3'>
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

                <div className='hidden sm:flex border-l border-gray-200 dark:border-dark-border pl-3 gap-2'>
                  <Button
                    isIconOnly
                    variant='light'
                    onPress={() => setActiveView('grid')}
                    className={
                      activeView === 'grid' ? 'bg-primary/10 text-primary' : ''
                    }
                  >
                    <Icon icon='mdi:grid' className='text-xl' />
                  </Button>
                  <Button
                    isIconOnly
                    variant='light'
                    onPress={() => setActiveView('list')}
                    className={
                      activeView === 'list' ? 'bg-primary/10 text-primary' : ''
                    }
                  >
                    <Icon icon='mdi:view-list' className='text-xl' />
                  </Button>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <Chip
                  variant='flat'
                  color='primary'
                  onClose={clearFilters}
                  className='w-full sm:w-auto justify-center'
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
                : filteredVehicles.map((vehicle) =>
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
                  categories={categories}
                  fuelTypes={fuelTypes}
                  transmissions={transmissions}
                  conditions={conditions}
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
