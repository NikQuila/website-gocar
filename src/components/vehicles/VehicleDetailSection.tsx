import {
  Card,
  CardBody,
  Image,
  Button,
  Chip,
  Divider,
  useDisclosure,
} from '@heroui/react';
import { Icon } from '@iconify/react';

import VehicleDetailSkeleton from './VehicleDetailSkeleton';
import { useState } from 'react';
import VehicleImagesModal from './VehicleImagesModal';
import { Client, Vehicle } from '../../utils/types';
import {
  mapFuelTypeToSpanish,
  mapTransmissionTypeToSpanish,
  contactByWhatsApp,
} from '@/utils/functions';

interface VehicleDetailSectionProps {
  vehicle: Vehicle | null;
  loading?: boolean;
  client?: Client;
  onLike?: (vehicleId: string) => Promise<void>;
  isLiked?: boolean;
  showLikeButton?: boolean;
}

const MAX_THUMBNAILS = 3;

export default function VehicleDetailSection({
  vehicle,
  loading = false,
  client,
  onLike,
  isLiked = false,
  showLikeButton = true,
}: VehicleDetailSectionProps) {
  const [currentModalImage, setCurrentModalImage] = useState<string>('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (loading || !vehicle) {
    return <VehicleDetailSkeleton />;
  }
  const handleShare = async () => {
    const shareData = {
      title: `${vehicle.brand?.name} ${vehicle.model?.name} ${vehicle.year}`,
      text: `Mira este ${vehicle.brand?.name} ${vehicle.model?.name} ${vehicle.year} en venta`,
      url: window.location.href,
    };

    if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
      // Mobile sharing
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };
  const formattedPrice = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(vehicle.price);

  const discountedPrice = vehicle.discount_percentage
    ? vehicle.price * (1 - vehicle.discount_percentage / 100)
    : null;

  const allImages = [vehicle.main_image, ...(vehicle.gallery || [])];
  const remainingPhotos = allImages.length - MAX_THUMBNAILS;
  const displayedImages = allImages.slice(0, MAX_THUMBNAILS);

  const handleImageClick = (image: string) => {
    setCurrentModalImage(image);
    onOpen();
  };

  const isSold = vehicle.status === 'sold';

  return (
    <div className='grid gap-8 lg:grid-cols-2 '>
      {/* Image Gallery Section */}
      <div className='space-y-4'>
        <Card className='w-full relative'>
          {isSold && (
            <div className='absolute top-0 right-0 h-[200px] w-[200px] overflow-hidden z-50 rotate-0'>
              <div className='absolute top-[30px] right-[-50px] bg-sold text-white font-bold py-2 w-[250px] text-center transform rotate-45'>
                VENDIDO
              </div>
            </div>
          )}
          <CardBody className='p-0  w-full'>
            <Image
              alt={`${vehicle?.brand?.name} ${vehicle?.model?.name}`}
              className={`h-96 w-full object-cover cursor-pointer ${
                isSold ? 'opacity-75' : ''
              }`}
              src={vehicle.main_image}
              onClick={() => handleImageClick(vehicle.main_image)}
            />
            {isSold && (
              <div className='absolute inset-0 bg-black/20 z-10'></div>
            )}
          </CardBody>
        </Card>

        <div className='grid grid-cols-4 gap-2'>
          {displayedImages.map((image, index) => (
            <div
              key={index}
              onClick={() => handleImageClick(image)}
              className='relative cursor-pointer rounded-lg overflow-hidden h-24'
            >
              <Image
                alt={`Gallery ${index}`}
                className='h-24 w-full object-cover'
                src={image}
              />
            </div>
          ))}

          {remainingPhotos > 0 && (
            <div
              className='relative cursor-pointer rounded-lg overflow-hidden h-24 bg-gray-100 flex items-center justify-center'
              onClick={() => handleImageClick(allImages[MAX_THUMBNAILS])}
            >
              <div className='text-center'>
                <Icon
                  icon='mdi:image-multiple'
                  className='text-2xl text-gray-600'
                />
                <p className='text-sm text-gray-600 mt-1'>+{remainingPhotos}</p>
              </div>
            </div>
          )}
        </div>

        <div className='flex justify-start'>
          <Chip variant='flat' size='sm' className='bg-gray-100'>
            {allImages.length} fotos disponibles
          </Chip>
        </div>
      </div>

      {/* Vehicle Details Section */}
      <div className='space-y-6'>
        <div>
          <div className='flex justify-between items-center'>
            <h1 className='text-4xl font-bold'>
              {vehicle.brand?.name} {vehicle.model?.name} {vehicle.year}
            </h1>
            <div className='hidden sm:block'>
              <Button
                size='sm'
                color='primary'
                variant='flat'
                className='font-semibold'
                isIconOnly
                onPress={handleShare}
              >
                <Icon
                  icon='mdi:share-variant'
                  className='text-3xl text-primary'
                />
              </Button>
            </div>
          </div>
          <div className='mt-2 flex justify-between items-center'>
            <div className=''>
              {vehicle.discount_percentage ? (
                <>
                  <p className='text-sm line-through text-gray-400'>
                    {formattedPrice}
                  </p>
                  <p className='text-2xl font-semibold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'>
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                    }).format(discountedPrice!)}
                  </p>
                </>
              ) : (
                <p className='text-2xl font-semibold text-primary'>
                  {formattedPrice}
                </p>
              )}
            </div>
            <div className='block sm:hidden'>
              <Button
                size='sm'
                color='primary'
                variant='flat'
                className='font-semibold'
                isIconOnly
                onPress={handleShare}
              >
                <Icon
                  icon='mdi:share-variant'
                  className='text-3xl text-primary'
                />
              </Button>
            </div>
          </div>
        </div>

        <Divider />

        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <DetailCard
            icon='mdi:speedometer'
            label='Kilometraje'
            value={`${vehicle.mileage.toLocaleString()} km`}
          />
          <DetailCard
            icon='mdi:gas-station'
            label='Combustible'
            value={mapFuelTypeToSpanish(vehicle.fuel_type)}
          />
          <DetailCard
            icon='mdi:car-shift-pattern'
            label='Transmisión'
            value={mapTransmissionTypeToSpanish(vehicle.transmission)}
          />
          <DetailCard icon='mdi:palette' label='Color' value={vehicle.color} />
        </div>

        <Divider />

        <div>
          <h2 className='mb-3 text-xl font-semibold'>Descripción</h2>
          <p className='text-gray-600'>{vehicle.description}</p>
        </div>

        <div>
          <h2 className='mb-3 text-xl font-semibold'>Características</h2>
          <div className='flex flex-wrap gap-2'>
            {vehicle.features?.map((feature, index) => (
              <Chip key={index} color='primary'>
                {feature}
              </Chip>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row'>
          {/*   <Button
            size='lg'
            color='primary'
            as='a'
            href={`tel:${client?.contact?.phone}`}
            className='font-semibold'
            startContent={<Icon icon='mdi:phone' />}
          >
            Llamar
          </Button> */}

          <Button
            size='lg'
            color='success'
            as='a'
            href={contactByWhatsApp(
              client?.contact?.phone || '',
              `Hola, me interesa el ${vehicle.brand?.name} ${vehicle.model?.name} ${vehicle.year}`
            )}
            target='_blank'
            rel='noopener noreferrer'
            className='font-semibold'
            startContent={<Icon icon='mdi:whatsapp' />}
          >
            Contactar Vendedor
          </Button>

          {showLikeButton && onLike && (
            <Button
              size='lg'
              variant={isLiked ? 'solid' : 'bordered'}
              color='primary'
              className='font-semibold'
              startContent={
                <Icon icon={isLiked ? 'mdi:heart-outline' : 'mdi:heart'} />
              }
              onClick={() => onLike(vehicle.id)}
            >
              {isLiked ? 'Guardado en favoritos' : 'Guardar en favoritos'}
            </Button>
          )}
        </div>
      </div>

      <VehicleImagesModal
        isOpen={isOpen}
        onClose={onClose}
        currentImage={currentModalImage}
        images={allImages}
        onImageChange={setCurrentModalImage}
      />
    </div>
  );
}

interface DetailCardProps {
  icon: string;
  label: string;
  value: string;
}

function DetailCard({ icon, label, value }: DetailCardProps) {
  return (
    <Card className='bg-gray-50'>
      <CardBody className='gap-2 p-3'>
        <Icon icon={icon} className='text-2xl text-primary' />
        <p className='text-sm text-gray-600'>{label}</p>
        <p className='font-semibold'>{value}</p>
      </CardBody>
    </Card>
  );
}
