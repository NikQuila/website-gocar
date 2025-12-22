import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Banknote,
  Car,
  CarFront,
  Fuel,
  RotateCcw,
  Star,
  Palette,
  X,
  Filter,
  Calendar,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

// Filter interfaces
export interface PriceRange {
  min: number;
  max: number;
}

export interface VehicleFiltersProps {
  priceRange: PriceRange;
  /** El store expone un setter tipo (next: PriceRange) => void, no el setter funcional de React */
  setPriceRange: (next: PriceRange) => void;
  minMaxPrice: { min: number; max: number };
  selectedBrands: string[];
  setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>;
  availableBrands: string[];
  selectedYears: string[];
  setSelectedYears: React.Dispatch<React.SetStateAction<string[]>>;
  availableYears: string[];
  selectedTypes: string[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
  availableTypes: string[];
  selectedFuels: string[];
  setSelectedFuels: React.Dispatch<React.SetStateAction<string[]>>;
  availableFuels: string[];
  selectedConditions: string[];
  setSelectedConditions: React.Dispatch<React.SetStateAction<string[]>>;
  availableConditions: string[];
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  availableColors: string[];
  toggleFilter: (
    filter: string,
    type: 'brand' | 'year' | 'type' | 'fuel' | 'condition' | 'color'
  ) => void;
  activeVehicleType: string;
  resetAllFilters: () => void;
}

export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  priceRange,
  setPriceRange,
  minMaxPrice,
  selectedBrands,
  setSelectedBrands,
  availableBrands,
  selectedYears,
  setSelectedYears,
  availableYears,
  selectedTypes,
  setSelectedTypes,
  availableTypes,
  selectedFuels,
  setSelectedFuels,
  availableFuels,
  selectedConditions,
  setSelectedConditions,
  availableConditions,
  selectedColors,
  setSelectedColors,
  availableColors,
  toggleFilter,
  activeVehicleType,
  resetAllFilters,
}) => {
  const [priceRangeOpen, setPriceRangeOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [typeOpen, setTypeOpen] = useState(false);
  const [fuelOpen, setFuelOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedTypes.length > 0 ||
    selectedFuels.length > 0 ||
    selectedConditions.length > 0 ||
    selectedColors.length > 0 ||
    selectedYears.length > 0 ||
    priceRange.min !== minMaxPrice.min ||
    priceRange.max !== minMaxPrice.max;

  function formatPrice(price: number) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  }

  const FilterSection = ({
    title,
    icon,
    isOpen,
    toggleOpen,
    selectedItems,
    availableItems,
    type,
  }: {
    title: string;
    icon: React.ReactNode;
    isOpen: boolean;
    toggleOpen: () => void;
    selectedItems: string[];
    availableItems: string[];
    type: 'brand' | 'year' | 'type' | 'fuel' | 'condition' | 'color';
  }) => {
    const [search, setSearch] = useState('');
    const filteredItems =
      (type === 'brand' || type === 'year' || type === 'type') && search
        ? availableItems.filter((item) =>
            item.toLowerCase().includes(search.toLowerCase())
          )
        : availableItems;

    return (
      <div className='mb-4 border-b border-slate-100 dark:border-neutral-800 pb-4'>
        <button
          className='flex w-full items-center justify-between cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800 p-2 rounded-md'
          onClick={() => toggleOpen()}
          type='button'
        >
          <div className='flex items-center gap-2'>
            {icon}
            <span className='font-medium text-gray-800 dark:text-white'>{title}</span>
            {selectedItems.length > 0 && (
              <Badge
                variant='secondary'
                className='ml-1 bg-blue-50 text-blue-700 text-xs'
              >
                {selectedItems.length}
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronDown size={18} className='text-gray-600 dark:text-gray-400' />
          ) : (
            <ChevronRight size={18} className='text-gray-600 dark:text-gray-400' />
          )}
        </button>

        {isOpen && (
          <div className='mt-3 pl-6 space-y-2 max-h-[200px] overflow-y-auto pr-2'>
            {(type === 'brand' || type === 'year' || type === 'type') && (
              <div className='mb-2 sticky top-0 bg-white dark:bg-neutral-900 z-10'>
                <Input
                  type='text'
                  placeholder={
                    type === 'brand'
                      ? 'Buscar marca...'
                      : type === 'year'
                      ? 'Buscar año...'
                      : 'Buscar tipo...'
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='border-slate-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white mt-1 focus:ring-2 focus:ring-blue-200 text-xs py-1 px-2 rounded-md shadow-sm'
                  autoComplete='off'
                />
              </div>
            )}
            {filteredItems.map((item) => (
              <div
                key={item}
                className='flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-neutral-800 p-1 rounded-md'
              >
                <Checkbox
                  id={`${type}-${item}`}
                  checked={selectedItems.includes(item)}
                  onCheckedChange={() => toggleFilter(item, type)}
                  className='rounded border-gray-300'
                />
                <label
                  htmlFor={`${type}-${item}`}
                  className='text-sm text-gray-700 dark:text-gray-300 cursor-pointer w-full'
                >
                  {item}
                </label>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className='text-sm text-gray-500 italic py-2'>
                No hay opciones disponibles
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='w-full md:w-full lg:w-80 '>
      <div className='bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-neutral-800 p-4 sticky top-4'>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center gap-2'>
            <Filter size={16} />
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Filtros</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant='ghost'
              size='sm'
              onClick={resetAllFilters}
              className='text-blue-600 hover:text-blue-800 flex items-center gap-1'
            >
              <RotateCcw size={14} />
              <span className='text-xs'>Resetear</span>
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className='flex flex-wrap gap-1 mb-4'>
            {selectedBrands.map((brand) => (
              <Badge
                key={`badge-${brand}`}
                variant='outline'
                className='flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200'
              >
                {brand}
                <X
                  size={12}
                  className='ml-1 cursor-pointer'
                  onClick={() => toggleFilter(brand, 'brand')}
                />
              </Badge>
            ))}

            {selectedTypes.map((type) => (
              <Badge
                key={`badge-${type}`}
                variant='outline'
                className='flex items-center gap-1 bg-green-50 text-green-700 border-green-200'
              >
                {type}
                <X
                  size={12}
                  className='ml-1 cursor-pointer'
                  onClick={() => toggleFilter(type, 'type')}
                />
              </Badge>
            ))}

            {selectedFuels.map((fuel) => (
              <Badge
                key={`badge-${fuel}`}
                variant='outline'
                className='flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200'
              >
                {fuel}
                <X
                  size={12}
                  className='ml-1 cursor-pointer'
                  onClick={() => toggleFilter(fuel, 'fuel')}
                />
              </Badge>
            ))}

            {selectedConditions.map((condition) => (
              <Badge
                key={`badge-${condition}`}
                variant='outline'
                className='flex items-center gap-1 bg-violet-50 text-violet-700 border-violet-200'
              >
                {condition}
                <X
                  size={12}
                  className='ml-1 cursor-pointer'
                  onClick={() => toggleFilter(condition, 'condition')}
                />
              </Badge>
            ))}

            {selectedColors.map((color) => (
              <Badge
                key={`badge-${color}`}
                variant='outline'
                className='flex items-center gap-1 bg-rose-50 text-rose-700 border-rose-200'
              >
                {color}
                <X
                  size={12}
                  className='ml-1 cursor-pointer'
                  onClick={() => toggleFilter(color, 'color')}
                />
              </Badge>
            ))}

            {(priceRange.min !== minMaxPrice.min ||
              priceRange.max !== minMaxPrice.max) && (
              <Badge
                variant='outline'
                className='flex items-center gap-1 bg-slate-50 text-slate-700 border-slate-200'
              >
                ${priceRange.min.toLocaleString()} - $
                {priceRange.max.toLocaleString()}
                <X
                  size={12}
                  className='ml-1 cursor-pointer'
                  onClick={() =>
                    setPriceRange({
                      min: minMaxPrice.min,
                      max: minMaxPrice.max,
                    })
                  }
                />
              </Badge>
            )}
          </div>
        )}

        {/* Price Range */}
        <div className='mb-4 border-b border-slate-100 dark:border-neutral-800 pb-4'>
          <button
            className='flex w-full items-center justify-between cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-neutral-800 p-2 rounded-md'
            onClick={() => setPriceRangeOpen(!priceRangeOpen)}
            type='button'
          >
            <div className='flex items-center gap-2'>
              <Banknote size={18} className='dark:text-white' />
              <span className='font-medium text-gray-800 dark:text-white'>Rango de Precio</span>
            </div>
            {priceRangeOpen ? (
              <ChevronDown size={18} className='text-gray-600 dark:text-gray-400' />
            ) : (
              <ChevronRight size={18} className='text-gray-600 dark:text-gray-400' />
            )}
          </button>

          {priceRangeOpen && (
            <div className='mt-3 px-4'>
              <div className='flex justify-between items-center gap-2 mb-3'>
                {/* MIN */}
                <div className='flex items-center bg-slate-100 dark:bg-neutral-800 rounded-lg px-3 py-2 w-32'>
                  <span className='text-gray-500 dark:text-gray-400 text-sm mr-1'>$</span>
                  <input
                    type='text'
                    className='bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-white text-center'
                    value={formatPrice(priceRange.min).replace('$', '').trim()}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPriceRange({
                        min: value ? Number(value) : 0,
                        max: priceRange.max,
                      });
                    }}
                    onBlur={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPriceRange({
                        min: value ? Number(value) : 0,
                        max: priceRange.max,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.replace(/\D/g, '');
                        setPriceRange({
                          min: value ? Number(value) : 0,
                          max: priceRange.max,
                        });
                      }
                    }}
                  />
                </div>

                <span className='text-gray-400 dark:text-gray-500 text-lg font-bold'>-</span>

                {/* MAX */}
                <div className='flex items-center bg-slate-100 dark:bg-neutral-800 rounded-lg px-3 py-2 w-32'>
                  <span className='text-gray-500 dark:text-gray-400 text-sm mr-1'>$</span>
                  <input
                    type='text'
                    className='bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-white text-center'
                    value={formatPrice(priceRange.max).replace('$', '').trim()}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPriceRange({
                        min: priceRange.min,
                        max: value ? Number(value) : minMaxPrice.max, // ← nunca ''
                      });
                    }}
                    onBlur={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPriceRange({
                        min: priceRange.min,
                        max: value ? Number(value) : minMaxPrice.max, // ← nunca ''
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.replace(/\D/g, '');
                        setPriceRange({
                          min: priceRange.min,
                          max: value ? Number(value) : minMaxPrice.max, // ← nunca ''
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <Slider
                value={[priceRange.min ?? 0, priceRange.max ?? minMaxPrice.max]}
                min={0}
                max={minMaxPrice.max}
                step={1000000}
                onValueChange={(values) => {
                  setPriceRange({ min: values[0], max: values[1] });
                }}
                className='my-2'
              />
              <div className='flex justify-between mt-1 text-sm text-gray-500 dark:text-gray-400'>
                <span>{formatPrice(priceRange.min)}</span>
                <span>{formatPrice(priceRange.max)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Brand */}
        <FilterSection
          title='Marca'
          icon={<Car size={18} />}
          isOpen={brandOpen}
          toggleOpen={() => setBrandOpen(!brandOpen)}
          selectedItems={selectedBrands}
          availableItems={availableBrands}
          type='brand'
        />

        {/* Year */}
        <FilterSection
          title='Año'
          icon={<Calendar size={18} />}
          isOpen={yearOpen}
          toggleOpen={() => setYearOpen(!yearOpen)}
          selectedItems={selectedYears}
          availableItems={availableYears}
          type='year'
        />

        {/* Type */}
        <FilterSection
          title='Tipo de Vehículo'
          icon={<CarFront size={18} />}
          isOpen={typeOpen}
          toggleOpen={() => setTypeOpen(!typeOpen)}
          selectedItems={selectedTypes}
          availableItems={availableTypes}
          type='type'
        />

        {/* Fuel */}
        <FilterSection
          title='Combustible'
          icon={<Fuel size={18} />}
          isOpen={fuelOpen}
          toggleOpen={() => setFuelOpen(!fuelOpen)}
          selectedItems={selectedFuels}
          availableItems={availableFuels}
          type='fuel'
        />

        {/* Condition */}
        <FilterSection
          title='Condición'
          icon={<Star size={18} />}
          isOpen={conditionOpen}
          toggleOpen={() => setConditionOpen(!conditionOpen)}
          selectedItems={selectedConditions}
          availableItems={availableConditions}
          type='condition'
        />

        {/* Color */}
        <FilterSection
          title='Color'
          icon={<Palette size={18} />}
          isOpen={colorOpen}
          toggleOpen={() => setColorOpen(!colorOpen)}
          selectedItems={selectedColors}
          availableItems={availableColors}
          type='color'
        />
      </div>
    </div>
  );
};
