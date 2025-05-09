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

interface VehicleListProps {
  vehicles: ExtendedVehicle[];
  columns: 2 | 3 | 4;
  getStatusColor: (status: string) => string;
  sortOrder: 'asc' | 'desc';
  setSortOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  columns,
  getStatusColor,
  sortOrder,
  setSortOrder,
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
            <div
              key={vehicle.id}
              className='group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md'
            >
              {/* Image section */}
              <div className='relative h-64 overflow-hidden bg-gray-100'>
                {vehicle.main_image ? (
                  <img
                    src={vehicle.main_image}
                    alt={`${vehicle.brand?.name} ${vehicle.model?.name}`}
                    className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center bg-gray-100'>
                    <Car size={48} className='text-gray-300' />
                  </div>
                )}

                {/* Status badge */}
                {vehicle.status?.name && (
                  <Badge
                    className={`absolute top-3 right-3 ${getStatusColor(
                      vehicle.status.name
                    )}`}
                  >
                    {vehicle.status.name}
                  </Badge>
                )}

                {/* Price tag */}
                <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 transition-opacity'>
                  <div className='flex justify-between items-center'>
                    <span className='text-white font-bold text-xl'>
                      ${vehicle.price?.toLocaleString() || 'Consultar'}
                    </span>
                    <div className='text-xs text-white opacity-80'>
                      {vehicle.year}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content section */}
              <div className='p-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-1'>
                  {vehicle.brand?.name} {vehicle.model?.name}
                </h3>

                <div className='mt-3 grid grid-cols-2 gap-2'>
                  {vehicle.category?.name && (
                    <div className='flex items-center text-xs text-gray-500'>
                      <Car size={14} className='mr-1 text-gray-400' />
                      <span>{vehicle.category.name}</span>
                    </div>
                  )}

                  {vehicle.fuel_type?.name && (
                    <div className='flex items-center text-xs text-gray-500'>
                      <Tag size={14} className='mr-1 text-gray-400' />
                      <span>{vehicle.fuel_type.name}</span>
                    </div>
                  )}

                  {vehicle.year && (
                    <div className='flex items-center text-xs text-gray-500'>
                      <Calendar size={14} className='mr-1 text-gray-400' />
                      <span>{vehicle.year}</span>
                    </div>
                  )}

                  {vehicle.mileage && (
                    <div className='flex items-center text-xs text-gray-500'>
                      <Gauge size={14} className='mr-1 text-gray-400' />
                      <span>{vehicle.mileage.toLocaleString()} km</span>
                    </div>
                  )}
                </div>

                <div className='mt-4 flex '>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-xs group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors w-full'
                    asChild
                  >
                    <a href={`/vehicles/${vehicle.id}`}>
                      <span>Ver detalles</span>
                      <ExternalLink size={12} className='ml-1' />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
