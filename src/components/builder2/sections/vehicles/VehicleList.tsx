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
import { VehicleCard2 } from './VehicleCard2';
import { SimpleVehicle } from './VehicleCarousel';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/react';

// 👉 Framer Motion (ligero)
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';

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
      feature1?: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
      feature2?: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
      feature3?: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
      feature4?: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
    };
  }[];
  newBadgeText?: string;
  /** usa Card2 cuando proviene del grid2 */
  source?: 'grid' | 'grid2';
}

const sortOptions = [
  { key: 'date_desc', label: 'Recientes primero', icon: 'mdi:clock-outline' },
  { key: 'date_asc', label: 'Antiguos primero', icon: 'mdi:clock' },
  { key: 'price_asc', label: 'Precio: Menor a Mayor', icon: 'mdi:sort-ascending' },
  { key: 'price_desc', label: 'Precio: Mayor a Menor', icon: 'mdi:sort-descending' },
  { key: 'year_desc', label: 'Año: Más Reciente', icon: 'mdi:calendar' },
  { key: 'year_asc', label: 'Año: Más Antiguo', icon: 'mdi:calendar-outline' },
  { key: 'mileage_asc', label: 'Kilometraje: Menor a Mayor', icon: 'mdi:speedometer-slow' },
];

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  columns,
  getStatusColor,
  sortOrder,
  setSortOrder,
  cardSettings,
  newBadgeText,
  source = 'grid',
}) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[columns];

  const sortedVehicles = [...vehicles].sort((a, b) => {
    if (a.status?.name === 'Vendido' && b.status?.name !== 'Vendido') return 1;
    if (a.status?.name !== 'Vendido' && b.status?.name === 'Vendido') return -1;
    if (a.status?.name === 'Reservado' && b.status?.name !== 'Reservado') return 1;
    if (a.status?.name !== 'Reservado' && b.status?.name === 'Reservado') return -1;

    switch (sortOrder) {
      case 'date_desc':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case 'date_asc':
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      case 'price_asc':
        return (a.price || 0) - (b.price || 0);
      case 'price_desc':
        return (b.price || 0) - (a.price || 0);
      case 'year_desc':
        return (b.year || 0) - (a.year || 0);
      case 'year_asc':
        return (a.year || 0) - (b.year || 0);
      case 'mileage_asc':
        return (a.mileage ?? Number.MAX_SAFE_INTEGER) - (b.mileage ?? Number.MAX_SAFE_INTEGER);
      default:
        return 0;
    }
  });

  // ===== Animaciones (suaves y eficientes)
  const reduce = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 1 }, // mantenemos visible para evitar reflujo
    show: {
      opacity: 1,
      transition: {
        // Stagger + delayChildren muy leves
        staggerChildren: 0.06,
        delayChildren: 0.04,
      },
    },
  } as const;

  const itemVariants = reduce
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.15 } },
      }
    : {
        hidden: { opacity: 0, y: 8, scale: 0.98 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1], // similar a easeOutExpo suave
          },
        },
      };

  return (
    <div className='w-full'>
      {/* Sort Controls */}
      <div className='flex justify-end mb-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center gap-1 text-xs border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
            >
              <span>{sortOptions.find((o) => o.key === sortOrder)?.label || 'Ordenar por'}</span>
              <Icon icon='mdi:sort' className='text-base' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.key}
                onSelect={() => setSortOrder(option.key as any)}
                className={sortOrder === option.key ? 'font-bold bg-gray-100 text-black' : ''}
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
          <p className='text-gray-500'>No hay vehículos que coincidan con los filtros seleccionados.</p>
        </div>
      ) : (
        <LazyMotion features={domAnimation}>
          <m.div
            variants={containerVariants}
            initial='hidden'
            animate='show'
            className={`grid ${gridCols} gap-6`}
          >
            {sortedVehicles.map((vehicle) => {
              const features = cardSettings?.[0]?.featuresConfig;
              const common = {
                compact: false,
                cardBgColor: cardSettings?.[0]?.cardBgColor,
                cardBorderColor: cardSettings?.[0]?.cardBorderColor,
                cardTextColor: cardSettings?.[0]?.cardTextColor,
                cardPriceColor: cardSettings?.[0]?.cardPriceColor,
                cardButtonColor: cardSettings?.[0]?.cardButtonColor,
                cardButtonTextColor: cardSettings?.[0]?.cardButtonTextColor,
                detailsButtonText: cardSettings?.[0]?.detailsButtonText,
                bannerPosition: cardSettings?.[0]?.bannerPosition,
                pricePosition: cardSettings?.[0]?.pricePosition,
                newBadgeText,
              } as const;

              return (
                <m.div key={vehicle.id} variants={itemVariants}>
                  {source === 'grid2' ? (
                    <VehicleCard2
                      vehicle={vehicle as unknown as SimpleVehicle}
                      {...common}
                    />
                  ) : (
                    <VehicleCard
                      vehicle={vehicle as unknown as SimpleVehicle}
                      {...common}
                      featuresConfig={features}
                    />
                  )}
                </m.div>
              );
            })}
          </m.div>
        </LazyMotion>
      )}
    </div>
  );
};
