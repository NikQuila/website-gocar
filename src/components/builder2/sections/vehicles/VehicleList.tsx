import React from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowUpDown,
  ExternalLink,
  Tag,
  MapPin,
  Calendar,
  Gauge,
  Car,
} from 'lucide-react';
import { ExtendedVehicle } from './VehicleGrid';
import { Badge } from '@/components/ui/badge';
import { VehicleCard } from './VehicleCard';
import { SimpleVehicle } from './VehicleCarousel';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/react';

interface VehicleListProps {
  vehicles: ExtendedVehicle[];
  columns: 2 | 3 | 4;
  getStatusColor: (status: string) => string;
  sortOrder:
    | 'price_asc'
    | 'price_desc'
    | 'date_asc'
    | 'date_desc'
    | 'year_desc'
    | 'year_asc'
    | 'mileage_asc';
  setSortOrder: React.Dispatch<
    React.SetStateAction<
      | 'price_asc'
      | 'price_desc'
      | 'date_asc'
      | 'date_desc'
      | 'year_desc'
      | 'year_asc'
      | 'mileage_asc'
    >
  >;
  cardSettings?: {
    cardBgColor: string;
    cardBorderColor: string;
    cardTextColor: string;
    cardPriceColor: string;
    cardButtonColor: string;
    cardButtonTextColor: string;
    detailsButtonText: string;
    bannerPosition: 'left' | 'right';
    pricePosition: 'overlay' | 'below-title';
    featuresConfig?: {
      feature1: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
      feature2: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
      feature3: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
      feature4: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
    };
  }[];
  newBadgeText?: string;
}

const sortOptions = [
  {
    key: 'date_desc',
    label: 'Recientes primero',
    icon: 'mdi:clock-outline',
  },
  {
    key: 'date_asc',
    label: 'Antiguos primero',
    icon: 'mdi:clock',
  },
  {
    key: 'price_asc',
    label: 'Precio: Menor a Mayor',
    icon: 'mdi:sort-ascending',
  },
  {
    key: 'price_desc',
    label: 'Precio: Mayor a Menor',
    icon: 'mdi:sort-descending',
  },
  { key: 'year_desc', label: 'Año: Más Reciente', icon: 'mdi:calendar' },
  {
    key: 'year_asc',
    label: 'Año: Más Antiguo',
    icon: 'mdi:calendar-outline',
  },
  {
    key: 'mileage_asc',
    label: 'Kilometraje: Menor a Mayor',
    icon: 'mdi:speedometer-slow',
  },
];

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  columns,
  getStatusColor,
  sortOrder,
  setSortOrder,
  cardSettings,
  newBadgeText,
}) => {
  // Determine grid columns based on the columns prop
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[columns];

  // Ordenar los vehículos según el criterio seleccionado
  const sortedVehicles = [...vehicles].sort((a, b) => {
    // Primero ordenar por estado (disponible primero)
    if (a.status?.name === 'Vendido' && b.status?.name !== 'Vendido') return 1;
    if (a.status?.name !== 'Vendido' && b.status?.name === 'Vendido') return -1;
    if (a.status?.name === 'Reservado' && b.status?.name !== 'Reservado')
      return 1;
    if (a.status?.name !== 'Reservado' && b.status?.name === 'Reservado')
      return -1;

    // Luego aplicar el ordenamiento seleccionado
    switch (sortOrder) {
      case 'date_desc':
        return (
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
        );
      case 'date_asc':
        return (
          new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime()
        );
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

  return (
    <div className='w-full'>
      {/* Sort Controls */}
      <div className='flex justify-end mb-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center gap-1 text-xs border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
            >
              <span>
                {sortOptions.find((option) => option.key === sortOrder)
                  ?.label || 'Ordenar por'}
              </span>
              <Icon icon='mdi:sort' className='text-base' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.key}
                onSelect={() => setSortOrder(option.key as any)}
                className={
                  sortOrder === option.key
                    ? 'font-bold bg-gray-100 text-black'
                    : ''
                }
              >
                <Icon icon={option.icon} className='text-sm mr-2' />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {vehicles.length === 0 ? (
        <div className='text-center p-6 bg-gray-50 rounded-lg'>
          <p className='text-gray-500'>
            No hay vehículos que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-6`}>
          {sortedVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle as unknown as SimpleVehicle}
              compact={false}
              cardBgColor={cardSettings?.[0]?.cardBgColor}
              cardBorderColor={cardSettings?.[0]?.cardBorderColor}
              cardTextColor={cardSettings?.[0]?.cardTextColor}
              cardPriceColor={cardSettings?.[0]?.cardPriceColor}
              cardButtonColor={cardSettings?.[0]?.cardButtonColor}
              cardButtonTextColor={cardSettings?.[0]?.cardButtonTextColor}
              detailsButtonText={cardSettings?.[0]?.detailsButtonText}
              bannerPosition={cardSettings?.[0]?.bannerPosition}
              pricePosition={cardSettings?.[0]?.pricePosition}
              featuresConfig={cardSettings?.[0]?.featuresConfig}
              newBadgeText={newBadgeText}
            />
          ))}
        </div>
      )}
    </div>
  );
};
