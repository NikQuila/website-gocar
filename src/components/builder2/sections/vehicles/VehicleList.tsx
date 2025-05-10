import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { ExtendedVehicle } from './VehicleGrid';
import { VehicleCard } from './VehicleCard';

interface VehicleListProps {
  vehicles: ExtendedVehicle[];
  columns: 2 | 3 | 4;
  getStatusColor: (status: string) => string;
  sortOrder: 'asc' | 'desc';
  setSortOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  cardSettings?: {
    cardBgColor: string;
    cardBorderColor: string;
    cardTextColor: string;
    cardPriceColor: string;
    cardButtonColor: string;
    cardButtonTextColor: string;
    detailsButtonText: string;
    bannerPosition: 'left' | 'right';
  }[];
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  columns,
  getStatusColor,
  sortOrder,
  setSortOrder,
  cardSettings,
}) => {
  // Determine grid columns based on the columns prop
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[columns];

  return (
    <div className='w-full'>
      {/* Sort Controls */}
      <div className='flex justify-end mb-4'>
        <Button
          variant='outline'
          size='sm'
          className='flex items-center gap-1 text-xs'
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          <span>
            Precio: {sortOrder === 'asc' ? 'Menor a mayor' : 'Mayor a menor'}
          </span>
          <ArrowUpDown size={14} />
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <div className='text-center p-6 bg-gray-50 rounded-lg'>
          <p className='text-gray-500'>
            No hay vehículos que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-6`}>
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              id={vehicle.id}
              brand={vehicle.brand}
              model={vehicle.model}
              price={vehicle.price}
              year={vehicle.year}
              mileage={vehicle.mileage}
              main_image={vehicle.main_image}
              status={vehicle.status}
              category={vehicle.category}
              fuel_type={vehicle.fuel_type}
              condition={vehicle.condition}
              compact={false}
              cardBgColor={cardSettings?.[0]?.cardBgColor}
              cardBorderColor={cardSettings?.[0]?.cardBorderColor}
              cardTextColor={cardSettings?.[0]?.cardTextColor}
              cardPriceColor={cardSettings?.[0]?.cardPriceColor}
              cardButtonColor={cardSettings?.[0]?.cardButtonColor}
              cardButtonTextColor={cardSettings?.[0]?.cardButtonTextColor}
              detailsButtonText={cardSettings?.[0]?.detailsButtonText}
              bannerPosition={cardSettings?.[0]?.bannerPosition}
            />
          ))}
        </div>
      )}
    </div>
  );
};
