import { Modal, ModalContent, ModalBody, Button, Image } from '@heroui/react';
import { Icon } from '@iconify/react';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
import { useState, useEffect } from 'react';

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
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageStyle, setImageStyle] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  // Debug logs
  useEffect(() => {}, [isOpen, currentImage, images, isZoomActive]);

  // Resetear zoom cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setIsZoomActive(false);
      setZoomLevel(1);
      setImageStyle({});
    }
  }, [isOpen]);

  // Resetear zoom cuando cambia la imagen
  useEffect(() => {
    setIsZoomActive(false);
    setZoomLevel(1);
    setImageStyle({});
  }, [currentImage]);

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

  // Zoom con rueda del mouse (solo cuando el zoom está activo)
  const handleWheel = (e: React.WheelEvent) => {
    if (!isZoomActive) return; // Solo funcionar cuando el zoom está activo

    e.preventDefault();
    // Deshabilitar zoom con rueda del mouse - solo permitir movimiento
    // El zoom se controla únicamente con los botones
  };

  // Función para manejar el click en la imagen cuando está en zoom
  const handleImageClick = () => {
    if (!currentImage) {
      return;
    }

    if (isZoomActive) {
      // Si está en zoom, salir del zoom
      setIsZoomActive(false);
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
      setImageStyle({});
    } else {
      // Si no está en zoom, activar el zoom del componente

      setIsZoomActive(true);
    }
  };

  // Funciones de arrastre
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isZoomActive || !currentImage) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isZoomActive) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setImagePosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Funciones de navegación con teclado
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isZoomActive) return;

    const step = 50; // Píxeles a mover por cada tecla
    let newX = imagePosition.x;
    let newY = imagePosition.y;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newY += step;
        break;
      case 'ArrowDown':
        e.preventDefault();
        newY -= step;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newX += step;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newX -= step;
        break;
      default:
        return;
    }

    setImagePosition({ x: newX, y: newY });
    setImageStyle({
      transform: `scale(${zoomLevel}) translate(${newX / zoomLevel}px, ${
        newY / zoomLevel
      }px)`,
      transition: 'transform 0.3s ease',
    });
  };

  // Agregar y remover event listener del teclado
  useEffect(() => {
    if (isZoomActive) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isZoomActive, imagePosition, zoomLevel]);

  // Funciones de navegación con botones
  const moveUp = () => {
    const newY = imagePosition.y + 50;
    setImagePosition({ ...imagePosition, y: newY });
    setImageStyle({
      transform: `scale(${zoomLevel}) translate(${
        imagePosition.x / zoomLevel
      }px, ${newY / zoomLevel}px)`,
      transition: 'transform 0.3s ease',
    });
  };

  const moveDown = () => {
    const newY = imagePosition.y - 50;
    setImagePosition({ ...imagePosition, y: newY });
    setImageStyle({
      transform: `scale(${zoomLevel}) translate(${
        imagePosition.x / zoomLevel
      }px, ${newY / zoomLevel}px)`,
      transition: 'transform 0.3s ease',
    });
  };

  const moveLeft = () => {
    const newX = imagePosition.x + 50;
    setImagePosition({ ...imagePosition, x: newX });
    setImageStyle({
      transform: `scale(${zoomLevel}) translate(${newX / zoomLevel}px, ${
        imagePosition.y / zoomLevel
      }px)`,
      transition: 'transform 0.3s ease',
    });
  };

  const moveRight = () => {
    const newX = imagePosition.x - 50;
    setImagePosition({ ...imagePosition, x: newX });
    setImageStyle({
      transform: `scale(${zoomLevel}) translate(${newX / zoomLevel}px, ${
        imagePosition.y / zoomLevel
      }px)`,
      transition: 'transform 0.3s ease',
    });
  };

  // Funciones de zoom adicional
  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 0.5, 4); // Máximo 4x zoom
    setZoomLevel(newZoom);
    setImageStyle({
      transform: `scale(${newZoom}) translate(${imagePosition.x / newZoom}px, ${
        imagePosition.y / newZoom
      }px)`,
      transition: 'transform 0.3s ease',
    });
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.5, 1); // Mínimo 1x zoom (nivel por defecto)
    setZoomLevel(newZoom);
    setImageStyle({
      transform: `scale(${newZoom}) translate(${imagePosition.x / newZoom}px, ${
        imagePosition.y / newZoom
      }px)`,
      transition: 'transform 0.3s ease',
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setImageStyle({
      transform: 'scale(1)',
      transition: 'transform 0.3s ease',
    });
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
              className='absolute top-4 right-4 z-50 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20'
              variant='flat'
              onPress={onClose}
            >
              <Icon icon='mdi:close' className='text-2xl' />
            </Button>

            {/* Zoom Controls - Solo mostrar cuando el zoom está activo */}
            {isZoomActive && (
              <>
                <div className='absolute top-4 left-4 z-50 flex gap-2'>
                  <Button
                    isIconOnly
                    className='bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 w-6 h-6 min-w-6 md:w-12 md:h-12 md:min-w-12'
                    variant='flat'
                    onPress={handleZoomIn}
                    isDisabled={zoomLevel >= 4}
                  >
                    <Icon icon='mdi:plus' className='text-sm md:text-xl' />
                  </Button>
                  <Button
                    isIconOnly
                    className='bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 w-6 h-6 min-w-6 md:w-12 md:h-12 md:min-w-12'
                    variant='flat'
                    onPress={handleZoomOut}
                    isDisabled={zoomLevel <= 1}
                  >
                    <Icon icon='mdi:minus' className='text-sm md:text-xl' />
                  </Button>
                  <Button
                    isIconOnly
                    className='bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 w-6 h-6 min-w-6 md:w-12 md:h-12 md:min-w-12'
                    variant='flat'
                    onPress={handleResetZoom}
                    isDisabled={zoomLevel === 1}
                  >
                    <Icon icon='mdi:refresh' className='text-sm md:text-xl' />
                  </Button>
                </div>

                {/* Zoom Level Indicator - Solo mostrar cuando el zoom está activo */}
                <div className='absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm border border-white/20'>
                  {Math.round(zoomLevel * 100)}%
                </div>

                {/* Navigation Controls - Solo mostrar cuando el zoom está activo */}
                <div className='absolute top-12 left-6 z-50 flex flex-col items-center gap-2 mt-2 md:top-16 md:mt-12'>
                  {/* Botón arriba */}
                  <Button
                    isIconOnly
                    className='bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 w-5 h-5 min-w-5 md:w-10 md:h-10 md:min-w-10'
                    variant='flat'
                    onPress={moveUp}
                    size='sm'
                  >
                    <Icon
                      icon='mdi:chevron-up'
                      className='text-xs md:text-lg'
                    />
                  </Button>

                  {/* Botones izquierda, centro, derecha */}
                  <div className='flex gap-1 md:gap-2'>
                    <Button
                      isIconOnly
                      className='bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 w-5 h-5 min-w-5 md:w-10 md:h-10 md:min-w-10'
                      variant='flat'
                      onPress={moveLeft}
                      size='sm'
                    >
                      <Icon
                        icon='mdi:chevron-left'
                        className='text-xs md:text-lg'
                      />
                    </Button>

                    <Button
                      isIconOnly
                      className='bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 w-5 h-5 min-w-5 md:w-10 md:h-10 md:min-w-10'
                      variant='flat'
                      onPress={handleResetZoom}
                      size='sm'
                    >
                      <Icon icon='mdi:refresh' className='text-xs md:text-lg' />
                    </Button>

                    <Button
                      isIconOnly
                      className='bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 w-5 h-5 min-w-5 md:w-10 md:h-10 md:min-w-10'
                      variant='flat'
                      onPress={moveRight}
                      size='sm'
                    >
                      <Icon
                        icon='mdi:chevron-right'
                        className='text-xs md:text-lg'
                      />
                    </Button>
                  </div>

                  {/* Botón abajo */}
                  <Button
                    isIconOnly
                    className='bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20 w-5 h-5 min-w-5 md:w-10 md:h-10 md:min-w-10'
                    variant='flat'
                    onPress={moveDown}
                    size='sm'
                  >
                    <Icon
                      icon='mdi:chevron-down'
                      className='text-xs md:text-lg'
                    />
                  </Button>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <Button
              isIconOnly
              className='absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20'
              variant='flat'
              onPress={handlePrevImage}
            >
              <Icon icon='mdi:chevron-left' className='text-2xl' />
            </Button>

            <Button
              isIconOnly
              className='absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20'
              variant='flat'
              onPress={handleNextImage}
            >
              <Icon icon='mdi:chevron-right' className='text-2xl' />
            </Button>

            {/* Main Image Container */}
            <div
              className='flex-1 flex items-center justify-center p-8 overflow-hidden'
              onWheel={handleWheel}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {currentImage ? (
                <div
                  onClick={handleImageClick}
                  onMouseDown={handleMouseDown}
                  className={`relative ${
                    isZoomActive ? 'cursor-move' : 'cursor-zoom-in'
                  } ${isDragging ? 'select-none' : ''}`}
                  style={isZoomActive ? imageStyle : {}}
                >
                  {isZoomActive ? (
                    <InnerImageZoom
                      src={currentImage}
                      zoomSrc={currentImage}
                      zoomType='hover'
                      className='h-[50vh] sm:h-[80vh] w-auto object-contain pointer-events-none'
                    />
                  ) : (
                    <Image
                      src={currentImage}
                      alt='Vehicle'
                      className='h-[50vh] sm:h-[80vh] w-auto object-contain'
                    />
                  )}
                </div>
              ) : (
                <div className='text-center text-gray-500'>
                  <p>No hay imagen disponible</p>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className='w-full bg-black/30 p-4'>
              <div className='flex justify-center gap-2 max-w-screen-lg mx-auto'>
                {images && images.length > 0 ? (
                  images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        console.log(
                          'VehicleImagesModal - Cambiando a imagen:',
                          image
                        );
                        onImageChange(image);
                        // Resetear zoom cuando se cambia de imagen
                        setIsZoomActive(false);
                        setZoomLevel(1);
                        setImagePosition({ x: 0, y: 0 });
                        setImageStyle({});
                      }}
                      onDoubleClick={() => {
                        // Doble click para activar zoom directamente
                        console.log(
                          'VehicleImagesModal - Doble click para zoom en:',
                          image
                        );
                        onImageChange(image);
                        setIsZoomActive(true);
                      }}
                      className={`w-20 h-full rounded-lg overflow-hidden cursor-pointer transition-all ${
                        currentImage === image
                          ? 'ring-2 ring-white opacity-100'
                          : 'opacity-50 hover:opacity-75'
                      }`}
                      title='Click para seleccionar, doble click para zoom'
                    >
                      <Image
                        alt={`Thumbnail ${index + 1}`}
                        className='w-full h-full object-cover'
                        src={image}
                      />
                    </div>
                  ))
                ) : (
                  <div className='text-center text-white'>
                    <p>No hay imágenes disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
