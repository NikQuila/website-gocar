'use client';
import { useState } from 'react';
import {
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Slider,
  Accordion,
  AccordionItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { VehicleFilters as VehicleFiltersType } from '@/utils/types';
import { useGeneralStore } from '@/store/useGeneralStore';

interface NewVehicleFiltersProps {
  filters: VehicleFiltersType;
  priceRange: number[];
  brands: any[];
  onFilterChange: (key: keyof VehicleFiltersType, value: any) => void;
  onPriceRangeChange: (value: number[]) => void;
  onClearFilters: () => void;
}

const NewVehicleFilters = ({
  filters,
  priceRange,
  brands,
  onFilterChange,
  onPriceRangeChange,
  onClearFilters,
}: NewVehicleFiltersProps) => {
  const { colors, categories, fuelTypes, conditions } = useGeneralStore();

  const activeFiltersCount =
    Object.keys(filters).length +
    (priceRange[0] > 0 || priceRange[1] < 1000000000 ? 1 : 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className='bg-white dark:bg-dark-card rounded-lg shadow-sm'>
      <div className='p-4 border-b border-gray-200 dark:border-dark-border'>
        <div className='flex flex-col sm:flex-row justify-between gap-2'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
            Filtros
            {activeFiltersCount > 0 && (
              <Chip size='sm' color='primary' variant='flat'>
                {activeFiltersCount}
              </Chip>
            )}
          </h3>
          <div className='flex items-center'>
            {activeFiltersCount > 0 && (
              <Button
                size='sm'
                variant='light'
                color='danger'
                onClick={onClearFilters}
                startContent={
                  <Icon icon='mdi:filter-off' className='text-lg' />
                }
                className='font-medium w-full sm:w-auto'
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>

      <Accordion>
        <AccordionItem
          key='price'
          aria-label='Rango de Precio'
          startContent={
            <Icon icon='mdi:cash' className='text-xl text-primary' />
          }
          title='Rango de Precio'
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0',
            heading:
              'px-2 sm:px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0',
            content: 'px-2 sm:px-4 py-3',
          }}
        >
          <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
              <Input
                type='text'
                placeholder='Mínimo'
                value={priceRange[0].toString()}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  onPriceRangeChange([Number(value), priceRange[1]]);
                }}
                startContent={
                  <span className='text-gray-500 dark:text-gray-400'>$</span>
                }
                className='w-full'
              />
              <span className='hidden sm:block text-gray-400'>-</span>
              <Input
                type='text'
                placeholder='Máximo'
                value={priceRange[1].toString()}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  onPriceRangeChange([priceRange[0], Number(value)]);
                }}
                startContent={
                  <span className='text-gray-500 dark:text-gray-400'>$</span>
                }
                className='w-full'
              />
            </div>
            <div className='px-2'>
              <Slider
                value={priceRange}
                onChange={(value) => onPriceRangeChange(value as number[])}
                minValue={0}
                maxValue={1000000000}
                step={1000000}
                className='max-w-full'
                classNames={{
                  base: 'dark:bg-dark-card',
                  track: 'dark:bg-dark-border',
                  filler: 'dark:bg-primary',
                  thumb: 'dark:bg-primary dark:border-dark-border',
                  label: 'dark:text-white',
                }}
                aria-label='Rango de precio'
              />
              <div className='flex justify-between mt-2 text-xs text-gray-500'>
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem
          key='brand'
          aria-label='Marca'
          startContent={
            <Icon icon='mdi:car-estate' className='text-xl text-primary' />
          }
          title='Marca'
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0',
            heading:
              'px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0',
            content: 'px-4 py-3',
          }}
        >
          <Select
            placeholder='Selecciona una marca'
            selectedKeys={filters.brand ? [filters.brand] : []}
            onChange={(e) => onFilterChange('brand', e.target.value)}
            classNames={{
              base: 'dark:bg-dark-card',
              trigger:
                'dark:bg-dark-card dark:text-white dark:border-dark-border',
              listbox: 'dark:bg-dark-card dark:text-white',
              popoverContent: 'dark:bg-dark-card dark:border-dark-border',
              value: 'dark:text-white',
              label: 'dark:text-gray-400',
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
        </AccordionItem>

        <AccordionItem
          key='category'
          aria-label='Tipo de Vehículo'
          startContent={
            <Icon icon='mdi:car-side' className='text-xl text-primary' />
          }
          title='Tipo de Vehículo'
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0',
            heading:
              'px-2 sm:px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0',
            content: 'px-2 sm:px-4 py-3',
          }}
        >
          <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-2'>
            {categories.map((category) => (
              <Chip
                key={category.id}
                onClick={() =>
                  onFilterChange('category', category.id.toString())
                }
                className='cursor-pointer hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center'
                color={
                  filters.category === category.id.toString()
                    ? 'primary'
                    : 'default'
                }
                variant={
                  filters.category === category.id.toString() ? 'solid' : 'flat'
                }
              >
                {category.name}
              </Chip>
            ))}
          </div>
        </AccordionItem>

        <AccordionItem
          key='fuel'
          aria-label='Combustible'
          startContent={
            <Icon icon='mdi:gas-station' className='text-xl text-primary' />
          }
          title='Combustible'
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0',
            heading:
              'px-2 sm:px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0',
            content: 'px-2 sm:px-4 py-3',
          }}
        >
          <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-2'>
            {fuelTypes.map((type) => (
              <Chip
                key={type.id}
                onClick={() => onFilterChange('fuel_type', type.id.toString())}
                className='cursor-pointer hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center'
                color={
                  filters.fuel_type === type.id.toString()
                    ? 'primary'
                    : 'default'
                }
                variant={
                  filters.fuel_type === type.id.toString() ? 'solid' : 'flat'
                }
              >
                {type.name}
              </Chip>
            ))}
          </div>
        </AccordionItem>

        <AccordionItem
          key='condition'
          aria-label='Condición'
          startContent={
            <Icon icon='mdi:car-info' className='text-xl text-primary' />
          }
          title='Condición'
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0',
            heading:
              'px-2 sm:px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0',
            content: 'px-2 sm:px-4 py-3',
          }}
        >
          <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-2'>
            {conditions.map((condition) => (
              <Chip
                key={condition.id}
                onClick={() =>
                  onFilterChange('condition', condition.id.toString())
                }
                className='cursor-pointer hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center'
                color={
                  filters.condition === condition.id.toString()
                    ? 'primary'
                    : 'default'
                }
                variant={
                  filters.condition === condition.id.toString()
                    ? 'solid'
                    : 'flat'
                }
              >
                {condition.name}
              </Chip>
            ))}
          </div>
        </AccordionItem>

        <AccordionItem
          key='color'
          aria-label='Color'
          startContent={
            <Icon icon='mdi:palette' className='text-xl text-primary' />
          }
          title='Color'
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0',
            heading:
              'px-2 sm:px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0',
            content: 'px-2 sm:px-4 py-3',
          }}
        >
          <div className='grid  grid-cols-1 md:grid-cols-2 gap-2'>
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => onFilterChange('color', color.id.toString())}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all
                  ${
                    filters.color === color.id.toString()
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-border/50'
                  }
                `}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2
                    ${
                      filters.color === color.id.toString()
                        ? 'border-primary'
                        : 'border-gray-200 dark:border-dark-border'
                    }
                  `}
                  style={{
                    backgroundColor: color.hex,
                  }}
                />
                <span
                  className={`text-sm
                  ${
                    filters.color === color.id.toString()
                      ? 'text-primary font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                  }
                `}
                >
                  {color.name}
                </span>
                {filters.color === color.id.toString() && (
                  <Icon
                    icon='mdi:check'
                    className='ml-auto text-primary text-lg'
                  />
                )}
              </button>
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

// Helper function to determine text color based on background
const getContrastColor = (hexcolor: string) => {
  // Remove the hash if it exists
  const hex = hexcolor.replace('#', '');
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export default NewVehicleFilters;
