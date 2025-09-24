'use client';
import { useState, useEffect } from 'react';
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
import useVehicleFiltersStore from '@/store/useVehicleFiltersStore';
import { useTranslation } from '@/i18n/hooks/useTranslation';

interface NewVehicleFiltersProps {
  filters: VehicleFiltersType;
  priceRange: number[];
  brands: any[];
  onFilterChange: (key: keyof VehicleFiltersType, value: any) => void;
  onPriceRangeChange: (value: number[]) => void;
  onClearFilters: () => void;
  initialOpenAccordion?: string;
  availableYears?: string[];
  sortBy?: string;
  searchQuery?: string;
  maxPrice?: number;
}

const NewVehicleFilters = ({
  brands,
  initialOpenAccordion,
  availableYears,
  maxPrice = 1000000000,
}: any) => {
  const { colors, categories, fuelTypes, conditions } = useGeneralStore();
  const {
    filters,
    priceRange,
    setFilters,
    setPriceRange,
    clearFilters,
    sortOrder,
    searchQuery,
  } = useVehicleFiltersStore();
  // Estado para controlar qué acordeón está abierto (solo uno a la vez o ninguno)
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    initialOpenAccordion || null
  );

  // Estados para manejar campos vacíos
  const [minPriceEmpty, setMinPriceEmpty] = useState(false);
  const [maxPriceEmpty, setMaxPriceEmpty] = useState(false);
  const { t } = useTranslation();

  const activeFiltersCount =
    Object.keys(filters).length +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) +
    (sortOrder !== 'date_desc' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  // Función para manejar la apertura/cierre de acordeones
  const handleAccordionSelection = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  // Función para eliminar un filtro individual
  const handleRemoveFilter = (key: keyof VehicleFiltersType) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
  };

  // Función para resetear el rango de precios
  const handleResetPriceRange = () => {
    setPriceRange([0, maxPrice]);
  };

  const formatPrice = (price: number) => {
    // Verificar si el precio es un número válido
    if (
      isNaN(price) ||
      !isFinite(price) ||
      price === undefined ||
      price === null
    ) {
      return '$0';
    }
    try {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
      }).format(price);
    } catch (error) {
      return '$0';
    }
  };

  const getFilterName = (key: keyof VehicleFiltersType, id: string) => {
    switch (key) {
      case 'brand':
        return (
          brands.find((b) => b.id.toString() === id)?.name ||
          t('vehicles.filters.brand')
        );
      case 'category':
        return (
          categories.find((c) => c.id.toString() === id)?.name ||
          t('vehicles.filters.category')
        );
      case 'fuel_type':
        return (
          fuelTypes.find((f) => f.id.toString() === id)?.name ||
          t('vehicles.filters.fuelType')
        );
      case 'condition':
        return (
          conditions.find((c) => c.id.toString() === id)?.name ||
          t('vehicles.filters.condition')
        );
      case 'color':
        return (
          colors.find((c) => c.id.toString() === id)?.name ||
          t('vehicles.filters.color')
        );
      default:
        return t('common.actions.filter');
    }
  };

  return (
    <div className='bg-white dark:bg-dark-card rounded-lg shadow-sm w-full transition-opacity duration-300'>
      <div className='p-4 border-b border-gray-200 dark:border-dark-border'>
        <div className='flex justify-between items-center'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mt-4 sm:mt-0'>
              {t('vehicles.filters.title')}
              {activeFiltersCount > 0 && (
                <Chip size='sm' color='primary' variant='flat'>
                  {activeFiltersCount}
                </Chip>
              )}
            </h3>
          </div>
          {activeFiltersCount > 0 && (
            <Button
              size='sm'
              variant='light'
              color='danger'
              onClick={() => clearFilters(maxPrice)}
              className='text-[13px] py-0 px-0 font-normal bg-transparent min-w-0 flex items-center mx-auto mt-4 sm:mt-0 sm:mx-0'
            >
              <Icon
                icon='solar:filter-linear'
                className='text-xs mr-1 rotate-180'
              />
              {t('vehicles.filters.clearFilters')}
            </Button>
          )}
        </div>
      </div>

      <Accordion
        selectionMode='single'
        selectedKeys={openAccordion ? [openAccordion] : []}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0]?.toString() || null;
          setOpenAccordion(selectedKey);
        }}
      >
        <AccordionItem
          key='price'
          aria-label={t('vehicles.filters.priceRange')}
          startContent={
            <Icon icon='mdi:cash' className='text-xl text-primary mr-1' />
          }
          title={
            <div className='flex flex-col items-start'>
              <div>{t('vehicles.filters.priceRange')}</div>
              {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <Chip
                  size='sm'
                  color='primary'
                  variant='flat'
                  className='text-xs py-0 h-5 mt-1 ml-0 pl-0'
                  classNames={{
                    content: 'pl-1 text-[10px]',
                    base: 'ml-8 pl-0',
                  }}
                  onClose={() => handleResetPriceRange()}
                >
                  {`${formatPrice(priceRange[0])} - ${formatPrice(
                    priceRange[1]
                  )}`}
                </Chip>
              )}
            </div>
          }
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0 w-full',
            heading:
              'px-1 py-2 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0 flex items-center w-full',
            content: 'px-2 py-2',
            title: 'flex-1',
            indicator: 'ml-0',
          }}
        >
          <div className='space-y-4'>
            <div className='flex justify-between items-center gap-2'>
              <Input
                type='text'
                size='sm'
                placeholder={t('vehicles.filters.minPrice')}
                value={
                  minPriceEmpty
                    ? ''
                    : formatPrice(priceRange[0]).replace('$', '').trim()
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value === '') {
                    setMinPriceEmpty(true);
                    return;
                  }
                  setMinPriceEmpty(false);
                  const numValue = Number(value);
                  if (!isNaN(numValue) && isFinite(numValue)) {
                    setPriceRange([numValue, priceRange[1]]);
                  }
                }}
                onFocus={() => {
                  // No vaciar automáticamente, solo permitir edición del valor actual
                  setMinPriceEmpty(false);
                }}
                onBlur={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const numValue = value ? Number(value) : 0;
                  setMinPriceEmpty(false);
                  if (!isNaN(numValue) && isFinite(numValue)) {
                    setPriceRange([numValue, priceRange[1]]);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.replace(
                      /\D/g,
                      ''
                    );
                    const numValue = value ? Number(value) : 0;
                    setMinPriceEmpty(false);
                    if (!isNaN(numValue) && isFinite(numValue)) {
                      setPriceRange([numValue, priceRange[1]]);
                    }
                  }
                }}
                startContent={
                  <span className='text-gray-500 dark:text-gray-400 text-xs'>
                    $
                  </span>
                }
                className='w-full text-xs'
                classNames={{
                  input: 'text-xs',
                  inputWrapper: 'h-8',
                }}
              />
              <span className='text-gray-400 text-xs'>-</span>
              <Input
                type='text'
                size='sm'
                placeholder={t('vehicles.filters.maxPrice')}
                value={
                  maxPriceEmpty
                    ? ''
                    : formatPrice(priceRange[1]).replace('$', '').trim()
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value === '') {
                    setMaxPriceEmpty(true);
                    return;
                  }
                  setMaxPriceEmpty(false);
                  const numValue = Number(value);
                  if (!isNaN(numValue) && isFinite(numValue)) {
                    setPriceRange([priceRange[0], numValue]);
                  }
                }}
                onFocus={() => {
                  // No vaciar automáticamente, solo permitir edición del valor actual
                  setMaxPriceEmpty(false);
                }}
                onBlur={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const numValue = value ? Number(value) : maxPrice;
                  setMaxPriceEmpty(false);
                  if (!isNaN(numValue) && isFinite(numValue)) {
                    setPriceRange([priceRange[0], numValue]);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.replace(
                      /\D/g,
                      ''
                    );
                    const numValue = value ? Number(value) : maxPrice;
                    setMaxPriceEmpty(false);
                    if (!isNaN(numValue) && isFinite(numValue)) {
                      setPriceRange([priceRange[0], numValue]);
                    }
                  }
                }}
                startContent={
                  <span className='text-gray-500 dark:text-gray-400 text-xs'>
                    $
                  </span>
                }
                className='w-full text-xs'
                classNames={{
                  input: 'text-xs',
                  inputWrapper: 'h-8',
                }}
              />
            </div>
            <div className='px-1'>
              <Slider
                value={priceRange}
                onChange={(value) => setPriceRange(value as number[])}
                minValue={0}
                maxValue={maxPrice}
                step={1000000}
                className='max-w-full'
                size='sm'
                classNames={{
                  base: 'dark:bg-dark-card',
                  track: 'dark:bg-dark-border',
                  filler: 'dark:bg-primary',
                  thumb: 'dark:bg-primary dark:border-dark-border h-3 w-3',
                  label: 'dark:text-white',
                }}
                aria-label='Rango de precio'
              />
              <div className='flex justify-between mt-1 text-[10px] text-gray-500'>
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem
          key='brand'
          aria-label={t('vehicles.filters.brand')}
          startContent={
            <Icon icon='mdi:car-estate' className='text-xl text-primary' />
          }
          title={
            <div className='flex items-center gap-2'>
              {t('vehicles.filters.brand')}
              {filters.brand && (
                <Chip
                  size='sm'
                  color='primary'
                  variant='flat'
                  className='text-xs py-0 h-5'
                  onClose={() => handleRemoveFilter('brand')}
                >
                  {getFilterName('brand', filters.brand)}
                </Chip>
              )}
            </div>
          }
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0',
            heading:
              'px-2 py-2 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0',
            content: 'px-2 py-2',
          }}
        >
          <Select
            placeholder={t('vehicles.filters.selectBrand')}
            selectedKeys={filters.brand ? [filters.brand] : []}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
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
          aria-label={t('vehicles.filters.category')}
          startContent={
            <Icon icon='mdi:car-side' className='text-xl text-primary' />
          }
          title={
            <div className='flex items-center gap-2'>
              {t('vehicles.filters.category')}
              {filters.category && (
                <Chip
                  size='sm'
                  color='primary'
                  variant='flat'
                  className='text-xs py-0 h-5'
                  onClose={() => handleRemoveFilter('category')}
                >
                  {getFilterName('category', filters.category)}
                </Chip>
              )}
            </div>
          }
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0',
            heading:
              'px-2 py-2 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0',
            content: 'px-2 py-2',
          }}
        >
          <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-2'>
            {categories.map((category) => (
              <Chip
                key={category.id}
                onClick={() =>
                  setFilters({ ...filters, category: category.id.toString() })
                }
                className=' capitalize cursor-pointer hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center'
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
          aria-label={t('vehicles.filters.fuelType')}
          startContent={
            <Icon icon='mdi:gas-station' className='text-xl text-primary' />
          }
          title={
            <div className='flex items-center gap-2'>
              {t('vehicles.filters.fuelType')}
              {filters.fuel_type && (
                <Chip
                  size='sm'
                  color='primary'
                  variant='flat'
                  className='text-xs py-0 h-5'
                  onClose={() => handleRemoveFilter('fuel_type')}
                >
                  {getFilterName('fuel_type', filters.fuel_type)}
                </Chip>
              )}
            </div>
          }
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0',
            heading:
              'px-2 py-2 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0',
            content: 'px-2 py-2',
          }}
        >
          <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-2'>
            {fuelTypes.map((type) => (
              <Chip
                key={type.id}
                onClick={() =>
                  setFilters({ ...filters, fuel_type: type.id.toString() })
                }
                className=' capitalize cursor-pointer hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center'
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

        {/* Year Filter */}
        <AccordionItem
          key='year'
          aria-label={t('vehicles.filters.year')}
          startContent={
            <Icon icon='mdi:calendar' className='text-xl text-primary' />
          }
          title={
            <div className='flex items-center gap-2'>
              {t('vehicles.filters.year')}
              {filters.year && (
                <Chip
                  size='sm'
                  color='primary'
                  variant='flat'
                  className='text-xs py-0 h-5'
                  onClose={() => handleRemoveFilter('year')}
                >
                  {filters.year}
                </Chip>
              )}
            </div>
          }
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0',
            heading:
              'px-2 py-2 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0',
            content: 'px-2 py-2',
          }}
        >
          <Select
            placeholder={t('vehicles.filters.year')}
            selectedKeys={filters.year ? [filters.year] : []}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
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
            {availableYears &&
              availableYears.length > 0 &&
              availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
          </Select>
        </AccordionItem>

        <AccordionItem
          key='condition'
          aria-label={t('vehicles.filters.condition')}
          startContent={
            <Icon icon='mdi:car-info' className='text-xl text-primary' />
          }
          title={
            <div className='flex items-center gap-2'>
              {t('vehicles.filters.condition')}
              {filters.condition && (
                <Chip
                  size='sm'
                  color='primary'
                  variant='flat'
                  className='text-xs py-0 h-5'
                  onClose={() => handleRemoveFilter('condition')}
                >
                  {getFilterName('condition', filters.condition)}
                </Chip>
              )}
            </div>
          }
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0',
            heading:
              'px-2 py-2 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0',
            content: 'px-2 py-2',
          }}
        >
          <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-2'>
            {conditions.map((condition) => (
              <Chip
                key={condition.id}
                onClick={() =>
                  setFilters({ ...filters, condition: condition.id.toString() })
                }
                className=' capitalize cursor-pointer hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center'
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
          aria-label={t('vehicles.filters.color')}
          startContent={
            <Icon icon='mdi:palette' className='text-xl text-primary' />
          }
          title={
            <div className='flex items-center gap-2'>
              {t('vehicles.filters.color')}
              {filters.color && (
                <Chip
                  size='sm'
                  color='primary'
                  variant='flat'
                  className='text-xs py-0 h-5'
                  onClose={() => handleRemoveFilter('color')}
                >
                  {getFilterName('color', filters.color)}
                </Chip>
              )}
            </div>
          }
          classNames={{
            base: 'group-[.is-splitted]:ps-0 py-0',
            heading:
              'px-2 py-2 hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors',
            trigger: 'px-0',
            content: 'px-2 py-2',
          }}
        >
          <div className='grid grid-cols-2 gap-2 pb-2 mb-4'>
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() =>
                  setFilters({ ...filters, color: color.id.toString() })
                }
                className={`capitalize w-full flex items-center gap-2 px-2 py-1 rounded-lg border transition-all
                  ${
                    filters.color === color.id.toString()
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-border/50'
                  }
                `}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border
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
                  className={`text-xs
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

export default NewVehicleFilters;
