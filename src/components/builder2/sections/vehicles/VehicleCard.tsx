import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Car, Tag, Calendar, Gauge } from 'lucide-react';

export interface VehicleCardProps {
  id: number;
  brand?: { id: number; name: string };
  model?: { id: number; name: string };
  price?: number;
  year?: number;
  mileage?: number;
  main_image?: string;
  status?: { id: number; name: string };
  category?: { id: number; name: string };
  fuel_type?: { id: number; name: string };
  condition?: { id: number; name: string };
  compact?: boolean;
  cardBgColor?: string;
  cardBorderColor?: string;
  cardTextColor?: string;
  cardPriceColor?: string;
  cardButtonColor?: string;
  cardButtonTextColor?: string;
  detailsButtonText?: string;
  bannerPosition?: 'left' | 'right';
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  id,
  brand,
  model,
  price,
  year,
  mileage,
  main_image,
  status,
  category,
  fuel_type,
  condition,
  compact = false,
  cardBgColor = '#ffffff',
  cardBorderColor = '#e5e7eb',
  cardTextColor = '#1f2937',
  cardPriceColor = '#ffffff',
  cardButtonColor = '#3b82f6',
  cardButtonTextColor = '#ffffff',
  detailsButtonText = 'Ver detalles',
  bannerPosition = 'right',
}) => {
  const isNotAvailable = status?.name && status.name !== 'Publicado';

  // Obtener color del badge de estado
  const getStatusColor = (statusName: string) => {
    switch (statusName) {
      case 'Vendido':
        return 'bg-red-700 text-white'; // Rojo más intenso
      case 'Reservado':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatear precio
  const formatPrice = (priceValue: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(priceValue);
  };

  const bannerBaseClasses =
    'absolute w-[200%] text-center py-2 font-bold text-sm uppercase tracking-wider shadow-xl transform';
  const bannerPositionClasses =
    bannerPosition === 'left'
      ? 'rotate-[-45deg] top-[30px] left-[-75px]'
      : 'rotate-45 top-[30px] right-[-75px]';

  return (
    <div
      className={`group relative overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md h-full ${
        isNotAvailable ? 'opacity-90' : '' // Opacidad más sutil
      }`}
      style={{
        backgroundColor: cardBgColor,
        borderColor: cardBorderColor,
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      {/* Imagen */}
      <div
        className={`relative ${
          compact ? 'h-48' : 'h-64'
        } overflow-hidden bg-gray-100`}
        // No aplicar grayscale, solo opacidad general de la tarjeta
      >
        {main_image ? (
          <img
            src={main_image}
            alt={`${brand?.name} ${model?.name}`}
            className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-gray-100'>
            <Car size={48} className='text-gray-300' />
          </div>
        )}

        {/* Banner diagonal - Solo para Vendido o Reservado */}
        {isNotAvailable && status?.name && (
          <div
            className={`absolute top-0 ${
              bannerPosition === 'left' ? 'left-0' : 'right-0'
            } overflow-hidden w-36 h-36 z-20`}
          >
            <div
              className={`${getStatusColor(
                status.name
              )} ${bannerBaseClasses} ${bannerPositionClasses}`}
            >
              {status.name}
            </div>
          </div>
        )}

        {/* Etiqueta de precio */}
        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 transition-opacity'>
          <div className='flex justify-between items-center'>
            <span
              className='font-bold text-xl'
              style={{ color: cardPriceColor }}
            >
              {price ? formatPrice(price) : 'Consultar'}
            </span>
            <div
              className='text-xs'
              style={{ color: cardPriceColor, opacity: '0.8' }}
            >
              {year}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className={`p-4 ${isNotAvailable ? 'pointer-events-none' : ''}`}>
        <h3
          className='text-lg font-semibold mb-1'
          style={{ color: cardTextColor }}
        >
          {brand?.name} {model?.name}
        </h3>

        {!compact && (
          <div className='mt-3 grid grid-cols-2 gap-2'>
            {category?.name && (
              <div
                className='flex items-center text-xs'
                style={{ color: cardTextColor, opacity: '0.7' }}
              >
                <Car size={14} className='mr-1' style={{ opacity: '0.6' }} />
                <span>{category.name}</span>
              </div>
            )}

            {fuel_type?.name && (
              <div
                className='flex items-center text-xs'
                style={{ color: cardTextColor, opacity: '0.7' }}
              >
                <Tag size={14} className='mr-1' style={{ opacity: '0.6' }} />
                <span>{fuel_type.name}</span>
              </div>
            )}

            {year && (
              <div
                className='flex items-center text-xs'
                style={{ color: cardTextColor, opacity: '0.7' }}
              >
                <Calendar
                  size={14}
                  className='mr-1'
                  style={{ opacity: '0.6' }}
                />
                <span>{year}</span>
              </div>
            )}

            {mileage && (
              <div
                className='flex items-center text-xs'
                style={{ color: cardTextColor, opacity: '0.7' }}
              >
                <Gauge size={14} className='mr-1' style={{ opacity: '0.6' }} />
                <span>{mileage.toLocaleString()} km</span>
              </div>
            )}
          </div>
        )}

        <div className={`${compact ? 'mt-2' : 'mt-4'} flex`}>
          <Button
            variant='outline'
            size='sm'
            className={`text-xs transition-colors w-full hover:opacity-90 ${
              isNotAvailable ? 'opacity-60 cursor-not-allowed' : '' // Opacidad del botón ajustada
            }`}
            style={{
              borderColor: cardButtonColor,
              backgroundColor: 'transparent',
              color: cardButtonColor,
            }}
            asChild
            onClick={(e) => {
              if (isNotAvailable) {
                e.preventDefault();
              }
            }}
          >
            <a
              href={`/vehicles/${id}`}
              className='flex items-center justify-center'
              tabIndex={isNotAvailable ? -1 : undefined}
            >
              <span>{detailsButtonText}</span>
              <ExternalLink size={12} className='ml-1' />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
