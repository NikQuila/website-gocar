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

interface VehicleHorizontalCardProps {
  vehicle: Vehicle;
}

const VehicleHorizontalCard = ({ vehicle }: VehicleHorizontalCardProps) => {
  const router = useRouter();

  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(vehicle.price);

  const discountedPrice = vehicle.discount_percentage
    ? vehicle.price * (1 - vehicle.discount_percentage / 100)
    : null;

  const savingsAmount = vehicle.discount_percentage
    ? vehicle.price - (discountedPrice || 0)
    : 0;

  const formattedSavings = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(savingsAmount);

  const isSold = vehicle.status === 'sold';

  const handleViewDetails = () => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  return (
    <Card
      isPressable
      onPress={handleViewDetails}
      className='overflow-hidden flex flex-row bg-white dark:bg-dark-card'
    >
      <div className='w-[300px] flex-shrink-0'>
        <div className='relative w-full h-full'>
          <Image
            alt={`${vehicle.brand?.name} ${vehicle.model?.name}`}
            className='object-cover h-full w-full'
            src={vehicle.main_image}
          />
          {vehicle.discount_percentage !== undefined &&
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

      <div className='flex flex-col flex-1'>
        <CardBody className='flex flex-col flex-grow p-4 relative'>
          <div className='space-y-2'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {vehicle.brand?.name} {vehicle.year}
                </p>
                <h3 className='text-xl font-bold dark:text-dark-text mt-1'>
                  {vehicle.model?.name}
                </h3>
              </div>
              <div className='text-right'>
                {vehicle.discount_percentage ? (
                  <>
                    <p className='text-base line-through text-gray-400 dark:text-gray-500'>
                      {formattedPrice}
                    </p>
                    <p className='text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'>
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                      }).format(discountedPrice!)}
                    </p>
                  </>
                ) : (
                  <p className='text-2xl font-bold text-primary dark:text-white'>
                    {formattedPrice}
                  </p>
                )}
              </div>
            </div>

            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
              <span>{vehicle.mileage.toLocaleString()} km</span>
              <span>•</span>
              <span className='capitalize'>{vehicle?.fuel_type_new?.name}</span>
              <span>•</span>
              <span>{mapTransmissionTypeToSpanish(vehicle.transmission)}</span>
            </div>

            {/*   <p className='text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2'>
              {vehicle.description}
            </p> */}

            <div className='flex flex-wrap gap-2 mt-2'>
              {vehicle.features.slice(0, 5).map((feature, index) => (
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
      </div>
    </Card>
  );
};

export default VehicleHorizontalCard;
