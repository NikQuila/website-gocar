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
import {
  mapConditionTypeToSpanish,
  mapFuelTypeToSpanish,
  mapTransmissionTypeToSpanish,
} from '@/utils/functions';

interface NewVehicleFiltersProps {
  filters: VehicleFiltersType;
  priceRange: number[];
  brands: any[];
  categories: string[];
  fuelTypes: string[];
  transmissions: string[];
  conditions: string[];
  onFilterChange: (key: keyof VehicleFiltersType, value: any) => void;
  onPriceRangeChange: (value: number[]) => void;
  onClearFilters: () => void;
}

const NewVehicleFilters = ({
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
}: NewVehicleFiltersProps) => {
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
                key={category}
                onClick={() => onFilterChange('category', category)}
                className='cursor-pointer hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center'
                color={filters.category === category ? 'primary' : 'default'}
                variant={filters.category === category ? 'solid' : 'flat'}
              >
                {category}
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
                key={type}
                onClick={() => onFilterChange('fuel_type', type)}
                className='cursor-pointer hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center'
                color={filters.fuel_type === type ? 'primary' : 'default'}
                variant={filters.fuel_type === type ? 'solid' : 'flat'}
              >
                {mapFuelTypeToSpanish(type as any)}
              </Chip>
            ))}
          </div>
        </AccordionItem>

        <AccordionItem
          key='transmission'
          aria-label='Transmisión'
          startContent={
            <Icon
              icon='mdi:car-shift-pattern'
              className='text-xl text-primary'
            />
          }
          title='Transmisión'
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0',
            heading:
              'px-2 sm:px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0',
            content: 'px-2 sm:px-4 py-3',
          }}
        >
          <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-2'>
            {transmissions.map((type) => (
              <Chip
                key={type}
                onClick={() => onFilterChange('transmission', type)}
                className='cursor-pointer hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center'
                color={filters.transmission === type ? 'primary' : 'default'}
                variant={filters.transmission === type ? 'solid' : 'flat'}
              >
                {mapTransmissionTypeToSpanish(type as any)}
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
                key={condition}
                onClick={() => onFilterChange('condition', condition)}
                className='cursor-pointer hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center'
                color={filters.condition === condition ? 'primary' : 'default'}
                variant={filters.condition === condition ? 'solid' : 'flat'}
              >
                {mapConditionTypeToSpanish(condition as any)}
              </Chip>
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default NewVehicleFilters;
