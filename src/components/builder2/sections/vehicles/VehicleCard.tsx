import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Car, Tag, Calendar, Gauge } from 'lucide-react';
import { SimpleVehicle } from './VehicleCarousel';

export interface VehicleCardProps {
  vehicle: SimpleVehicle; // Expect the whole vehicle object
  compact?: boolean;
  cardBgColor?: string;
  cardBorderColor?: string;
  cardTextColor?: string;
  cardPriceColor?: string;
  cardButtonColor?: string;
  cardButtonTextColor?: string;
  detailsButtonText?: string;
  bannerPosition?: 'left' | 'right';
  newBadgeText?: string; // New prop for the "Recién publicado" badge text
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle, // Destructure vehicle
  compact = false,
  cardBgColor = '#ffffff',
  cardBorderColor = '#e5e7eb',
  cardTextColor = '#1f2937',
  cardPriceColor = '#ffffff',
  cardButtonColor = '#3b82f6',
  cardButtonTextColor = '#ffffff',
  detailsButtonText = 'Ver detalles',
  bannerPosition = 'right',
  newBadgeText = 'Nuevo', // Default text
}) => {
  const {
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
    created_at,
    discount_percentage,
  } = vehicle;

  // Calculate discounted_price for display
  let displayDiscountedPrice;
  if (price && discount_percentage && discount_percentage > 0) {
    displayDiscountedPrice = price * (1 - discount_percentage / 100);
  }

  const isNotAvailable = status?.name && status.name !== 'Publicado';

  const isNew = () => {
    if (!created_at) return false;
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const createdAtDate = new Date(created_at);
    return createdAtDate > fiveDaysAgo;
  };

  // Obtener color del badge de estado
  const getStatusColor = (statusName: string) => {
    switch (statusName) {
      case 'Vendido':
        return 'bg-red-700 text-white';
      case 'Reservado':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
      className={`group relative overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md h-full
         ${isNotAvailable ? 'opacity-90' : ''}`}
      style={{
        backgroundColor: cardBgColor,
        borderColor: cardBorderColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        cursor: !isNotAvailable ? 'pointer' : 'default',
      }}
      onClick={() => {
        if (!isNotAvailable) window.location.href = `/vehicles/${id}`;
      }}
    >
      {/* Imagen */}
      <div
        className={`relative ${
          compact ? 'h-48' : 'h-64'
        } overflow-hidden bg-gray-100`}
      >
        {main_image ? (
          <img
            src={main_image}
            alt={`${brand?.name} ${model?.name}`}
            className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
            style={{ cursor: 'pointer' }}
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-gray-100'>
            <Car size={48} className='text-gray-300' />
          </div>
        )}

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

        {isNew() && !isNotAvailable && (
          <div className='absolute top-2 right-2 z-10'>
            <Badge className='bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full'>
              {newBadgeText}
            </Badge>
          </div>
        )}

        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 transition-opacity'>
          <div className='flex justify-between items-center'>
            <div>
              {price &&
              displayDiscountedPrice &&
              displayDiscountedPrice < price ? (
                <>
                  <span
                    className='font-bold text-xl'
                    style={{
                      background: 'linear-gradient(to right, #FDBA74, #EA580C)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      display: 'inline-block',
                    }}
                  >
                    {formatPrice(displayDiscountedPrice)}
                  </span>
                  <span
                    className='ml-2 text-sm line-through'
                    style={{ color: cardPriceColor, opacity: '0.7' }}
                  >
                    {formatPrice(price)}
                  </span>
                </>
              ) : (
                <span
                  className='font-bold text-xl'
                  style={{ color: cardPriceColor }}
                >
                  {price ? formatPrice(price) : 'Consultar'}
                </span>
              )}
            </div>
            <div
              className='text-xs'
              style={{ color: cardPriceColor, opacity: '0.8' }}
            >
              {year}
            </div>
          </div>
        </div>
      </div>

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

            {mileage != null && (
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
              isNotAvailable ? 'opacity-60 cursor-not-allowed' : ''
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
