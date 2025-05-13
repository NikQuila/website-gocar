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
import useThemeStore from '@/store/useThemeStore';

interface VehicleFiltersProps {
  filters: VehicleFiltersType;
  priceRange: number[];
  brands: any[];
  onFilterChange: (key: keyof VehicleFiltersType, value: any) => void;
  onPriceRangeChange: (value: number[]) => void;
  onClearFilters: () => void;
  initialOpenAccordion?: string;
}

const VehicleFilters = ({
  filters,
  priceRange,
  brands,
  onFilterChange,
  onPriceRangeChange,
  onClearFilters,
  initialOpenAccordion,
}: VehicleFiltersProps) => {
  const { colors, categories, fuelTypes, conditions } = useGeneralStore();
  const { theme } = useThemeStore();
  // Estado para controlar qué acordeón está abierto (solo uno a la vez o ninguno)
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    initialOpenAccordion || null
  );

  // Estados locales para manejar los valores de entrada
  const [minPriceInput, setMinPriceInput] = useState<string>(
    priceRange[0] > 0 ? priceRange[0].toString() : ''
  );
  const [maxPriceInput, setMaxPriceInput] = useState<string>(
    priceRange[1] < 1000000000 ? priceRange[1].toString() : ''
  );

  // Constante para el precio máximo
  const MAX_PRICE = 1000000000;

  // Sincronizar los inputs con los valores de priceRange cuando cambian externamente
  useEffect(() => {
    setMinPriceInput(priceRange[0] > 0 ? priceRange[0].toString() : '');
    setMaxPriceInput(priceRange[1] < MAX_PRICE ? priceRange[1].toString() : '');
  }, [priceRange, MAX_PRICE]);

  const activeFiltersCount =
    Object.keys(filters).length +
    (priceRange[0] > 0 || priceRange[1] < MAX_PRICE ? 1 : 0);

  // Función para manejar la apertura/cierre de acordeones
  const handleAccordionSelection = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  // Función para eliminar un filtro individual
  const handleRemoveFilter = (key: keyof VehicleFiltersType) => {
    onFilterChange(key, undefined);
  };

  // Función para resetear el rango de precios
  const handleResetPriceRange = () => {
    onPriceRangeChange([0, MAX_PRICE]);
    setMinPriceInput('');
    setMaxPriceInput('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getFilterName = (key: keyof VehicleFiltersType, id: string) => {
    switch (key) {
      case 'brand':
        return brands.find((b) => b.id.toString() === id)?.name || 'Marca';
      case 'category':
        return categories.find((c) => c.id.toString() === id)?.name || 'Tipo';
      case 'fuel_type':
        return (
          fuelTypes.find((f) => f.id.toString() === id)?.name || 'Combustible'
        );
      case 'condition':
        return (
          conditions.find((c) => c.id.toString() === id)?.name || 'Condición'
        );
      case 'color':
        return colors.find((c) => c.id.toString() === id)?.name || 'Color';
      default:
        return 'Filtro';
    }
  };

  return (
    <div className='bg-white dark:bg-dark-card rounded-lg shadow-sm w-full transition-opacity duration-300 mt-6 sticky top-0 max-h-[calc(100vh-2rem)] overflow-y-auto'>
      <div className='p-4 border-b border-gray-200 dark:border-dark-border'>
        <div className='flex justify-between items-center'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
              Filtros
              {activeFiltersCount > 0 && (
                <Chip size='sm' color='primary' variant='flat'>
                  {activeFiltersCount}
                </Chip>
              )}
            </h3>
          </div>
          <Button
            size='sm'
            variant='light'
            color='danger'
            onClick={() => {
              if (typeof onClearFilters === 'function') {
                onClearFilters();
                // Resetear también los estados locales de los inputs
                setMinPriceInput('');
                setMaxPriceInput('');
              }
            }}
            className='text-[13px] py-0 px-3 font-normal bg-transparent min-w-0 flex items-center mr-4 sm:mr-0'
          >
            <Icon
              icon='solar:filter-linear'
              className='text-xs mr-1 rotate-180'
            />
            <span className='ml-1 sm:ml-2'>Limpiar</span>
          </Button>
        </div>
      </div>

      <Accordion
        selectionMode='single'
        selectedKeys={openAccordion ? [openAccordion] : []}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0]?.toString() || null;
          setOpenAccordion(selectedKey);
        }}
        className='px-4'
      >
        <AccordionItem
          key='price'
          aria-label='Rango de Precio'
          startContent={
            <Icon icon='mdi:cash' className='text-xl text-primary mr-1' />
          }
          title={
            <div className='flex flex-col items-start'>
              <div>Rango de Precio</div>
              {(priceRange[0] > 0 || priceRange[1] < MAX_PRICE) && (
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
                  {`${formatPrice(priceRange[0])} - ${
                    priceRange[1] < MAX_PRICE
                      ? formatPrice(priceRange[1])
                      : '$1.000.000.000'
                  }`}
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
            indicator: 'ml-0 mr-4',
          }}
        >
          <div className='space-y-3 sm:space-y-4'>
            <div className='flex justify-between items-center gap-2'>
              <Input
                type='text'
                size='sm'
                placeholder='Mínimo'
                value={minPriceInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setMinPriceInput(value);
                  const numValue = value ? Number(value) : 0;
                  onPriceRangeChange([numValue, priceRange[1]]);
                }}
                startContent={
                  <span className='text-gray-500 dark:text-gray-400 text-xs'>
                    $
                  </span>
                }
                className='w-full text-xs'
                classNames={{
                  input: 'text-xs',
                  inputWrapper: 'h-7 sm:h-8',
                }}
              />
              <span className='text-gray-400 text-xs'>-</span>
              <Input
                type='text'
                size='sm'
                placeholder='Máximo'
                value={maxPriceInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setMaxPriceInput(value);
                  const numValue = value ? Number(value) : MAX_PRICE;
                  onPriceRangeChange([priceRange[0], numValue]);
                }}
                startContent={
                  <span className='text-gray-500 dark:text-gray-400 text-xs'>
                    $
                  </span>
                }
                className='w-full text-xs'
                classNames={{
                  input: 'text-xs',
                  inputWrapper: 'h-7 sm:h-8',
                }}
              />
            </div>
            <div className='px-1'>
              <Slider
                value={priceRange}
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    onPriceRangeChange(value);
                    setMinPriceInput(value[0] > 0 ? value[0].toString() : '');
                    setMaxPriceInput(
                      value[1] < MAX_PRICE ? value[1].toString() : ''
                    );
                  }
                }}
                minValue={0}
                maxValue={MAX_PRICE}
                step={1000000}
                className='max-w-full'
                size='sm'
                classNames={{
                  base: 'dark:bg-dark-card',
                  track: 'bg-gray-200 dark:bg-dark-border h-[3px]',
                  filler: 'bg-primary dark:bg-primary',
                  thumb:
                    'bg-white dark:bg-white border-2 border-primary dark:border-primary h-3 w-3 sm:h-4 sm:w-4 shadow-sm',
                  label: 'dark:text-white',
                }}
                aria-label='Rango de precio'
              />
              <div className='flex justify-between mt-1 text-[10px] text-gray-500'>
                <span>{formatPrice(priceRange[0])}</span>
                <span>
                  {priceRange[1] < MAX_PRICE
                    ? formatPrice(priceRange[1])
                    : '$1.000.000.000'}
                </span>
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
          title={
            <div className='flex items-center gap-2'>
              Marca
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
            indicator: 'mr-4',
          }}
        >
          <Select
            placeholder='Selecciona una marca'
            selectedKeys={filters.brand ? [filters.brand] : []}
            onChange={(e) => onFilterChange('brand', e.target.value)}
            size='sm'
            classNames={{
              base: 'dark:bg-dark-card',
              trigger:
                'dark:bg-dark-card dark:text-white dark:border-dark-border h-9 sm:h-10 text-xs sm:text-sm',
              listbox: 'dark:bg-dark-card dark:text-white text-xs sm:text-sm',
              popoverContent: 'dark:bg-dark-card dark:border-dark-border',
              value: 'dark:text-white text-xs sm:text-sm',
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
          title={
            <div className='flex items-center gap-2'>
              Tipo de Vehículo
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
            indicator: 'mr-4',
          }}
        >
          <Select
            placeholder='Selecciona un tipo'
            selectedKeys={filters.category ? [filters.category] : []}
            onChange={(e) => onFilterChange('category', e.target.value)}
            size='sm'
            classNames={{
              base: 'dark:bg-dark-card',
              trigger:
                'dark:bg-dark-card dark:text-white dark:border-dark-border h-9 sm:h-10 text-xs sm:text-sm',
              listbox: 'dark:bg-dark-card dark:text-white text-xs sm:text-sm',
              popoverContent: 'dark:bg-dark-card dark:border-dark-border',
              value: 'dark:text-white text-xs sm:text-sm',
              label: 'dark:text-gray-400',
            }}
          >
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </Select>
        </AccordionItem>

        <AccordionItem
          key='fuel'
          aria-label='Combustible'
          startContent={
            <Icon icon='mdi:gas-station' className='text-xl text-primary' />
          }
          title={
            <div className='flex items-center gap-2'>
              Combustible
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
            indicator: 'mr-4',
          }}
        >
          <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2'>
            {fuelTypes.map((type) => (
              <Chip
                key={type.id}
                onClick={() => onFilterChange('fuel_type', type.id.toString())}
                className='capitalize cursor-pointer hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center text-xs'
                color={
                  filters.fuel_type === type.id.toString()
                    ? 'primary'
                    : 'default'
                }
                variant={
                  filters.fuel_type === type.id.toString() ? 'solid' : 'flat'
                }
                size='sm'
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
          title={
            <div className='flex items-center gap-2'>
              Condición
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
            indicator: 'mr-4',
          }}
        >
          <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2'>
            {conditions.map((condition) => (
              <Chip
                key={condition.id}
                onClick={() =>
                  onFilterChange('condition', condition.id.toString())
                }
                className='capitalize cursor-pointer hover:-translate-y-0.5 transition-transform w-full sm:w-auto justify-center text-xs'
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
                size='sm'
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
          title={
            <div className='flex items-center gap-2'>
              Color
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
            indicator: 'mr-4',
          }}
        >
          <div className='grid grid-cols-2 gap-1.5 sm:gap-2 pb-2 mb-4 max-h-[300px] overflow-y-auto'>
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => onFilterChange('color', color.id.toString())}
                className={`capitalize w-full flex items-center gap-2 px-2 py-1 rounded-lg border transition-all text-xs
                  ${
                    filters.color === color.id.toString()
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-border/50'
                  }
                `}
              >
                <div
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border
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
                    className='ml-auto text-primary text-base sm:text-lg'
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

export default VehicleFilters;
