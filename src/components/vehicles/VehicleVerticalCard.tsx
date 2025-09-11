'use client';
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Chip,
  Divider,
} from '@heroui/react';
import { Vehicle } from '../../utils/types';
import { useRouter } from 'next/navigation';
import {
  mapFuelTypeToSpanish,
  mapTransmissionTypeToSpanish,
} from '@/utils/functions';
import useClientStore from '@/store/useClientStore';
import { useCurrency } from '@/hooks/useCurrency';

interface VehicleVerticalCardProps {
  vehicle: Vehicle;
  newBadgeText?: string;
}

const VehicleVerticalCard = ({
  vehicle,
  newBadgeText = 'Nuevo',
}: VehicleVerticalCardProps) => {
  const router = useRouter();
  const { client } = useClientStore();
  const { formatPrice } = useCurrency();

  const formattedPrice = formatPrice(vehicle.price);

  const discountedPrice = vehicle.discount_percentage
    ? vehicle.price * (1 - vehicle.discount_percentage / 100)
    : null;

  const savingsAmount = vehicle.discount_percentage
    ? vehicle.price - (discountedPrice || 0)
    : 0;

  const formattedSavings = formatPrice(savingsAmount);

  const isSold = vehicle.status?.name === 'Vendido';
  const isReserved = vehicle.status?.name === 'Reservado';

  const isNew = () => {
    if (!vehicle.created_at) return false;
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const createdAtDate = new Date(vehicle.created_at);
    return createdAtDate > fiveDaysAgo;
  };

  const getRandomBadgeText = () => {
    const badgeOptions = [
      'Nuevo',
      'Recién Llegado',
      'Oportunidad',
      'Destacado',
    ];
    const hash = vehicle.id
      ? vehicle.id
          .toString()
          .split('')
          .reduce((a, b) => a + b.charCodeAt(0), 0)
      : Math.random() * 1000;
    const index = Math.floor(hash) % badgeOptions.length;
    return newBadgeText === 'Nuevo' ? badgeOptions[index] : newBadgeText;
  };

  const handleViewDetails = () => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  return (
    <Card
      isPressable={!isSold && !isReserved}
      onPress={handleViewDetails}
      className={`overflow-hidden bg-white dark:bg-dark-card w-full ${
        isSold || isReserved ? 'opacity-75' : ''
      }`}
    >
      <div className='w-full'>
        <div className='relative w-full aspect-[16/9]'>
          {isSold && (
            <div className='absolute top-0 right-0 h-[200px] w-[200px] overflow-hidden z-50 rotate-0'>
              <div className='absolute top-[30px] right-[-50px] bg-sold text-white font-bold py-2 w-[250px] text-center transform rotate-45'>
                VENDIDO
              </div>
            </div>
          )}
          {isReserved && (
            <div className='absolute top-0 right-0 h-[200px] w-[200px] overflow-hidden z-50 rotate-0'>
              <div className='absolute top-[30px] right-[-50px] bg-yellow-500 text-white font-bold py-2 w-[250px] text-center transform rotate-45'>
                RESERVADO
              </div>
            </div>
          )}
          {(vehicle.label || (isNew() && !isSold && !isReserved)) && (
            <div className='absolute top-2 right-2 z-20'>
              <Chip
                size='sm'
                className='shadow-lg text-white bg-green-500 border-none font-bold'
              >
                {vehicle.label || getRandomBadgeText()}
              </Chip>
            </div>
          )}
          <Image
            alt={`${vehicle.brand?.name} ${vehicle.model?.name}`}
            className='object-cover w-full h-full object-top'
            src={vehicle.main_image}
          />
          {!isSold &&
            !isReserved &&
            vehicle.discount_percentage !== undefined &&
            vehicle.discount_percentage > 0 && (
              <div className='absolute bottom-2 right-2 z-10'>
                <Chip
                  size='sm'
                  className='shadow-lg text-white bg-gradient-to-r from-orange-500 to-red-500 border-none'
                >
                  Ahorra {formattedSavings}
                </Chip>
              </div>
            )}
        </div>
      </div>

      <div className='flex flex-col'>
        <CardBody className='flex flex-col flex-grow p-5'>
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                {vehicle.brand?.name} {vehicle.year}
              </p>
            </div>

            <h3 className='text-2xl font-bold dark:text-dark-text'>
              {vehicle.model?.name}
            </h3>

            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
              <span>{vehicle.mileage?.toLocaleString()} km</span>
              <span>•</span>
              <span className='capitalize'>{vehicle.fuel_type?.name}</span>
              <span>•</span>
              <span>{mapTransmissionTypeToSpanish(vehicle.transmission)}</span>
            </div>

            <div className='flex flex-wrap gap-2'>
              {vehicle?.features?.slice(0, 3).map((feature, index) => (
                <Chip
                  key={index}
                  size='sm'
                  variant='flat'
                  className='bg-gray-100 dark:bg-dark-border dark:text-dark-text'
                >
                  {feature}
                </Chip>
              ))}
            </div>
          </div>
        </CardBody>

        <Divider className='dark:border-dark-border' />

        <CardFooter className='p-4'>
          <div className='w-full text-left'>
            {vehicle.discount_percentage ? (
              <>
                <p className='text-sm line-through text-gray-400 dark:text-gray-500 text-left'>
                  {formattedPrice}
                </p>
                <p className='text-xl font-semibold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent text-left'>
                  {formatPrice(discountedPrice!)}
                </p>
              </>
            ) : (
              <p className='text-xl font-semibold text-primary dark:text-white text-left'>
                {formattedPrice}
              </p>
            )}
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};

export default VehicleVerticalCard;
