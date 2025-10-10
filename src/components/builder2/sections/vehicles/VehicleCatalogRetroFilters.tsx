import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Search, Car, Truck, Bike, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Category } from '@/utils/types';

interface VehicleCatalogRetroFiltersProps {
  dealershipName?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTypes: string[];
  selectedBrands: string[];
  selectedTransmissions: string[];
  selectedFuels: string[];
  onToggleFilter: (
    filterType: 'type' | 'brand' | 'fuel' | 'transmission',
    value: string
  ) => void;
  priceRange: [number, number];
  onPriceRangeChange: (value: [number, number]) => void;
  minPrice?: number;
  maxPrice?: number;
  yearRange: [number, number];
  onYearRangeChange: (value: [number, number]) => void;
  minYear?: number;
  maxYear?: number;
  availableBrands: string[];
  availableTypes: string[];
  availableTransmissions: string[];
  availableFuels: string[];
  categories: Category[];
  onSearch: () => void;
  onReset?: () => void;
}

const vehicleTypeIcons = {
  CAMIONETA: <Truck className='w-8 h-8' />,
  CONVERTIBLE: <Car className='w-8 h-8' />,
  COUPE: <Car className='w-8 h-8' />,
  HATCHBACK: <Car className='w-8 h-8' />,
  MOTO: <Bike className='w-8 h-8' />,
  SEDAN: <Car className='w-8 h-8' />,
  SUV: <Truck className='w-8 h-8' />,
};

export const VehicleCatalogRetroFilters: React.FC<
  VehicleCatalogRetroFiltersProps
> = ({
  dealershipName = 'Automotora',
  searchTerm,
  onSearchChange,
  selectedTypes,
  selectedBrands,
  selectedTransmissions,
  selectedFuels,
  onToggleFilter,
  priceRange,
  onPriceRangeChange,
  minPrice = 1000000,
  maxPrice = 400000000,
  yearRange,
  onYearRangeChange,
  minYear = 1920,
  maxYear = 2030,
  availableBrands,
  availableTypes,
  availableTransmissions,
  availableFuels,
  categories,
  onSearch,
  onReset,
}) => {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Estados para controlar qué filtros están abiertos
  const [typeOpen, setTypeOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [transmissionOpen, setTransmissionOpen] = useState(false);
  const [fuelOpen, setFuelOpen] = useState(false);

  return (
    <div className='bg-gray-900 text-white p-6 rounded-lg'>
      {/* Dealership Name Title */}
      <div className='text-center mb-4'>
        <h2 className='text-xl md:text-3xl font-bold text-white'>
          {dealershipName}
        </h2>
      </div>

      {/* Vehicle Type Icons */}
      <div className='mb-3'>
        <div className='flex justify-center gap-4 flex-wrap'>
          {availableTypes.map((type) => {
            // Intentar diferentes formas de matching
            const category = categories.find(
              (cat) =>
                cat.name?.toUpperCase() === type.toUpperCase() ||
                cat.name?.toLowerCase() === type.toLowerCase() ||
                cat.name === type
            );
            const imageUrl = category?.UrlPhotos;

            // Debug temporal
            if (type === 'Suv') {
              console.log('Debug SUV:', { category, imageUrl });
            }

            return (
              <button
                key={type}
                onClick={() => onToggleFilter('type', type)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  selectedTypes.includes(type)
                    ? 'bg-blue-600 text-white'
                    : 'bg-transparent text-gray-400 hover:text-white'
                }`}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={type}
                    className={`w-20 h-20 object-contain transition-all duration-200 ${
                      selectedTypes.includes(type)
                        ? 'brightness-100'
                        : 'brightness-75 hover:brightness-100'
                    }`}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  vehicleTypeIcons[type as keyof typeof vehicleTypeIcons] || (
                    <Car className='w-24 h-24' />
                  )
                )}
                <span className='text-sm font-medium -mt-2'>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className='flex justify-center gap-2 mb-3 flex-wrap'>
        {/* Tipo de auto */}
        <div className='relative w-36'>
          <label className='block text-xs font-medium mb-1 text-white'>
            Tipo de auto
          </label>
          <button
            onClick={() => setTypeOpen(!typeOpen)}
            className='w-full bg-transparent border border-white text-white px-2 py-1 rounded text-xs flex items-center justify-between hover:bg-gray-800 transition-colors'
          >
            <span>
              {selectedTypes.length > 0
                ? `${selectedTypes.length} seleccionados`
                : 'Todos'}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                typeOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {typeOpen && (
            <div className='absolute z-10 w-full mt-2 bg-gray-800 border border-white rounded-lg p-3 max-h-60 overflow-y-auto'>
              {availableTypes.length > 0 ? (
                availableTypes.map((type) => (
                  <div
                    key={type}
                    className='flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-700 px-2 rounded'
                    onClick={() => onToggleFilter('type', type)}
                  >
                    <Checkbox
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => onToggleFilter('type', type)}
                      className='border-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
                    />
                    <span className='text-xs text-white flex-1'>{type}</span>
                  </div>
                ))
              ) : (
                <p className='text-sm text-gray-400'>
                  No hay tipos disponibles
                </p>
              )}
            </div>
          )}
        </div>

        {/* Marca */}
        <div className='relative w-36'>
          <label className='block text-xs font-medium mb-1 text-white'>
            Marca
          </label>
          <button
            onClick={() => setBrandOpen(!brandOpen)}
            className='w-full bg-transparent border border-white text-white px-2 py-1 rounded text-xs flex items-center justify-between hover:bg-gray-800 transition-colors'
          >
            <span>
              {selectedBrands.length > 0
                ? `${selectedBrands.length} seleccionados`
                : 'Todas'}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                brandOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {brandOpen && (
            <div className='absolute z-10 w-full mt-2 bg-gray-800 border border-white rounded-lg p-3 max-h-60 overflow-y-auto'>
              {availableBrands.length > 0 ? (
                availableBrands.map((brand) => (
                  <div
                    key={brand}
                    className='flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-700 px-2 rounded'
                    onClick={() => onToggleFilter('brand', brand)}
                  >
                    <Checkbox
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={() => onToggleFilter('brand', brand)}
                      className='border-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
                    />
                    <span className='text-xs text-white flex-1'>{brand}</span>
                  </div>
                ))
              ) : (
                <p className='text-sm text-gray-400'>
                  No hay marcas disponibles
                </p>
              )}
            </div>
          )}
        </div>

        {/* Transmisión */}
        <div className='relative w-36'>
          <label className='block text-xs font-medium mb-1 text-white'>
            Transmisión
          </label>
          <button
            onClick={() => setTransmissionOpen(!transmissionOpen)}
            className='w-full bg-transparent border border-white text-white px-2 py-1 rounded text-xs flex items-center justify-between hover:bg-gray-800 transition-colors'
          >
            <span>
              {selectedTransmissions.length > 0
                ? `${selectedTransmissions.length} seleccionados`
                : 'Todas'}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                transmissionOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {transmissionOpen && (
            <div className='absolute z-10 w-full mt-2 bg-gray-800 border border-white rounded-lg p-3 max-h-60 overflow-y-auto'>
              {availableTransmissions.length > 0 ? (
                availableTransmissions.map((transmission) => (
                  <div
                    key={transmission}
                    className='flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-700 px-2 rounded'
                    onClick={() => onToggleFilter('transmission', transmission)}
                  >
                    <Checkbox
                      checked={selectedTransmissions.includes(transmission)}
                      onCheckedChange={() =>
                        onToggleFilter('transmission', transmission)
                      }
                      className='border-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
                    />
                    <span className='text-xs text-white flex-1'>
                      {transmission}
                    </span>
                  </div>
                ))
              ) : (
                <p className='text-sm text-gray-400'>
                  No hay transmisiones disponibles
                </p>
              )}
            </div>
          )}
        </div>

        {/* Combustible */}
        <div className='relative w-36'>
          <label className='block text-xs font-medium mb-1 text-white'>
            Combustible
          </label>
          <button
            onClick={() => setFuelOpen(!fuelOpen)}
            className='w-full bg-transparent border border-white text-white px-2 py-1 rounded text-xs flex items-center justify-between hover:bg-gray-800 transition-colors'
          >
            <span>
              {selectedFuels.length > 0
                ? `${selectedFuels.length} seleccionados`
                : 'Todos'}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                fuelOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {fuelOpen && (
            <div className='absolute z-10 w-full mt-2 bg-gray-800 border border-white rounded-lg p-3 max-h-60 overflow-y-auto'>
              {availableFuels.length > 0 ? (
                availableFuels.map((fuel) => (
                  <div
                    key={fuel}
                    className='flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-700 px-2 rounded'
                    onClick={() => onToggleFilter('fuel', fuel)}
                  >
                    <Checkbox
                      checked={selectedFuels.includes(fuel)}
                      onCheckedChange={() => onToggleFilter('fuel', fuel)}
                      className='border-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
                    />
                    <span className='text-xs text-white flex-1'>{fuel}</span>
                  </div>
                ))
              ) : (
                <p className='text-sm text-gray-400'>
                  No hay combustibles disponibles
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Range Controls */}
      <div className='flex justify-center gap-4 mb-4'>
        <div className='w-40'>
          <label className='block text-xs font-medium mb-2 text-white'>
            Precio Desde - Hasta
          </label>
          <div className='space-y-2'>
            <Slider
              value={priceRange}
              onValueChange={onPriceRangeChange}
              max={maxPrice}
              min={minPrice}
              step={1000000}
              className='w-full'
            />
            <div className='flex justify-between text-xs text-gray-300'>
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </div>

        <div className='w-40'>
          <label className='block text-xs font-medium mb-2 text-white'>
            Año Desde - Hasta
          </label>
          <div className='space-y-2'>
            <Slider
              value={yearRange}
              onValueChange={onYearRangeChange}
              max={maxYear}
              min={minYear}
              step={1}
              className='w-full'
            />
            <div className='flex justify-between text-xs text-gray-300'>
              <span>{yearRange[0]}</span>
              <span>{yearRange[1]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className='flex justify-center'>
        {onReset && (
          <Button
            onClick={onReset}
            variant='outline'
            className='border-white text-black hover:bg-gray-700 px-2 py-0.5 rounded text-[10px] h-6'
          >
            Limpiar Filtros
          </Button>
        )}
      </div>
    </div>
  );
};
