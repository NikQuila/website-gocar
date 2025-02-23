import { CONDITION_TYPES, TRANSMISSION_TYPES } from '@/utils/definitions';
import {
  mapConditionTypeToSpanish,
  mapFuelTypeToSpanish,
  mapTransmissionTypeToSpanish,
} from '@/utils/functions';
import { Brand, VehicleFilters as VehicleFiltersType } from '@/utils/types';
import { Button, Select, SelectItem, Slider } from '@heroui/react';

interface VehicleFiltersProps {
  filters: VehicleFiltersType;
  priceRange: number[];
  brands: Brand[];
  categories: string[];
  fuelTypes: string[];
  transmissions: string[];
  conditions: string[];
  onFilterChange: (key: keyof VehicleFiltersType, value: any) => void;
  onPriceRangeChange: (value: number[]) => void;
  onClearFilters: () => void;
}

const VehicleFilters = ({
  filters,
  priceRange,
  brands,
  categories,
  fuelTypes,
  transmissions,
  conditions,
  onFilterChange,
  onPriceRangeChange,
  onClearFilters,
}: VehicleFiltersProps) => {
  console.log(
    'Brands:',
    brands.map((brand) => ({ id: brand.id, name: brand.name }))
  );

  return (
    <div className=' bg-white dark:bg-dark-card p-4 overflow-y-auto'>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Filtros
          </h3>
          {/*   <Button
            size='sm'
            variant='light'
            color='danger'
            onClick={onClearFilters}
          >
            Clear
          </Button> */}
        </div>

        {/* Marca */}
        <div>
          <label className='text-sm text-gray-600 dark:text-gray-400 mb-2 block'>
            Marca
          </label>
          <Select
            placeholder='Selecciona una marca'
            selectedKeys={filters.brand ? [filters.brand] : []}
            onChange={(e) => onFilterChange('brand', e.target.value)}
            classNames={{
              base: 'dark:bg-dark-card',
              trigger:
                'dark:bg-dark-card dark:text-white dark:border-dark-border',
              listbox: 'dark:bg-dark-card dark:text-white',
            }}
          >
            {[
              ...new Map(brands.map((brand) => [brand.id, brand])).values(),
            ].map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Categoría */}
        <div>
          <label className='text-sm text-gray-600 dark:text-gray-400 mb-2 block'>
            Categoría
          </label>
          <Select
            placeholder='Selecciona una categoría'
            selectedKeys={filters.category ? [filters.category] : []}
            onChange={(e) => onFilterChange('category', e.target.value)}
            classNames={{
              base: 'dark:bg-dark-card',
              trigger:
                'dark:bg-dark-card dark:text-white dark:border-dark-border',
              listbox: 'dark:bg-dark-card dark:text-white',
            }}
          >
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Rango de precio */}
        <div>
          <label className='text-sm text-gray-600 dark:text-gray-400 mb-2 block'>
            Rango de precio
          </label>
          <div className='px-2'>
            <Slider
              className='max-w-md'
              value={priceRange}
              onChange={(value) => onPriceRangeChange(value as number[])}
              minValue={0}
              maxValue={100000000}
              step={1000000}
              formatOptions={{ style: 'currency', currency: 'CLP' }}
              classNames={{
                base: 'dark:bg-dark-card',
                track: 'dark:bg-dark-border',
                filler: 'dark:bg-white',
                thumb: 'dark:bg-white',
              }}
            />
          </div>
          <div className='flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400'>
            <span>
              {priceRange[0].toLocaleString('es-CL', {
                style: 'currency',
                currency: 'CLP',
              })}
            </span>
            <span>
              {priceRange[1].toLocaleString('es-CL', {
                style: 'currency',
                currency: 'CLP',
              })}
            </span>
          </div>
        </div>

        {/* Combustible */}
        <div>
          <label className='text-sm text-gray-600 dark:text-gray-400 mb-2 block'>
            Combustible
          </label>
          <Select
            placeholder='Tipo de combustible'
            selectedKeys={filters.fuel_type ? [filters.fuel_type] : []}
            onChange={(e) => onFilterChange('fuel_type', e.target.value)}
            classNames={{
              base: 'dark:bg-dark-card',
              trigger:
                'dark:bg-dark-card dark:text-white dark:border-dark-border',
              listbox: 'dark:bg-dark-card dark:text-white',
            }}
          >
            {fuelTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {mapFuelTypeToSpanish(
                  type as 'Gasoline' | 'Diesel' | 'Hybrid' | 'Electric' | 'Gas'
                )}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Transmisión */}
        <div>
          <label className='text-sm text-gray-600 dark:text-gray-400 mb-2 block'>
            Transmisión
          </label>
          <Select
            placeholder='Tipo de transmisión'
            selectedKeys={filters.transmission ? [filters.transmission] : []}
            onChange={(e) => onFilterChange('transmission', e.target.value)}
            classNames={{
              base: 'dark:bg-dark-card',
              trigger:
                'dark:bg-dark-card dark:text-white dark:border-dark-border',
              listbox: 'dark:bg-dark-card dark:text-white',
            }}
          >
            {TRANSMISSION_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {mapTransmissionTypeToSpanish(type as 'Automatic' | 'Manual')}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Condición */}
        <div>
          <label className='text-sm text-gray-600 dark:text-gray-400 mb-2 block'>
            Condición
          </label>
          <Select
            placeholder='Condición del vehículo'
            selectedKeys={filters.condition ? [filters.condition] : []}
            onChange={(e) => onFilterChange('condition', e.target.value)}
            classNames={{
              base: 'dark:bg-dark-card',
              trigger:
                'dark:bg-dark-card dark:text-white dark:border-dark-border',
              listbox: 'dark:bg-dark-card dark:text-white',
            }}
          >
            {CONDITION_TYPES.map((condition) => (
              <SelectItem key={condition} value={condition}>
                {mapConditionTypeToSpanish(
                  condition as 'New' | 'Used' | 'Certified Pre-Owned'
                )}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};

export default VehicleFilters;
