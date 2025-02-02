'use client';
import { Card, CardBody, CardFooter, Image, Button, Chip } from '@heroui/react';
import { Vehicle } from '../../utils/types';
import { useRouter } from 'next/navigation';
import {
  mapFuelTypeToSpanish,
  mapTransmissionTypeToSpanish,
} from '@/utils/functions';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const router = useRouter();

  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(vehicle.price);

  const discountedPrice = vehicle.discount_percentage
    ? vehicle.price * (1 - vehicle.discount_percentage / 100)
    : null;

  const isSold = vehicle.status === 'sold';

  const handleViewDetails = () => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  return (
    <Card className={`${isSold ? 'opacity-85' : ''} relative overflow-hidden`}>
      <div
        className={`${
          !vehicle?.discount_percentage ||
          vehicle?.discount_percentage <= 0 ||
          isSold
            ? 'hidden'
            : ''
        }`}
      >
        {vehicle?.discount_percentage &&
          vehicle?.discount_percentage > 0 &&
          !isSold && (
            <div className='absolute top-2 left-2 z-30'>
              <Chip
                color='warning'
                variant='shadow'
                className='text-white bg-gradient-to-r from-orange-500 to-red-500'
              >
                {`Oferta!`}
              </Chip>
            </div>
          )}
      </div>
      {isSold && (
        <div className='absolute top-0 right-0 h-[200px] w-[200px] overflow-hidden z-50 rotate-0'>
          <div className='absolute top-[30px] right-[-50px] bg-sold text-white font-bold py-2 w-[250px] text-center transform rotate-45'>
            VENDIDO
          </div>
        </div>
      )}
      <CardBody className='p-0 '>
        <div className='relative'>
          <Image
            alt={`${vehicle.brand?.name} ${vehicle.model?.name}`}
            className={`w-full object-cover h-60 rounded-t-xl rounded-b-none ${
              isSold ? 'opacity-75' : ''
            }`}
            src={vehicle.main_image}
          />
          {isSold && <div className='absolute inset-0 bg-black/20 z-10'></div>}
        </div>
      </CardBody>
      <CardFooter className='flex flex-col text-left p-4'>
        <div className='flex justify-between w-full items-start mb-2'>
          <div>
            <h3 className='font-semibold text-lg'>
              {vehicle.brand?.name} {vehicle.model?.name}
            </h3>
            <p className='text-sm text-gray-500'>{vehicle.year}</p>
          </div>
          <div className='text-right'>
            {vehicle.discount_percentage ? (
              <>
                <p className='text-sm line-through text-gray-400'>
                  {formattedPrice}
                </p>
                <p className='font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'>
                  {new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                  }).format(discountedPrice!)}
                </p>
              </>
            ) : (
              <p className='font-bold'>{formattedPrice}</p>
            )}
          </div>
        </div>
        <div className='flex gap-2 text-sm text-gray-500 mb-4'>
          <span>{vehicle.mileage.toLocaleString()} km</span>
          <span>•</span>
          <span>{mapTransmissionTypeToSpanish(vehicle.transmission)}</span>
          <span>•</span>
          <span>{mapFuelTypeToSpanish(vehicle.fuel_type)}</span>
        </div>
        <Button
          onPress={handleViewDetails}
          color={isSold ? 'danger' : 'primary'}
          fullWidth
          isDisabled={isSold}
          className={`font-semibold ${
            isSold ? 'bg-sold hover:bg-sold-600' : ''
          }`}
        >
          {isSold ? 'Vehículo vendido' : 'Ver detalles'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
