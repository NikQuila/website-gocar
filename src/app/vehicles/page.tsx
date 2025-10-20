'use client';

import React, { useEffect, useMemo, useState, useDeferredValue, useCallback } from 'react';
import { Icon } from '@iconify/react';
import useMediaQuery from '@/hooks/useMediaQuery';
import useVehiclesStore from '@/store/useVehiclesStore';
import { Vehicle } from '@/utils/types';
import {
  Button,
  Skeleton,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
} from '@heroui/react';
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton';
import ModalSlideFilter from '@/components/filters/ModalSlideFilter';
import VehicleVerticalCard from '@/components/vehicles/VehicleVerticalCard';
import { useGeneralStore } from '@/store/useGeneralStore';
import useVehicleFiltersStore from '@/store/useVehicleFiltersStore';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import NewVehicleFilters from '@/sections/vehicles/new-vehicle-filters';

// ------------------------------------
// Helpers
// ------------------------------------
const isAvailable = (v: Vehicle) =>
  v.status?.name !== 'Vendido' && v.status?.name !== 'Reservado';

const valueMatches = (
  filterVal: string | string[] | undefined,
  candidate?: number | string | null
) => {
  if (!filterVal) return true;
  const c = candidate?.toString();
  if (!c) return false;
  return Array.isArray(filterVal) ? filterVal.includes(c) : filterVal === c;
};

const asArray = (v?: string | string[]) => (Array.isArray(v) ? v : v ? [v] : []);

// Traducción con fallback HUMANO. Si t(key) === key -> usa fallback.
function useTx() {
  const { t } = useTranslation();
  const tx = (key: string, fallback: string) => {
    const val = t?.(key) ?? '';
    if (!val || val === key) return fallback;
    return val;
  };
  return { tx };
}

// ------------------------------------
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

const VehiclesPage: React.FC = () => {
  const { tx } = useTx();
  const isMd = useMediaQuery('(min-width: 768px)');

  const { vehicles, isLoading } = useVehiclesStore();
  const {
    initializeStore,
    colors,
    fuelTypes,
    conditions,
    categories: categoriesFromStore,
    isLoading: isGeneralStoreLoading,
  } = useGeneralStore();

  const {
    filters,
    setFilters,
    priceRange,
    setPriceRange,
    sortOrder,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    clearFilters,
  } = useVehicleFiltersStore();

  // cargar catálogos
  useEffect(() => { initializeStore(); }, [initializeStore]);

  // catálogos dedup
  const brands = useMemo(
    () => Array.from(new Map(vehicles.filter(v => v.brand).map(v => [v.brand!.id, v.brand!])).values()),
    [vehicles]
  );
  const models = useMemo(
    () => Array.from(new Map(vehicles.filter(v => v.model).map(v => [v.model!.id, v.model!])).values()),
    [vehicles]
  );
  const categories = useMemo(() => {
    if (categoriesFromStore?.length) return categoriesFromStore;
    return Array.from(new Map(vehicles.filter(v => v.category).map(v => [v.category!.id, v.category!])).values());
  }, [categoriesFromStore, vehicles]);

  // max price (solo disponibles)
  const maxPrice = useMemo(() => {
    const list = vehicles.filter(isAvailable).map(v => v.price || 0);
    return Math.max(0, ...list, 0);
  }, [vehicles]);

  // rango inicial una sola vez
  useEffect(() => {
    if (maxPrice > 0 && priceRange[0] === 0 && priceRange[1] === 0) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice, priceRange, setPriceRange]);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Etiquetas con fallback (sin claves crudas)
  const sortOptions = [
    { key: 'date_desc',   label: tx('vehicles.sorting.dateDesc',  'Más recientes'), icon: 'mdi:clock-outline' },
    { key: 'date_asc',    label: tx('vehicles.sorting.dateAsc',   'Más antiguos'),  icon: 'mdi:clock' },
    { key: 'price_asc',   label: tx('vehicles.sorting.priceAsc',  'Precio ↑'),      icon: 'mdi:sort-ascending' },
    { key: 'price_desc',  label: tx('vehicles.sorting.priceDesc', 'Precio ↓'),      icon: 'mdi:sort-descending' },
    { key: 'year_desc',   label: tx('vehicles.sorting.yearDesc',  'Año ↓'),         icon: 'mdi:calendar' },
    { key: 'year_asc',    label: tx('vehicles.sorting.yearAsc',   'Año ↑'),         icon: 'mdi:calendar-outline' },
    { key: 'mileage_asc', label: tx('vehicles.sorting.mileageAsc','Kilometraje ↓'), icon: 'mdi:speedometer-slow' },
  ] as const;

  const titleText = tx('pages.vehicles.title', 'Vehículos');
  const foundText = tx('pages.vehicles.found', 'encontrados');
  const orderByText = tx('pages.vehicles.orderBy', 'Ordenar');
  const searchPlaceholder = tx('pages.vehicles.searchPlaceholder', 'Buscar por marca, modelo, categoría o año…');
  const noResultsText = tx('pages.vehicles.noResults', 'Sin resultados con los filtros actuales');
  const filtersTitle = tx('vehicles.filters.title', 'Filtros');
  const clearFiltersText = tx('vehicles.filters.clearFilters', 'Limpiar filtros');

  const availableYears = useMemo(
    () =>
      [...new Set(vehicles.map((v) => v.year).filter(Boolean))]
        .map(String)
        .sort((a, b) => b.localeCompare(a)),
    [vehicles]
  );

  // búsqueda con defer
  const deferredSearch = useDeferredValue(searchQuery);
  const terms = deferredSearch.trim()
    ? deferredSearch.trim().toLowerCase().split(' ').filter(Boolean)
    : [];

  // filtrar + buscar (usa data, no i18n)
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (terms.length) {
        const brand = vehicle.brand?.name?.toLowerCase() || '';
        const model = vehicle.model?.name?.toLowerCase() || '';
        const category = vehicle.category?.name?.toLowerCase() || '';
        const year = vehicle.year ? String(vehicle.year) : '';
        const text = [brand, model, category, year].join(' ');
        if (!terms.every((t) => text.includes(t))) return false;
      }

      if (!valueMatches(filters.brand as any, vehicle?.brand?.id)) return false;
      if (!valueMatches(filters.model as any, vehicle?.model?.id)) return false;
      if (!valueMatches(filters.category as any, vehicle?.category?.id)) return false;
      if (!valueMatches(filters.fuel_type as any, vehicle?.fuel_type?.id)) return false;
      if (!valueMatches(filters.condition as any, vehicle?.condition?.id)) return false;
      if (!valueMatches(filters.color as any, vehicle?.color?.id)) return false;

      const yf = filters.year as any;
      if (yf) {
        const y = vehicle?.year?.toString() ?? '';
        if (Array.isArray(yf) ? !yf.includes(y) : y !== yf) return false;
      }

      if (typeof vehicle?.price === 'number') {
        if (vehicle.price < priceRange[0] || vehicle.price > priceRange[1]) return false;
      }

      return true;
    });
  }, [vehicles, filters, priceRange, terms]);

  const isPageLoading = isLoading || isGeneralStoreLoading;

  // ordenamiento
  const sortVehicles = useCallback((list: Vehicle[]) => {
    const stateScore = (v: Vehicle) =>
      v.status?.name === 'Vendido' ? 2 : v.status?.name === 'Reservado' ? 1 : 0;
    return [...list].sort((a, b) => {
      const s = stateScore(a) - stateScore(b);
      if (s !== 0) return s;
      switch (sortOrder) {
        case 'date_desc':
          return +new Date(b.created_at || 0) - +new Date(a.created_at || 0);
        case 'date_asc':
          return +new Date(a.created_at || 0) - +new Date(b.created_at || 0);
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
  }, [sortOrder]);

  // chips aplicados (labels desde DATA)
  const labelOf = (list: { id: string | number; name?: string }[], id: string) =>
    list.find(i => String(i.id) === String(id))?.name || id;

  const removeOne = (key: keyof typeof filters, id: string) => {
    const current = asArray(filters[key]);
    const next = current.filter((x) => x !== id);
    const nf = { ...filters } as any;
    if (next.length) nf[key] = next; else delete nf[key];
    setFilters(nf);
  };

  // Estilo CTA (backend → CSS var). No rompe SSR.
  const CTA_STYLE: React.CSSProperties = {
    backgroundColor: 'var(--brand-color)',
    borderColor: 'var(--brand-color)',
    color: 'var(--on-brand-color, #fff)',
  };

  const LoadingState = () => (
    <div className="w-full">
      <div className="mb-4 ">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="w-40 rounded-lg dark:bg-dark-card">
              <div className="h-7 w-40 rounded-lg bg-default-300 dark:bg-dark-border" />
            </Skeleton>
            <Skeleton className="w-56 rounded-lg dark:bg-dark-card">
              <div className="h-4 w-56 rounded-lg bg-default-200 dark:bg-dark-border" />
            </Skeleton>
          </div>
          {!isMd && (
            <Skeleton className="w-24 rounded-lg dark:bg-dark-card">
              <div className="h-9 w-24 rounded-lg bg-default-300 dark:bg-dark-border" />
            </Skeleton>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <VehicleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <main className="grid grid-cols-1 md:grid-cols-4">
          {/* Sidebar (desktop) - STICKY y CENTRADO */}
          {isMd && (
            <aside className="col-span-1 mt-20 w-[272px] mx-auto justify-self-center">
              <div className="md:sticky md:top-[5rem]">
                <div className="rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 backdrop-blur">
                  <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10">
                    <NewVehicleFilters
                      brands={brands as any[]}
                      models={models as any[]}
                      categories={categories as any[]}
                      fuelTypes={fuelTypes as any[]}
                      conditions={conditions as any[]}
                      colors={colors as any[]}
                      availableYears={availableYears}
                      maxPrice={maxPrice}
                      ctaColor="var(--brand-color)"
                    />
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Modal (mobile) */}
          {!isMd && (
            <ModalSlideFilter
              isOpen={isFilterModalOpen}
              onClose={() => setIsFilterModalOpen(false)}
            >
              <NewVehicleFilters
                brands={brands as any[]}
                models={models as any[]}
                categories={categories as any[]}
                fuelTypes={fuelTypes as any[]}
                conditions={conditions as any[]}
                colors={colors as any[]}
                availableYears={availableYears}
                maxPrice={maxPrice}
                ctaColor="var(--brand-color)"
              />
            </ModalSlideFilter>
          )}

          {/* Contenido principal */}
          <div className="col-span-1 md:col-span-3 flex-1 transition-all duration-300 md:ml-4 md:mr-4 mx-1">
            <div className="px-4 sm:px-6 pt-20">
              {isPageLoading ? (
                <LoadingState />
              ) : (
                <>
                  <div className="mb-4 sm:mb-6">
                    <div className="flex-1 flex flex-col max-w-full">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            {titleText}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredVehicles.length} {foundText}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                variant="light"
                                startContent={<Icon icon="mdi:sort" className="text-base" />}
                                className="hidden sm:flex items-center gap-x-1 px-3 min-h-[40px] text-sm bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 rounded-2xl border border-gray-200 dark:border-white/10"
                              >
                                {sortOptions.find((o) => o.key === sortOrder)?.label || orderByText}
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                              selectionMode="single"
                              selectedKeys={new Set([sortOrder])}
                              onSelectionChange={(keys) => {
                                const k = Array.from(keys)[0];
                                if (k) setSortOrder(String(k));
                              }}
                            >
                              {sortOptions.map((option) => (
                                <DropdownItem key={option.key} startContent={<Icon icon={option.icon} className="text-sm" />}>
                                  {option.label}
                                </DropdownItem>
                              ))}
                            </DropdownMenu>
                          </Dropdown>

                          {/* Filtros (mobile) */}
                          <Button
                            onPress={() => setIsFilterModalOpen(true)}
                            className="md:hidden h-9 px-3 text-sm"
                            variant="solid"
                            startContent={<Icon icon="solar:filter-linear" width={18} className="dark:text-white" />}
                            aria-label="Abrir filtros"
                            color="primary"
                            style={CTA_STYLE}
                          >
                            {filtersTitle}
                          </Button>
                        </div>
                      </div>

                      {/* Chips de filtros aplicados */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {(Object.keys(filters) as (keyof typeof filters)[]).flatMap((k) =>
                          asArray(filters[k]).map((id) => {
                            const label =
                              k === 'brand' ? labelOf(brands as any[], String(id)) :
                              k === 'model' ? labelOf(models as any[], String(id)) :
                              k === 'category' ? labelOf(categories as any[], String(id)) :
                              k === 'fuel_type' ? labelOf(fuelTypes as any[], String(id)) :
                              k === 'condition' ? labelOf(conditions as any[], String(id)) :
                              k === 'color' ? labelOf(colors as any[], String(id)) :
                              k === 'year' ? String(id) : String(id);

                            return (
                              <Chip
                                key={`${String(k)}-${id}`}
                                variant="flat"
                                color="primary"
                                onClose={() => removeOne(k, String(id))}
                                className="h-7"
                              >
                                {label}
                              </Chip>
                            );
                          })
                        )}

                        {(priceRange[0] > 0 || (maxPrice > 0 && priceRange[1] < maxPrice)) && (
                          <Chip
                            variant="flat"
                            color="primary"
                            onClose={() => setPriceRange([0, maxPrice])}
                            className="h-7"
                          >
                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(priceRange[0])}
                            {' — '}
                            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(priceRange[1])}
                          </Chip>
                        )}

                        {searchQuery.trim() && (
                          <Chip variant="flat" color="primary" onClose={() => setSearchQuery('')} className="h-7">
                            {searchQuery}
                          </Chip>
                        )}

                        {sortOrder !== 'date_desc' && (
                          <Chip variant="flat" color="primary" onClose={() => setSortOrder('date_desc')} className="h-7">
                            {orderByText}
                          </Chip>
                        )}

                        <Button
                          size="sm"
                          variant="light"
                          className="h-7"
                          onPress={() => clearFilters(maxPrice)}
                          startContent={<Icon icon="mdi:filter-remove-outline" className="text-base" />}
                        >
                          {clearFiltersText}
                        </Button>
                      </div>

                      {/* Search + Sort (mobile) */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
                        <div className="w-full sm:flex-[3] relative mt-1">
                          <Icon
                            icon="mdi:magnify"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                            width={20}
                          />
                          <Input
                            id="vehicles-search"
                            type="text"
                            placeholder={searchPlaceholder}
                            className="pl-11 pr-3 py-2 min-h-[42px] rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#121219] text-sm text-gray-800 dark:text-gray-200 shadow-sm focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/40 transition-all w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>

                        <div className="w-full sm:w-1/4 flex-1 sm:hidden">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                variant="light"
                                startContent={<Icon icon="mdi:sort" className="text-base" />}
                                className="w-full flex items-center gap-x-1 px-3 min-h-[42px] text-sm bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 rounded-2xl border border-gray-200 dark:border-white/10"
                              >
                                {sortOptions.find((o) => o.key === sortOrder)?.label || orderByText}
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                              selectionMode="single"
                              selectedKeys={new Set([sortOrder])}
                              onSelectionChange={(keys) => {
                                const k = Array.from(keys)[0];
                                if (k) setSortOrder(String(k));
                              }}
                            >
                              {sortOptions.map((option) => (
                                <DropdownItem key={option.key} startContent={<Icon icon={option.icon} className="text-sm" />}>
                                  {option.label}
                                </DropdownItem>
                              ))}
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid */}
                  {filteredVehicles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-300 dark:border-white/10 rounded-3xl bg-white/50 dark:bg-white/[0.03]">
                      <Icon icon="mdi:car-off" className="text-5xl text-gray-400 mb-3" />
                      <p className="text-gray-700 dark:text-gray-300 font-medium">
                        {noResultsText}
                      </p>
                      <Button
                        className="mt-4"
                        variant="light"
                        onPress={() => clearFilters(maxPrice)}
                        startContent={<Icon icon="mdi:filter-remove-outline" />}
                      >
                        {clearFiltersText}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:gap-6 pb-12 mt-2 sm:mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                      {sortVehicles(filteredVehicles).map((vehicle) => (
                        <VehicleVerticalCard key={vehicle.id} vehicle={vehicle} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </ClientOnly>
  );
};

export default VehiclesPage;
