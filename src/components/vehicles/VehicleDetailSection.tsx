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
import { useState, useEffect } from 'react';
import VehicleImagesModal from './VehicleImagesModal';
import { Client, Vehicle } from '../../utils/types';
import {
  mapFuelTypeToSpanish,
  mapTransmissionTypeToSpanish,
  contactByWhatsApp,
} from '@/utils/functions';
import useThemeStore from '@/store/useThemeStore';

interface VehicleDetailSectionProps {
  vehicle: Vehicle | null;
  loading?: boolean;
  client?: Client;
  onLike?: (vehicleId: string) => Promise<void>;
  isLiked?: boolean;
  showLikeButton?: boolean;
}

interface DetailCardProps {
  icon: string;
  label: string;
  value: string;
  className?: string;
}

function DetailCard({ icon, label, value, className }: DetailCardProps) {
  return (
    <Card className={`bg-gray-50 dark:bg-dark-card ${className || ''}`}>
      <CardBody className='flex flex-col items-center text-center gap-1 p-4'>
        <Icon
          icon={icon}
          className='text-2xl text-gray-800 dark:text-gray-200'
        />
        <p className='text-sm text-gray-600 dark:text-gray-400'>{label}</p>
        <p className='font-semibold text-gray-900 dark:text-white'>{value}</p>
      </CardBody>
    </Card>
  );
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
  const [isVerticalImage, setIsVerticalImage] = useState<boolean>(false);
  const [mainImageStyle, setMainImageStyle] = useState({});
  const [thumbnailStyles, setThumbnailStyles] = useState<Record<string, any>>(
    {}
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (!vehicle?.main_image) return;

    const img = document.createElement('img');
    img.onload = () => {
      const isVertical = img.height > img.width * 1.2;
      setIsVerticalImage(isVertical);

      if (isVertical) {
        setMainImageStyle({
          objectPosition: 'center 100%',
          objectFit: 'cover',
          height: '100%',
          width: '100%',
          transformOrigin: 'center 900%',
          transform: 'scale(1.0)',
        });
      } else {
        // Para imágenes horizontales, ajustamos para que llenen el contenedor
        setMainImageStyle({
          objectPosition: 'center center',
          objectFit: 'cover',
          height: '100%',
          width: '100%',
        });
      }
    };
    img.src = vehicle.main_image;
  }, [vehicle?.main_image]);

  useEffect(() => {
    if (!vehicle) return;

    const allImages = [vehicle.main_image, ...(vehicle.gallery || [])];
    const styles: Record<string, any> = {};

    allImages.forEach((imageUrl) => {
      const img = document.createElement('img');
      img.onload = () => {
        if (img.height > img.width * 1.2) {
          styles[imageUrl] = {
            objectPosition: 'center 100%',
            objectFit: 'cover',
            height: '100%',
            width: '100%',
            transformOrigin: 'center 1000%',
            transform: 'scale(1.02)',
          };
        } else {
          styles[imageUrl] = {
            objectPosition: 'center center',
            objectFit: 'cover',
            height: '100%',
            width: '100%',
          };
        }
        setThumbnailStyles({ ...styles });
      };
      img.src = imageUrl;
    });
  }, [vehicle?.main_image, vehicle?.gallery]);

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
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
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
    <div className='flex flex-col md:grid md:grid-cols-2 gap-8'>
      <div
        className={`space-y-4 px-4 md:px-0 ${
          isVerticalImage ? 'md:flex md:flex-row md:gap-4' : ''
        }`}
      >
        <div className={`${isVerticalImage ? 'md:w-2/3' : 'w-full'}`}>
          <Card className='w-full relative dark:bg-dark-card dark:border-dark-border'>
            {isSold && (
              <div className='absolute top-0 right-0 h-[200px] w-[200px] overflow-hidden z-50 rotate-0'>
                <div className='absolute top-[30px] right-[-50px] bg-sold text-white font-bold py-2 w-[250px] text-center transform rotate-45'>
                  VENDIDO
                </div>
              </div>
            )}
            <CardBody className='p-0 w-full'>
              <div
                className={`${
                  isVerticalImage
                    ? "h-[415px] md:h-[500px]"
                    : "h-[170px] sm:h-[300px] md:h-[340px]"
                } w-full overflow-hidden`}
              >
                <Image
                  alt={`${vehicle?.brand?.name} ${vehicle?.model?.name}`}
                  className={`w-full h-full object-cover cursor-pointer ${
                    isSold ? 'opacity-75' : ''
                  }`}
                  style={mainImageStyle}
                  src={vehicle.main_image}
                  onClick={() => handleImageClick(vehicle.main_image)}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Miniaturas para mobile cuando la imagen es vertical */}
        {isVerticalImage && (
          <div className="mt-2 block md:hidden">
            <div className="flex flex-row justify-between w-full">
              {displayedImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => handleImageClick(image)}
                  className="relative cursor-pointer rounded-lg overflow-hidden w-[65px] h-[65px]"
                >
                  <Image
                    alt={`Gallery ${index}`}
                    className="h-full w-full object-cover"
                    style={thumbnailStyles[image] || {}}
                    src={image}
                  />
                </div>
              ))}

              {remainingPhotos > 0 && (
                <div
                  className="relative cursor-pointer rounded-lg overflow-hidden w-[65px] h-[65px] bg-gray-100 dark:bg-dark-card flex items-center justify-center"
                  onClick={() => handleImageClick(allImages[MAX_THUMBNAILS])}
                >
                  <div className="text-center">
                    <Icon
                      icon="mdi:image-multiple"
                      className="text-xl text-gray-600 dark:text-gray-400"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      +{remainingPhotos}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Miniaturas para mobile cuando la imagen NO es vertical */}
        {!isVerticalImage && (
          <div className="mt-2 block md:hidden">
            <div className="flex flex-row justify-between gap-2 w-full">
              {displayedImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => handleImageClick(image)}
                  className="relative cursor-pointer rounded-lg overflow-hidden w-[85px] h-[60px]"
                >
                  <Image
                    alt={`Gallery ${index}`}
                    className="h-full w-full object-cover"
                    style={thumbnailStyles[image] || {}}
                    src={image}
                  />

                </div>
              ))}

              {remainingPhotos > 0 && (
                <div
                  className="relative cursor-pointer rounded-lg overflow-hidden w-[85px] h-[43px] bg-gray-100 dark:bg-dark-card flex items-center justify-center"
                  onClick={() => handleImageClick(allImages[MAX_THUMBNAILS])}
                >
                  <div className="text-center">
                    <Icon
                      icon="mdi:image-multiple"
                      className="text-lg text-gray-600 dark:text-gray-400"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      +{remainingPhotos}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Miniaturas verticales para desktop */}
        {isVerticalImage && (
          <div className='hidden md:block md:w-1/3'>
            <div className='flex flex-col gap-2 -mt-12'>
              {displayedImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => handleImageClick(image)}
                  className='relative cursor-pointer rounded-lg overflow-hidden min-w-[90px] w-[90px] h-[100px] md:w-[120px] md:h-[140px]'
                >
                  <Image
                    alt={`Gallery ${index}`}
                    className='h-full w-full object-cover'
                    style={thumbnailStyles[image] || {}}
                    src={image}
                  />
                </div>
              ))}

              {remainingPhotos > 0 && (
                <div
                  className='relative cursor-pointer rounded-lg overflow-hidden min-w-[90px] w-[90px] h-[100px] md:w-[120px] md:h-[140px] bg-gray-100 dark:bg-dark-card flex items-center justify-center'
                  onClick={() => handleImageClick(allImages[MAX_THUMBNAILS])}
                >
                  <div className='text-center'>
                    <Icon
                      icon="mdi:image-multiple"
                      className="text-xl text-gray-600 dark:text-gray-400"
                    />
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                      +{remainingPhotos}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Miniaturas horizontales para desktop cuando la imagen NO es vertical */}
        {!isVerticalImage && (
          <div className="hidden md:block mt-6">
            <div className="flex flex-row gap-6 justify-center">
              {displayedImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => handleImageClick(image)}
                  className="relative cursor-pointer rounded-lg overflow-hidden w-[240px] h-[200px]"
                >
                  <Image
                    alt={`Gallery ${index}`}
                    className='h-full w-full object-cover'
                    style={thumbnailStyles[image] || {}}
                    src={image}
                  />
                </div>
              ))}

              {remainingPhotos > 0 && (
                <div
                  className="relative cursor-pointer rounded-lg overflow-hidden w-[240px] h-[80px] bg-gray-100 dark:bg-dark-card flex items-center justify-center"
                  onClick={() => handleImageClick(allImages[MAX_THUMBNAILS])}
                >
                  <div className='text-center'>
                    <Icon
                      icon="mdi:image-multiple"
                      className="text-xl text-gray-600 dark:text-gray-400"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      +{remainingPhotos}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Details Sectio */}
      <div className='space-y-6 px-4 md:px-0'>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start'>
          <div className='space-y-2'>
            <h1 className='text-4xl font-bold text-gray-900 dark:text-white'>
              {vehicle.brand?.name} {vehicle.model?.name}
            </h1>
            <div className='flex justify-between items-center'>
              <p className='text-2xl text-gray-600 dark:text-gray-400'>
                {vehicle.year}
              </p>
              <div className='block sm:hidden'>
                <Button
                  size='sm'
                  color='primary'
                  variant='flat'
                  className='font-semibold'
                  startContent={
                    <Icon
                      icon='mdi:share-variant'
                      className='text-xl text-primary'
                    />
                  }
                  onPress={handleShare}
                >
                  Compartir
                </Button>
              </div>
            </div>
          </div>
          <div className='hidden sm:block'>
            <Button
              variant='bordered'
              size='lg'
              startContent={
                <Icon icon='mdi:share-variant' className='text-xl' />
              }
              onPress={handleShare}
              className='text-primary'
            >
              Compartir
            </Button>
          </div>
        </div>

        {/* Cards de características */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 place-items-center'>
          <DetailCard
            icon='mdi:speedometer'
            label='Kilometraje'
            value={`${vehicle.mileage.toLocaleString()} km`}
            className='w-full max-w-[170px]'
          />
          <DetailCard
            icon='mdi:gas-station'
            label='Combustible'
            value={vehicle.fuel_type_new?.name}
            className='w-full max-w-[170px]'
          />
          <DetailCard
            icon='mdi:car-shift-pattern'
            label='Transmisión'
            value={mapTransmissionTypeToSpanish(vehicle.transmission)}
            className='w-full max-w-[170px]'
          />
          <DetailCard
            icon='mdi:palette'
            label='Color'
            value={vehicle?.color_new?.name}
            className='w-full max-w-[170px]'
          />
        </div>

        {/* Precio y características */}
        <div className='space-y-4'>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center'>
            <div>
              {vehicle.discount_percentage ? (
                <>
                  <p className='text-sm line-through text-gray-400 dark:text-gray-500'>
                    {formattedPrice}
                  </p>
                  <p className='text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'>
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                    }).format(discountedPrice!)}
                  </p>
                </>
              ) : (
                <p className='text-4xl font-bold text-gray-900 dark:text-white'>
                  {formattedPrice}
                </p>
              )}
            </div>

            <div className='hidden sm:flex gap-3'>
              <Button
                size='lg'
                variant='bordered'
                color='primary'
                startContent={
                  <Icon icon={isLiked ? 'mdi:heart' : 'mdi:heart-outline'} />
                }
                onPress={() => onLike && onLike(vehicle.id)}
              >
                Guardar
              </Button>
              <Button
                size='lg'
                color='primary'
                as='a'
                startContent={<Icon icon='mdi:whatsapp' className='text-xl' />}
                href={contactByWhatsApp(
                  client?.contact?.phone || '',
                  `Hola, me interesa el ${vehicle.brand?.name} ${vehicle.model?.name} ${vehicle.year}`
                )}
                target='_blank'
                className='bg-primary text-white dark:bg-primary dark:text-black hover:bg-primary/90 dark:hover:bg-primary/90'
              >
                Contactar
              </Button>
            </div>
          </div>

          {/* Botones para mobile */}
          <div className='flex gap-2 sm:hidden mt-4'>
            <Button
              size='lg'
              variant='bordered'
              color='primary'
              className='flex-1'
              startContent={
                <Icon icon={isLiked ? 'mdi:heart' : 'mdi:heart-outline'} />
              }
              onPress={() => onLike && onLike(vehicle.id)}
            >
              Guardar
            </Button>
            <Button
              size='lg'
              color='primary'
              as='a'
              className='flex-1 bg-primary text-white dark:bg-primary dark:text-black hover:bg-primary/90 dark:hover:bg-primary/90'
              startContent={<Icon icon='mdi:whatsapp' className='text-xl' />}
              href={contactByWhatsApp(
                client?.contact?.phone || '',
                `Hola, me interesa el ${vehicle.brand?.name} ${vehicle.model?.name} ${vehicle.year}`
              )}
              target='_blank'
            >
              Contactar
            </Button>
          </div>

          <Divider className='dark:border-dark-border' />

          {/* Características del vehículo */}
          <div className='space-y-3'>
            {/*  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Icon icon="mdi:wrench" className="text-xl" />
              <span>Único dueño – Mantenciones al día</span>
            </div> */}

            <div className='flex flex-wrap gap-2'>
              {vehicle.features?.map((feature, index) => (
                <Chip
                  key={index}
                  variant='flat'
                  className='bg-gray-100 dark:bg-dark-card border-none rounded-md'
                >
                  {feature}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <Divider className='dark:border-dark-border' />

        <div>
          <h2 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
            Descripción
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            {vehicle.description}
          </p>
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
