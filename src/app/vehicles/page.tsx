"use client";
import { useState } from "react";
import VehicleFilters from "../../sections/vehicles/FilterSection";
import { Icon } from "@iconify/react";
import useMediaQuery from "../../hooks/useMediaQuery";
import useVehiclesStore from "../../store/useVehiclesStore";
import { VehicleFilters as VehicleFiltersType } from "@/utils/types";
import { Button, Skeleton } from "@heroui/react";
import VehicleCardSkeleton from "@/components/vehicles/VehicleCardSkeleton";
import ModalSlideFilter from "@/components/filters/ModalSlideFilter";
import VehicleVerticalCard from "@/components/vehicles/VehicleVerticalCard";

const VehiclesPage = () => {
  const { vehicles, isLoading } = useVehiclesStore();
  const isMd = useMediaQuery("(min-width: 768px)");
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [filters, setFilters] = useState<VehicleFiltersType>({});
  const [priceRange, setPriceRange] = useState([0, 1000000000]);

  // Extraer valores únicos para los filtros
  const brands = [...new Set(vehicles.map((v) => v.brand))];
  const categories = [
    "SUV",
    "Sedan",
    "Hatchback",
    "Pickup",
    "Van",
    "Coupe",
    "Wagon",
  ];
  const fuelTypes = ["Gasoline", "Diesel", "Hybrid", "Electric", "Gas"];
  const transmissions = ["Manual", "Automatic"];
  const conditions = ["New", "Used", "Certified Pre-Owned"];

  const handleFilterChange = (key: keyof VehicleFiltersType, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setPriceRange([0, 1000000000]);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    let matches = true;

    if (filters.brand && vehicle?.brand?.id !== filters.brand) matches = false;
    if (filters.category && vehicle?.category_new?.name !== filters.category)
      matches = false;
    if (filters.fuel_type && vehicle?.fuel_type_new?.name !== filters.fuel_type)
      matches = false;
    if (filters.transmission && vehicle.transmission !== filters.transmission)
      matches = false;
    if (filters.condition && vehicle?.condition_new?.name !== filters.condition)
      matches = false;
    if (vehicle?.price < priceRange[0] || vehicle?.price > priceRange[1])
      matches = false;

    return matches;
  });

  const sortVehicles = (vehicles: Vehicle[]) => {
    return [...vehicles].sort((a, b) => {
      // Primero separamos vendidos de no vendidos
      if (a.status === "sold" && b.status !== "sold") return 1;
      if (a.status !== "sold" && b.status === "sold") return -1;

      // Si ambos están vendidos, ordenar por fecha de venta (más reciente primero)
      if (a.status === "sold" && b.status === "sold") {
        return new Date(b.sold_at!).getTime() - new Date(a.sold_at!).getTime();
      }

      return 0;
    });
  };

  // Aplicar el ordenamiento antes de renderizar
  const sortedVehicles = sortVehicles(filteredVehicles);

  const LoadingState = () => (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="w-32 rounded-lg dark:bg-dark-card">
              <div className="h-8 w-32 rounded-lg bg-default-300 dark:bg-dark-border"></div>
            </Skeleton>
            <Skeleton className="w-48 rounded-lg dark:bg-dark-card">
              <div className="h-4 w-48 rounded-lg bg-default-200 dark:bg-dark-border"></div>
            </Skeleton>
          </div>
          {!isMd && (
            <Skeleton className="w-24 rounded-lg dark:bg-dark-card">
              <div className="h-10 w-24 rounded-lg bg-default-300 dark:bg-dark-border"></div>
            </Skeleton>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
        {Array(6)
          .fill(null)
          .map((_, index) => (
            <VehicleCardSkeleton key={index} />
          ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white dark:bg-dark-bg">
      {/* Sidebar */}
      <aside className="hidden md:block w-[250px] min-w-[250px] h-screen sticky top-0 border-r border-gray-100 dark:border-dark-border">
        <div className="">
          <ModalSlideFilter
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          >
            <VehicleFilters
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
          </ModalSlideFilter>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <div className="px-6 pt-20">
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Vehículos
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredVehicles.length} vehículos encontrados
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsFilterOpen(true)}
                    className="md:hidden"
                    color="primary"
                    variant="light"
                    startContent={
                      <Icon
                        icon="solar:filter-linear"
                        width={20}
                        className="dark:text-white"
                      />
                    }
                  >
                    Filtros
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                {sortedVehicles.map((vehicle) => (
                  <VehicleVerticalCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default VehiclesPage;
