import React, { useEffect, useState } from 'react';
import { useNode } from '@craftjs/core';
import { supabase } from '@/lib/supabase';
import useClientStore from '@/store/useClientStore';
import { useGeneralStore } from '@/store/useGeneralStore';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VehicleCatalogRetroFilters } from './VehicleCatalogRetroFilters';
import { VehicleList } from '../vehicles/VehicleList';
import { ExtendedVehicle } from '../vehicles/VehicleGrid';

interface VehicleStatus {
  id: number;
  name: string;
}

interface VehicleCatalogRetroProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  columns?: 2 | 3 | 4;
  showStatuses?: ('Publicado' | 'Vendido' | 'Reservado')[];
  children?: React.ReactNode;
  showFilters?: boolean;
  cardSettings?: {
    cardBgColor: string;
    cardBorderColor: string;
    cardTextColor: string;
    cardPriceColor: string;
    cardButtonColor: string;
    cardButtonTextColor: string;
    detailsButtonText: string;
    bannerPosition: 'left' | 'right';
    pricePosition: 'overlay' | 'below-title';
    featuresConfig?: {
      feature1: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
      feature2: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
      feature3: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
      feature4: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
    };
  }[];
  newBadgeText?: string;
}

export const VehicleCatalogRetro = ({
  title = 'Catálogo de Vehículos Retro',
  subtitle = 'Explora nuestro inventario de vehículos disponibles',
  bgColor = '#ffffff',
  textColor = '#333333',
  columns = 3,
  showStatuses = ['Publicado', 'Reservado', 'Vendido'],
  showFilters = true,
  cardSettings = [
    {
      cardBgColor: '#ffffff',
      cardBorderColor: '#e5e7eb',
      cardTextColor: '#1f2937',
      cardPriceColor: '#ffffff',
      cardButtonColor: '#3b82f6',
      cardButtonTextColor: '#ffffff',
      detailsButtonText: 'Ver detalles',
      bannerPosition: 'right',
      pricePosition: 'overlay' as 'overlay' | 'below-title',
      featuresConfig: {
        feature1: 'category',
        feature2: 'year',
        feature3: 'fuel',
        feature4: 'mileage',
      },
    },
  ],
  newBadgeText = 'Recién publicado',
  children,
}: VehicleCatalogRetroProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { client } = useClientStore();

  // Obtener datos del store general
  const {
    categories,
    isLoading: categoriesLoading,
    initializeStore,
  } = useGeneralStore();

  // Inicializar el store si no está cargado
  useEffect(() => {
    if (!categoriesLoading && categories.length === 0) {
      initializeStore();
    }
  }, [categoriesLoading, categories.length, initializeStore]);

  const [vehicles, setVehicles] = useState<ExtendedVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<ExtendedVehicle[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<
    | 'price_asc'
    | 'price_desc'
    | 'date_asc'
    | 'date_desc'
    | 'year_desc'
    | 'year_asc'
    | 'mileage_asc'
  >('date_desc');

  // New states for retro filters - using arrays
  const [selectedRetroTypes, setSelectedRetroTypes] = useState<string[]>([]);
  const [selectedRetroBrands, setSelectedRetroBrands] = useState<string[]>([]);
  const [selectedRetroTransmissions, setSelectedRetroTransmissions] = useState<
    string[]
  >([]);
  const [selectedRetroFuels, setSelectedRetroFuels] = useState<string[]>([]);
  const [retroPriceRange, setRetroPriceRange] = useState<[number, number]>([
    1000000, 400000000,
  ]);
  const [retroYearRange, setRetroYearRange] = useState<[number, number]>([
    1920, 2030,
  ]);

  // Available options derived from vehicles
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableFuels, setAvailableFuels] = useState<string[]>([]);
  const [availableTransmissions, setAvailableTransmissions] = useState<
    string[]
  >([]);
  const [minMaxPrice, setMinMaxPrice] = useState<{ min: number; max: number }>({
    min: 0,
    max: 100000,
  });
  const [minMaxYear, setMinMaxYear] = useState<{ min: number; max: number }>({
    min: 1920,
    max: 2030,
  });

  // Function to apply retro filters
  const applyRetroFilters = () => {
    let filtered = [...vehicles];

    // Filter by search term
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.brand?.name?.toLowerCase().includes(query) ||
          vehicle.model?.name?.toLowerCase().includes(query) ||
          vehicle.year?.toString().includes(query) ||
          vehicle.category?.name?.toLowerCase().includes(query)
      );
    }

    // Filter by type (category)
    if (selectedRetroTypes.length > 0) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.category?.name &&
          selectedRetroTypes.includes(vehicle.category.name as string)
      );
    }

    // Filter by brand
    if (selectedRetroBrands.length > 0) {
      filtered = filtered.filter((vehicle) => {
        const brandName = vehicle.brand?.name;
        return brandName && selectedRetroBrands.includes(brandName as string);
      });
    }

    // Filter by transmission
    if (selectedRetroTransmissions.length > 0) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.transmission &&
          selectedRetroTransmissions.includes(vehicle.transmission as string)
      );
    }

    // Filter by fuel
    if (selectedRetroFuels.length > 0) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.fuel_type?.name &&
          selectedRetroFuels.includes(vehicle.fuel_type.name as string)
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (vehicle) =>
        vehicle.price >= retroPriceRange[0] &&
        vehicle.price <= retroPriceRange[1]
    );

    // Filter by year range
    filtered = filtered.filter(
      (vehicle) =>
        vehicle.year >= retroYearRange[0] && vehicle.year <= retroYearRange[1]
    );

    // Filter by status
    if (showStatuses && showStatuses.length > 0) {
      filtered = filtered.filter((vehicle) => {
        return (
          vehicle.status && showStatuses.includes(vehicle.status.name as any)
        );
      });
    }

    // Apply 3-day recency filter for "Vendido" / "Reservado" statuses
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    filtered = filtered.filter((vehicle) => {
      if (
        vehicle.status?.name === 'Vendido' ||
        vehicle.status?.name === 'Reservado'
      ) {
        if (vehicle.event_date) {
          const eventDate = new Date(vehicle.event_date);
          return eventDate >= threeDaysAgo;
        }
        return false;
      }
      return true;
    });

    setFilteredVehicles(filtered);
  };

  // Function to toggle retro filters
  const toggleRetroFilter = (
    filterType: 'type' | 'brand' | 'fuel' | 'transmission',
    value: string
  ) => {
    const setterMap = {
      type: setSelectedRetroTypes,
      brand: setSelectedRetroBrands,
      fuel: setSelectedRetroFuels,
      transmission: setSelectedRetroTransmissions,
    };

    const selectedMap = {
      type: selectedRetroTypes,
      brand: selectedRetroBrands,
      fuel: selectedRetroFuels,
      transmission: selectedRetroTransmissions,
    };

    const setter = setterMap[filterType];
    const selected = selectedMap[filterType];

    if (selected.includes(value)) {
      setter(selected.filter((item) => item !== value));
    } else {
      setter([...selected, value]);
    }
  };

  // Function to reset retro filters
  const resetRetroFilters = () => {
    setSelectedRetroTypes([]);
    setSelectedRetroBrands([]);
    setSelectedRetroTransmissions([]);
    setSelectedRetroFuels([]);
    setRetroPriceRange([minMaxPrice.min, minMaxPrice.max]);
    setRetroYearRange([minMaxYear.min, minMaxYear.max]);
    setSearchQuery('');
  };

  // Apply retro filters when filter values change
  useEffect(() => {
    if (vehicles.length > 0) {
      applyRetroFilters();
    }
  }, [
    vehicles,
    searchQuery,
    selectedRetroTypes,
    selectedRetroBrands,
    selectedRetroTransmissions,
    selectedRetroFuels,
    retroPriceRange,
    retroYearRange,
    showStatuses,
  ]);

  // Fetch vehicles from Supabase
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!client?.id) return;
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('vehicles')
          .select(
            `
            id, 
            brand_id, 
            model_id, 
            year, 
            price,
            mileage,
            transmission,
            main_image,
            status_id,
            discount_percentage,
            created_at,
            status:status_id(id, name),
            brand:brand_id(id, name),
            model:model_id(id, name),
            category:category_id(id, name),
            fuel_type:fuel_type_id(id, name),
            condition:condition_id(id, name),
            color:color_id(id, name),
            vehicles_sales!vehicle_id(*),
            vehicles_reservations!vehicle_id(*)
          `
          )
          .eq('client_id', +client.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching vehicles:', error);
        } else {
          const typedData = data as unknown as Array<{
            id: any;
            brand: any;
            model: any;
            year: any;
            price: any;
            mileage: any;
            main_image: any;
            status: VehicleStatus;
            discount_percentage: any;
            created_at: any;
            category: { id: any; name: any };
            fuel_type: { id: any; name: any };
            condition: { id: any; name: any };
            color: { id: any; name: any };
            transmission: any;
            vehicles_sales?:
              | Array<{ created_at: string; [key: string]: any }>
              | { created_at: string; [key: string]: any }
              | null;
            vehicles_reservations?:
              | Array<{ created_at: string; [key: string]: any }>
              | { created_at: string; [key: string]: any }
              | null;
            event_date?: string;
          }>;

          // Process event_date for Vendido/Reservado
          const processedData = typedData.map((vehicle) => {
            let event_date: string | undefined;
            if (vehicle.status?.name === 'Vendido' && vehicle.vehicles_sales) {
              if (
                Array.isArray(vehicle.vehicles_sales) &&
                vehicle.vehicles_sales.length > 0
              ) {
                const sortedSales = [...vehicle.vehicles_sales].sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                );
                event_date = sortedSales[0].created_at;
              } else if (
                !Array.isArray(vehicle.vehicles_sales) &&
                (vehicle.vehicles_sales as { created_at: string }).created_at
              ) {
                event_date = (vehicle.vehicles_sales as { created_at: string })
                  .created_at;
              }
            } else if (
              vehicle.status?.name === 'Reservado' &&
              vehicle.vehicles_reservations
            ) {
              if (
                Array.isArray(vehicle.vehicles_reservations) &&
                vehicle.vehicles_reservations.length > 0
              ) {
                const sortedReservations = [
                  ...vehicle.vehicles_reservations,
                ].sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                );
                event_date = sortedReservations[0].created_at;
              } else if (
                !Array.isArray(vehicle.vehicles_reservations) &&
                (vehicle.vehicles_reservations as { created_at: string })
                  .created_at
              ) {
                event_date = (
                  vehicle.vehicles_reservations as { created_at: string }
                ).created_at;
              }
            }
            return { ...vehicle, event_date };
          });

          // Filter vehicles by status names
          const filteredByStatus = processedData.filter(
            (vehicle) =>
              vehicle.status &&
              showStatuses.includes(vehicle.status.name as any)
          );

          // Sort vehicles: Publicado first, then Reservado, then Vendido last
          const sortedVehicles = [...filteredByStatus].sort((a, b) => {
            const statusOrder = { Publicado: 1, Reservado: 2, Vendido: 3 };
            const statusA =
              statusOrder[a.status.name as keyof typeof statusOrder] || 4;
            const statusB =
              statusOrder[b.status.name as keyof typeof statusOrder] || 4;

            if (statusA !== statusB) {
              return statusA - statusB;
            }

            const yearA = a.year || 0;
            const yearB = b.year || 0;
            if (yearA !== yearB) {
              return yearB - yearA;
            }

            if (a.created_at && b.created_at) {
              const dateA = new Date(a.created_at).getTime();
              const dateB = new Date(b.created_at).getTime();
              if (dateA > dateB) return -1;
              if (dateA < dateB) return 1;
            }
            return 0;
          });

          let vehiclesData = sortedVehicles as unknown as ExtendedVehicle[];

          // Apply 3-day recency filter
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          threeDaysAgo.setHours(0, 0, 0, 0);

          vehiclesData = vehiclesData.filter((vehicle) => {
            if (
              vehicle.status?.name === 'Vendido' ||
              vehicle.status?.name === 'Reservado'
            ) {
              if (vehicle.event_date) {
                const eventDate = new Date(vehicle.event_date);
                return eventDate >= threeDaysAgo;
              }
              return false;
            }
            return true;
          });

          setVehicles(vehiclesData);
          setFilteredVehicles(vehiclesData);

          // Extract available filter options
          const brands = [
            ...new Set(vehiclesData.map((v) => v.brand?.name).filter(Boolean)),
          ];
          const types = [
            ...new Set(
              vehiclesData.map((v) => v.category?.name).filter(Boolean)
            ),
          ];
          const fuels = [
            ...new Set(
              vehiclesData.map((v) => v.fuel_type?.name).filter(Boolean)
            ),
          ];
          const transmissions = Array.from(
            new Set(
              vehiclesData
                .map((v) => v.transmission)
                .filter((t) => t !== undefined && t !== null)
            )
          );

          const prices = vehiclesData
            .map((v) => v.price)
            .filter((p) => p !== undefined && p !== null) as number[];
          const minPrice = prices.length > 0 ? Math.min(...prices) : 1000000;
          const maxPrice = prices.length > 0 ? Math.max(...prices) : 400000000;

          const years = vehiclesData
            .map((v) => v.year)
            .filter((y) => y !== undefined && y !== null) as number[];
          const minYear = years.length > 0 ? Math.min(...years) : 1920;
          const maxYear = years.length > 0 ? Math.max(...years) : 2030;

          setAvailableBrands(brands as string[]);
          setAvailableTypes(types as string[]);
          setAvailableFuels(fuels as string[]);
          setAvailableTransmissions(transmissions as string[]);
          setMinMaxPrice({ min: minPrice, max: maxPrice });
          setMinMaxYear({ min: minYear, max: maxYear });
          setRetroPriceRange([minPrice, maxPrice]);
          setRetroYearRange([minYear, maxYear]);
        }
      } catch (err) {
        console.error('Failed to fetch vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [showStatuses, client?.id]);

  // Generate status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Publicado':
        return 'bg-green-100 text-green-800';
      case 'Vendido':
        return 'bg-red-100 text-red-800';
      case 'Reservado':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const refHandler = (element: HTMLDivElement | null) => {
    if (element && connectors.connect) {
      connectors.connect(element);
    }
  };

  return (
    <div
      ref={refHandler}
      style={{
        background: bgColor,
        color: textColor,
        padding: '40px 0',
        position: 'relative',
        border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
      }}
      className='w-full VehicleCatalogRetro vehicles-section'
      data-section='vehicles'
      id='vehicles-section'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6'>
        {loading ? (
          <div className='flex justify-center items-center h-60'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
          </div>
        ) : (
          <div>
            {/* Retro Filters */}
            {showFilters && (
              <VehicleCatalogRetroFilters
                dealershipName={client?.name || 'Automotora'}
                searchTerm={searchQuery}
                onSearchChange={setSearchQuery}
                selectedTypes={selectedRetroTypes}
                selectedBrands={selectedRetroBrands}
                selectedTransmissions={selectedRetroTransmissions}
                selectedFuels={selectedRetroFuels}
                onToggleFilter={toggleRetroFilter}
                priceRange={retroPriceRange}
                onPriceRangeChange={setRetroPriceRange}
                minPrice={minMaxPrice.min}
                maxPrice={minMaxPrice.max}
                yearRange={retroYearRange}
                onYearRangeChange={setRetroYearRange}
                minYear={minMaxYear.min}
                maxYear={minMaxYear.max}
                availableBrands={availableBrands}
                availableTypes={availableTypes}
                availableTransmissions={availableTransmissions}
                availableFuels={availableFuels}
                categories={categories}
                onSearch={applyRetroFilters}
                onReset={resetRetroFilters}
              />
            )}

            <div className='flex flex-col md:flex-row gap-6'>
              {/* Results Section */}
              <div
                className={`flex-1 ${
                  filteredVehicles.length === 0
                    ? 'flex justify-center items-center min-h-[300px]'
                    : ''
                }`}
              >
                {filteredVehicles.length === 0 ? (
                  <div className='text-center p-8 bg-gray-50 rounded-xl'>
                    <div className='text-gray-400 mb-3'>
                      <Search size={48} className='mx-auto opacity-50' />
                    </div>
                    <h3 className='text-lg font-medium text-gray-700 mb-2'>
                      No se encontraron vehículos
                    </h3>
                    <p className='text-gray-500 mb-4'>
                      Intenta ajustar los filtros o buscar otra cosa
                    </p>
                    <Button variant='outline' onClick={resetRetroFilters}>
                      Quitar todos los filtros
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className='mb-4 flex justify-between items-center'>
                      <p className='text-sm text-gray-500'>
                        <span className='font-medium text-gray-700'>
                          {filteredVehicles.length}
                        </span>{' '}
                        vehículos encontrados
                      </p>
                    </div>

                    <VehicleList
                      vehicles={filteredVehicles}
                      columns={columns}
                      getStatusColor={getStatusColor}
                      sortOrder={sortOrder}
                      setSortOrder={setSortOrder}
                      cardSettings={cardSettings}
                      newBadgeText={newBadgeText}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

VehicleCatalogRetro.craft = {
  displayName: 'Catálogo de Vehículos Retro',
  props: {
    title: 'Catálogo de Vehículos Retro',
    subtitle: 'Explora nuestro inventario de vehículos disponibles',
    bgColor: '#ffffff',
    textColor: '#333333',
    columns: 3,
    showStatuses: ['Publicado', 'Reservado', 'Vendido'],
    showFilters: true,
    cardSettings: [
      {
        cardBgColor: '#ffffff',
        cardBorderColor: '#e5e7eb',
        cardTextColor: '#1f2937',
        cardPriceColor: '#ffffff',
        cardButtonColor: '#e05d31',
        cardButtonTextColor: '#ffffff',
        detailsButtonText: 'Ver detalles',
        bannerPosition: 'right',
        featuresConfig: {
          feature1: 'category',
          feature2: 'year',
          feature3: 'fuel',
          feature4: 'mileage',
        },
      },
    ],
    newBadgeText: 'Recién publicado',
  },
  related: {},
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
  isCanvas: true,
};
