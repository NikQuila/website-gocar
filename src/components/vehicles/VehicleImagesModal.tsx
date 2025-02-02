import { Modal, ModalContent, ModalBody, Button, Image } from '@heroui/react';
import { Icon } from '@iconify/react';

interface VehicleImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string;
  images: string[];
  onImageChange: (image: string) => void;
}

export default function VehicleImagesModal({
  isOpen,
  onClose,
  currentImage,
  images,
  onImageChange,
}: VehicleImagesModalProps) {
  const handlePrevImage = () => {
    const currentIndex = images.indexOf(currentImage);
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onImageChange(images[prevIndex]);
  };

  const handleNextImage = () => {
    const currentIndex = images.indexOf(currentImage);
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onImageChange(images[nextIndex]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='full'
      classNames={{
        backdrop: 'bg-black/90',
        base: 'bg-transparent shadow-none',
      }}
      hideCloseButton
    >
      <ModalContent>
        <ModalBody className='p-0 h-screen flex flex-col justify-between'>
          <div className='relative w-full h-full flex flex-col'>
            {/* Close Button */}
            <Button
              isIconOnly
              className='absolute top-4 right-4 z-50 bg-black/50 text-white hover:bg-black/70'
              variant='flat'
              onPress={onClose}
            >
              <Icon icon='mdi:close' className='text-2xl' />
            </Button>

            {/* Navigation Buttons */}
            <Button
              isIconOnly
              className='absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 text-white hover:bg-black/70'
              variant='flat'
              onPress={handlePrevImage}
            >
              <Icon icon='mdi:chevron-left' className='text-2xl' />
            </Button>

            <Button
              isIconOnly
              className='absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 text-white hover:bg-black/70'
              variant='flat'
              onPress={handleNextImage}
            >
              <Icon icon='mdi:chevron-right' className='text-2xl' />
            </Button>

            {/* Main Image Container */}
            <div className='flex-1 flex items-center justify-center p-8'>
              <Image
                alt='Vehicle'
                className=' h-[50vh] sm:h-[80vh] w-auto object-contain'
                src={currentImage}
              />
            </div>

            {/* Thumbnails */}
            <div className='w-full bg-black/30 p-4'>
              <div className='flex justify-center gap-2 max-w-screen-lg mx-auto'>
                {images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => onImageChange(image)}
                    className={`w-20 h-full rounded-lg overflow-hidden cursor-pointer transition-all ${
                      currentImage === image
                        ? 'ring-2 ring-white opacity-100'
                        : 'opacity-50 hover:opacity-75'
                    }`}
                  >
                    <Image
                      alt={`Thumbnail ${index + 1}`}
                      className='w-full h-full object-cover'
                      src={image}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>{' '}
      </ModalContent>
    </Modal>
  );
}
