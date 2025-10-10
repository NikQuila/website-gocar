import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Search, Car, Truck, Bike, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  // Button colors
  filterButtonBgColor?: string;
  filterButtonTextColor?: string;
  filterButtonBorderColor?: string;
  resetButtonBgColor?: string;
  resetButtonTextColor?: string;
  resetButtonBorderColor?: string;
  // Global filter color
  filterGlobalColor?: string;
  // Slider label colors
  sliderLabelBgColor?: string;
  sliderLabelTextColor?: string;
  sliderLabelBorderColor?: string;
  // Sizes
  titleSize?: number;
  categoryImageSize?: number;
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
  // Button colors with defaults
  filterButtonBgColor = '#2a2a2a',
  filterButtonTextColor = '#ffffff',
  filterButtonBorderColor = '#ffffff',
  resetButtonBgColor = 'transparent',
  resetButtonTextColor = '#ffffff',
  resetButtonBorderColor = '#ffffff',
  // Global filter color
  filterGlobalColor,
  // Slider label colors with defaults
  sliderLabelBgColor = '#4a5568',
  sliderLabelTextColor = '#ffffff',
  sliderLabelBorderColor = '#ffffff',
  // Sizes with defaults
  titleSize = 1.875,
  categoryImageSize = 80,
}) => {
  // Aplicar color global a todos los elementos si está definido
  const effectiveTextColor = filterGlobalColor || '#ffffff';
  const effectiveBorderColor = filterGlobalColor || '#ffffff';
  const effectiveSliderLabelTextColor =
    filterGlobalColor || sliderLabelTextColor;

  // Función para ajustar el brillo de un color
  const adjustBrightness = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));

    return `#${newR.toString(16).padStart(2, '0')}${newG
      .toString(16)
      .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  // Colores para el slider - barra y handles
  const effectiveSliderTrackColor = filterGlobalColor || '#ffffff';
  // Hacer las pelotitas un poco más oscuras que la barra
  const effectiveSliderHandleColor = filterGlobalColor
    ? adjustBrightness(filterGlobalColor, -20)
    : '#cccccc';

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Componente Slider personalizado con colores globales
  const CustomSlider = ({
    value,
    onValueChange,
    max,
    min,
    step,
    className,
  }: any) => {
    return (
      <div
        className={`relative flex w-full touch-none select-none items-center ${
          className || ''
        }`}
      >
        <div
          className='relative h-2 w-full grow overflow-hidden rounded-full'
          style={{ backgroundColor: '#374151' }}
        >
          <div
            className='absolute h-full rounded-full'
            style={{
              backgroundColor: effectiveSliderTrackColor,
              left: `${((value[0] - min) / (max - min)) * 100}%`,
              right: `${100 - ((value[1] - min) / (max - min)) * 100}%`,
            }}
          />
        </div>
        {value.map((val: number, i: number) => (
          <div
            key={i}
            className='block h-5 w-5 rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer'
            style={{
              backgroundColor: effectiveSliderHandleColor,
              borderColor: effectiveSliderTrackColor,
              position: 'absolute',
              left: `${((val - min) / (max - min)) * 100}%`,
              transform: 'translateX(-50%)',
              zIndex: 2,
            }}
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startValue = val;
              const range = max - min;

              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX;
                const deltaValue = (deltaX / 300) * range; // 300px es el ancho aproximado del slider
                const newValue = Math.max(
                  min,
                  Math.min(max, startValue + deltaValue)
                );

                if (step) {
                  const steppedValue = Math.round(newValue / step) * step;
                  const newValues = [...value];
                  newValues[i] = steppedValue;
                  onValueChange(newValues);
                } else {
                  const newValues = [...value];
                  newValues[i] = newValue;
                  onValueChange(newValues);
                }
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        ))}
      </div>
    );
  };

  // Estados para controlar qué filtros están abiertos
  const [typeOpen, setTypeOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [transmissionOpen, setTransmissionOpen] = useState(false);
  const [fuelOpen, setFuelOpen] = useState(false);

  // Debug: Log available options
  console.log('VehicleCatalogRetroFilters - Available options:', {
    types: availableTypes,
    brands: availableBrands,
    transmissions: availableTransmissions,
    fuels: availableFuels,
  });

  return (
    <div className='text-white'>
      {/* Dealership Name Title */}
      <div className='text-center mb-1 -mt-2'>
        <h2
          className='font-bold'
          style={{
            color: effectiveTextColor,
            fontSize: `${titleSize}rem`,
          }}
        >
          {dealershipName}
        </h2>
      </div>

      {/* Vehicle Type Icons */}
      <div className='mb-3'>
        <div className='flex justify-center gap-4 flex-wrap'>
          {availableTypes.map((type) => {
            const category = categories.find(
              (cat) => cat.name?.toUpperCase() === type.toUpperCase()
            );
            const imageUrl = category?.UrlPhotos;

            return (
              <button
                key={type}
                onClick={() => onToggleFilter('type', type)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
                  selectedTypes.includes(type)
                    ? 'border'
                    : 'bg-transparent hover:brightness-125 hover:scale-105'
                }`}
                style={{
                  backgroundColor: selectedTypes.includes(type)
                    ? filterButtonBgColor
                    : 'transparent',
                  color: filterButtonTextColor,
                  borderColor: filterButtonBorderColor,
                  filter: selectedTypes.includes(type)
                    ? 'brightness(1)'
                    : 'brightness(0.8)',
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={type}
                    className={`object-contain transition-all duration-300 ${
                      selectedTypes.includes(type)
                        ? 'brightness-100'
                        : 'brightness-80 hover:brightness-125'
                    }`}
                    style={{
                      width: `${categoryImageSize}px`,
                      height: `${categoryImageSize}px`,
                    }}
                  />
                ) : (
                  <div
                    className={`transition-all duration-300 ${
                      selectedTypes.includes(type)
                        ? 'brightness-100'
                        : 'brightness-80 hover:brightness-125'
                    }`}
                  >
                    {vehicleTypeIcons[
                      type as keyof typeof vehicleTypeIcons
                    ] || <Car className='w-24 h-24' />}
                  </div>
                )}
                <span
                  className={`text-sm font-medium -mt-2 transition-all duration-300 ${
                    selectedTypes.includes(type) ? '' : 'hover:brightness-125'
                  }`}
                  style={{ color: effectiveTextColor }}
                >
                  {type}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className='flex justify-center gap-2 mb-3 flex-wrap'>
        {/* Tipo de auto */}
        <div className='relative w-36'>
          <label
            className='block text-xs font-medium mb-1'
            style={{ color: effectiveTextColor }}
          >
            Tipo de auto
          </label>
          <button
            onClick={() => setTypeOpen(!typeOpen)}
            className='w-full bg-transparent px-2 py-1 rounded text-xs flex items-center justify-between hover:bg-gray-800 transition-colors'
            style={{
              borderColor: effectiveBorderColor,
              color: effectiveTextColor,
              border: `1px solid ${effectiveBorderColor}`,
            }}
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
            <div className='absolute z-10 w-full mt-2 bg-gray-900 border border-white rounded-lg p-2 max-h-60 overflow-y-auto'>
              {availableTypes.length > 0 ? (
                availableTypes.map((type) => (
                  <div key={type} className='flex items-center space-x-2 py-1'>
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => onToggleFilter('type', type)}
                      className='border border-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4'
                    />
                    <Label
                      htmlFor={`type-${type}`}
                      className='text-xs cursor-pointer'
                      style={{ color: '#ffffff' }}
                    >
                      {type}
                    </Label>
                  </div>
                ))
              ) : (
                <p className='text-xs text-gray-400'>
                  No hay tipos disponibles
                </p>
              )}
            </div>
          )}
        </div>

        {/* Marca */}
        <div className='relative w-36'>
          <label
            className='block text-xs font-medium mb-1'
            style={{ color: effectiveTextColor }}
          >
            Marca
          </label>
          <button
            onClick={() => setBrandOpen(!brandOpen)}
            className='w-full bg-transparent px-2 py-1 rounded text-xs flex items-center justify-between hover:bg-gray-800 transition-colors'
            style={{
              borderColor: effectiveBorderColor,
              color: effectiveTextColor,
              border: `1px solid ${effectiveBorderColor}`,
            }}
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
            <div className='absolute z-10 w-full mt-2 bg-gray-900 border border-white rounded-lg p-2 max-h-60 overflow-y-auto'>
              {availableBrands.length > 0 ? (
                availableBrands.map((brand) => (
                  <div key={brand} className='flex items-center space-x-2 py-1'>
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={() => onToggleFilter('brand', brand)}
                      className='border border-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4'
                    />
                    <Label
                      htmlFor={`brand-${brand}`}
                      className='text-xs cursor-pointer'
                      style={{ color: '#ffffff' }}
                    >
                      {brand}
                    </Label>
                  </div>
                ))
              ) : (
                <p className='text-xs text-gray-400'>
                  No hay marcas disponibles
                </p>
              )}
            </div>
          )}
        </div>

        {/* Transmisión */}
        <div className='relative w-36'>
          <label
            className='block text-xs font-medium mb-1'
            style={{ color: effectiveTextColor }}
          >
            Transmisión
          </label>
          <button
            onClick={() => setTransmissionOpen(!transmissionOpen)}
            className='w-full bg-transparent px-2 py-1 rounded text-xs flex items-center justify-between hover:bg-gray-800 transition-colors'
            style={{
              borderColor: effectiveBorderColor,
              color: effectiveTextColor,
              border: `1px solid ${effectiveBorderColor}`,
            }}
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
            <div className='absolute z-10 w-full mt-2 bg-gray-900 border border-white rounded-lg p-2 max-h-60 overflow-y-auto'>
              {availableTransmissions.length > 0 ? (
                availableTransmissions.map((transmission) => (
                  <div
                    key={transmission}
                    className='flex items-center space-x-2 py-1'
                  >
                    <Checkbox
                      id={`transmission-${transmission}`}
                      checked={selectedTransmissions.includes(transmission)}
                      onCheckedChange={() =>
                        onToggleFilter('transmission', transmission)
                      }
                      className='border border-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4'
                    />
                    <Label
                      htmlFor={`transmission-${transmission}`}
                      className='text-xs cursor-pointer'
                      style={{ color: '#ffffff' }}
                    >
                      {transmission}
                    </Label>
                  </div>
                ))
              ) : (
                <p className='text-xs text-gray-400'>
                  No hay transmisiones disponibles
                </p>
              )}
            </div>
          )}
        </div>

        {/* Combustible */}
        <div className='relative w-36'>
          <label
            className='block text-xs font-medium mb-1'
            style={{ color: effectiveTextColor }}
          >
            Combustible
          </label>
          <button
            onClick={() => setFuelOpen(!fuelOpen)}
            className='w-full bg-transparent px-2 py-1 rounded text-xs flex items-center justify-between hover:bg-gray-800 transition-colors'
            style={{
              borderColor: effectiveBorderColor,
              color: effectiveTextColor,
              border: `1px solid ${effectiveBorderColor}`,
            }}
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
            <div className='absolute z-10 w-full mt-2 bg-gray-900 border border-white rounded-lg p-2 max-h-60 overflow-y-auto'>
              {availableFuels.length > 0 ? (
                availableFuels.map((fuel) => (
                  <div key={fuel} className='flex items-center space-x-2 py-1'>
                    <Checkbox
                      id={`fuel-${fuel}`}
                      checked={selectedFuels.includes(fuel)}
                      onCheckedChange={() => onToggleFilter('fuel', fuel)}
                      className='border border-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4'
                    />
                    <Label
                      htmlFor={`fuel-${fuel}`}
                      className='text-xs cursor-pointer'
                      style={{ color: '#ffffff' }}
                    >
                      {fuel}
                    </Label>
                  </div>
                ))
              ) : (
                <p className='text-xs text-gray-400'>
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
          <label
            className='block text-xs font-medium mb-2 text-center'
            style={{
              color: effectiveSliderLabelTextColor,
            }}
          >
            Precio Desde - Hasta
          </label>
          <div className='space-y-2'>
            <CustomSlider
              value={priceRange}
              onValueChange={onPriceRangeChange}
              max={maxPrice}
              min={minPrice}
              step={1000000}
              className='w-full'
            />
            <div
              className='flex justify-between text-xs'
              style={{ color: effectiveTextColor }}
            >
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </div>

        <div className='w-40 ml-2'>
          <label
            className='block text-xs font-medium mb-2 text-center'
            style={{
              color: effectiveSliderLabelTextColor,
            }}
          >
            Año Desde - Hasta
          </label>
          <div className='space-y-2'>
            <CustomSlider
              value={yearRange}
              onValueChange={onYearRangeChange}
              max={maxYear}
              min={minYear}
              step={1}
              className='w-full'
            />
            <div
              className='flex justify-between text-xs'
              style={{ color: effectiveTextColor }}
            >
              <span>{yearRange[0]}</span>
              <span>{yearRange[1]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-center gap-4'>
        {onReset && (
          <Button
            onClick={onReset}
            variant='outline'
            className='px-6 py-2 rounded text-sm font-medium border hover:opacity-75 transition-all duration-200'
            style={{
              backgroundColor: resetButtonBgColor,
              color: effectiveTextColor,
              borderColor: effectiveBorderColor,
            }}
          >
            Limpiar Filtros
          </Button>
        )}
      </div>
    </div>
  );
};
