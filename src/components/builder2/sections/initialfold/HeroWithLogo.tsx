import React, { useState, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
// DeleteButton component not available

interface HeroWithLogoProps {
  backgroundImage?: string;
  backgroundImage2?: string;
  backgroundImage3?: string;
  backgroundImage4?: string;
  logoUrl?: string;
  logoText?: string;
  logoScale?: number;
  buttonText?: string;
  buttonLink?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonBorderWidth?: number;
  buttonBorderRadius?: number;
  buttonIsCircular?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  height?: string;
  children?: React.ReactNode;
}

export const HeroWithLogo = ({
  backgroundImage = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1470',
  backgroundImage2 = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1470',
  backgroundImage3 = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1470',
  backgroundImage4 = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1470',
  logoUrl = '',
  logoText = 'Automotora',
  logoScale = 1,
  buttonText = 'Ver Stock Completo',
  buttonLink = '/vehicles',
  buttonBgColor = '#e05d31',
  buttonTextColor = '#ffffff',
  buttonBorderColor = '#000000',
  buttonBorderWidth = 0,
  buttonBorderRadius = 8,
  buttonIsCircular = 'false',
  overlayColor = '#000000',
  overlayOpacity = 0.3,
  height = '600px',
  children,
}: HeroWithLogoProps) => {
  const { connectors, selected, id } = useNode((state) => ({
    selected: state.events.selected,
    id: state.id,
  }));

  // Detectar si estamos en modo editor
  const { isEnabled } = useEditor((state) => ({
    isEnabled: state.options.enabled,
  }));

  // Router para navegación
  const router = useRouter();

  // Estado para el carrusel de imágenes
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Array de imágenes
  const images = [
    backgroundImage,
    backgroundImage2,
    backgroundImage3,
    backgroundImage4,
  ].filter(Boolean);

  // Efecto para el carrusel y zoom
  useEffect(() => {
    if (images.length <= 1) return; // No animar si solo hay una imagen

    let startTime: number | undefined;
    let animationFrameId: number | undefined;

    const animateZoom = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / 4500, 1); // 4.5 segundos = 4500ms

      // Zoom muy lento de 1.0 a 1.15 en 4.5 segundos
      const currentZoom = 1 + progress * 0.15; // Zoom máximo de 1.15x
      setZoomLevel(currentZoom);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateZoom);
      }
    };

    const startAnimation = () => {
      // Resetear zoom al inicio
      setZoomLevel(1);
      startTime = undefined;
      animationFrameId = requestAnimationFrame(animateZoom);
    };

    // Iniciar la primera animación
    startAnimation();

    // Cambiar imagen cada 4.5 segundos
    const interval = setInterval(() => {
      // Iniciar transición
      setIsTransitioning(true);

      setTimeout(() => {
        // Cambiar imagen después del fade out
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);

        // Finalizar transición y reiniciar animación
        setTimeout(() => {
          setIsTransitioning(false);
          startAnimation(); // Reiniciar el zoom
        }, 100);
      }, 300); // Fade out más rápido
    }, 4500); // Cambiar cada 4.5 segundos

    return () => {
      clearInterval(interval);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [images.length]);

  const overlayStyle = {
    backgroundColor: overlayColor,
    opacity: overlayOpacity,
  };

  // Function to navigate to vehicles page - solo se ejecuta fuera del editor
  const navigateToVehicles = () => {
    if (isEnabled) return; // No navegar en modo editor

    // Si el botón tiene un link personalizado, usarlo; sino usar /vehicles por defecto
    const targetUrl = buttonLink || '/vehicles';

    // Si es un hash (#), hacer scroll; si es una ruta (/), navegar
    if (targetUrl.startsWith('#')) {
      const elementId = targetUrl.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <div
      ref={(ref) => connectors.connect(ref as any)}
      style={{
        height,
        position: 'relative',
        overflow: 'hidden',
        border: selected ? '2px dashed #1e88e5' : 'none',
      }}
      className='w-full flex items-center justify-center'
    >
      {/* Botón de eliminar */}
      {/* {selected && <DeleteButton nodeId={id} />} */}
      {/* Background Image Container with Zoom Effect */}
      <div
        style={{
          backgroundImage: `url(${
            images[currentImageIndex] || backgroundImage
          })`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(${zoomLevel})`,
          transition: 'transform 0.1s ease-out, opacity 0.5s ease-in-out',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          opacity: isTransitioning ? 0.3 : 1,
        }}
      />

      {/* Overlay */}
      <div style={overlayStyle} className='absolute inset-0 z-0' />

      {/* Content */}
      <div className='w-full z-10 relative flex flex-col items-center justify-center h-full'>
        <div className='text-center'>
          {/* Logo */}
          <div className='mb-8'>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={logoText}
                className='mx-auto max-h-32 max-w-full object-contain'
                style={{
                  transform: `scale(${logoScale})`,
                  transition: 'transform 0.3s ease-in-out',
                }}
              />
            ) : (
              <h1
                className='text-6xl md:text-7xl font-bold text-white mb-2'
                style={{
                  transform: `scale(${logoScale})`,
                  transition: 'transform 0.3s ease-in-out',
                }}
              >
                {logoText}
              </h1>
            )}
          </div>

          {/* Botón */}
          <div className='flex justify-center'>
            <Button
              className={`px-8 py-3 transition-colors text-lg font-medium ${
                buttonIsCircular === 'true' ? 'rounded-full' : ''
              }`}
              style={{
                backgroundColor: buttonBgColor,
                color: buttonTextColor,
                borderColor: buttonBorderColor,
                borderWidth: `${buttonBorderWidth}px`,
                borderStyle: buttonBorderWidth > 0 ? 'solid' : 'none',
                borderRadius:
                  buttonIsCircular === 'true'
                    ? '50%'
                    : `${buttonBorderRadius}px`,
              }}
              onClick={navigateToVehicles}
            >
              {buttonText}
            </Button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

const HeroWithLogoSettings = () => {
  const {
    actions: { setProp },
    backgroundImage,
    backgroundImage2,
    backgroundImage3,
    backgroundImage4,
    logoUrl,
    logoText,
    logoScale,
    buttonText,
    buttonLink,
    buttonBgColor,
    buttonTextColor,
    buttonBorderColor,
    buttonBorderWidth,
    buttonBorderRadius,
    buttonIsCircular,
    overlayColor,
    overlayOpacity,
    height,
  } = useNode((node) => ({
    backgroundImage: node.data.props.backgroundImage,
    backgroundImage2: node.data.props.backgroundImage2,
    backgroundImage3: node.data.props.backgroundImage3,
    backgroundImage4: node.data.props.backgroundImage4,
    logoUrl: node.data.props.logoUrl,
    logoText: node.data.props.logoText,
    logoScale: node.data.props.logoScale,
    buttonText: node.data.props.buttonText,
    buttonLink: node.data.props.buttonLink,
    buttonBgColor: node.data.props.buttonBgColor,
    buttonTextColor: node.data.props.buttonTextColor,
    buttonBorderColor: node.data.props.buttonBorderColor,
    buttonBorderWidth: node.data.props.buttonBorderWidth,
    buttonBorderRadius: node.data.props.buttonBorderRadius,
    buttonIsCircular: node.data.props.buttonIsCircular,
    overlayColor: node.data.props.overlayColor,
    overlayOpacity: node.data.props.overlayOpacity,
    height: node.data.props.height,
  }));

  // Función para manejar la selección de archivos
  const handleFileSelect = (propertyName: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setProp((props: any) => {
            props[propertyName] = result;
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className='space-y-4'>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          Imagen de fondo 1
        </label>
        <div className='flex gap-2'>
          <input
            type='url'
            className='flex-1 p-2 border rounded text-sm'
            placeholder='URL de la imagen de fondo'
            value={backgroundImage || ''}
            onChange={(e) => {
              setProp((props: any) => {
                props.backgroundImage = e.target.value;
              });
            }}
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => handleFileSelect('backgroundImage')}
            className='flex items-center gap-2'
          >
            <ImageIcon className='h-4 w-4' />
            Seleccionar archivo
          </Button>
        </div>
      </div>

      <div>
        <label className='text-sm font-medium mb-1 block'>
          Imagen de fondo 2
        </label>
        <div className='flex gap-2'>
          <input
            type='url'
            className='flex-1 p-2 border rounded text-sm'
            placeholder='URL de la imagen de fondo'
            value={backgroundImage2 || ''}
            onChange={(e) => {
              setProp((props: any) => {
                props.backgroundImage2 = e.target.value;
              });
            }}
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => handleFileSelect('backgroundImage2')}
            className='flex items-center gap-2'
          >
            <ImageIcon className='h-4 w-4' />
            Seleccionar archivo
          </Button>
        </div>
      </div>

      <div>
        <label className='text-sm font-medium mb-1 block'>
          Imagen de fondo 3
        </label>
        <div className='flex gap-2'>
          <input
            type='url'
            className='flex-1 p-2 border rounded text-sm'
            placeholder='URL de la imagen de fondo'
            value={backgroundImage3 || ''}
            onChange={(e) => {
              setProp((props: any) => {
                props.backgroundImage3 = e.target.value;
              });
            }}
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => handleFileSelect('backgroundImage3')}
            className='flex items-center gap-2'
          >
            <ImageIcon className='h-4 w-4' />
            Seleccionar archivo
          </Button>
        </div>
      </div>

      <div>
        <label className='text-sm font-medium mb-1 block'>
          Imagen de fondo 4
        </label>
        <div className='flex gap-2'>
          <input
            type='url'
            className='flex-1 p-2 border rounded text-sm'
            placeholder='URL de la imagen de fondo'
            value={backgroundImage4 || ''}
            onChange={(e) => {
              setProp((props: any) => {
                props.backgroundImage4 = e.target.value;
              });
            }}
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => handleFileSelect('backgroundImage4')}
            className='flex items-center gap-2'
          >
            <ImageIcon className='h-4 w-4' />
            Seleccionar archivo
          </Button>
        </div>
      </div>

      <div>
        <label className='text-sm font-medium mb-1 block'>Logo (URL)</label>
        <input
          type='url'
          className='w-full p-2 border rounded text-sm'
          placeholder='URL del logo (opcional)'
          value={logoUrl || ''}
          onChange={(e) => {
            setProp((props: any) => {
              props.logoUrl = e.target.value;
            });
          }}
        />
        {logoUrl && (
          <div className='mt-2 flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded'>
            <span className='text-sm text-red-700'>Logo configurado</span>
            <button
              onClick={() => {
                setProp((props: any) => {
                  props.logoUrl = '';
                });
              }}
              className='text-red-600 hover:text-red-800 font-bold'
            >
              Limpiar Logo
            </button>
          </div>
        )}
      </div>

      <div>
        <label className='text-sm font-medium mb-1 block'>Texto del logo</label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          placeholder='Texto del logo'
          value={logoText || ''}
          onChange={(e) => {
            setProp((props: any) => {
              props.logoText = e.target.value;
            });
          }}
        />
      </div>

      <div>
        <label className='text-sm font-medium mb-1 block'>
          Tamaño del logo ({Math.round((logoScale || 1) * 100)}%)
        </label>
        <input
          type='range'
          min='0.5'
          max='2'
          step='0.1'
          className='w-full'
          value={logoScale || 1}
          onChange={(e) => {
            setProp((props: any) => {
              props.logoScale = parseFloat(e.target.value);
            });
          }}
        />
        <div className='flex justify-between text-xs text-gray-500 mt-1'>
          <span>50%</span>
          <span>100%</span>
          <span>200%</span>
        </div>
      </div>

      <div className='pt-2 border-t'>
        <label className='text-sm font-medium mb-1 block'>
          Texto del botón
        </label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={buttonText || ''}
          onChange={(e) => {
            setProp((props: any) => {
              props.buttonText = e.target.value;
            });
          }}
        />
      </div>

      <div>
        <label className='text-sm font-medium mb-1 block'>Link del botón</label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={buttonLink || ''}
          onChange={(e) => {
            setProp((props: any) => {
              props.buttonLink = e.target.value;
            });
          }}
        />
      </div>

      <div className='pt-2 border-t'>
        <label className='text-sm font-medium mb-1 block'>
          Color del botón
        </label>
        <div className='flex gap-2'>
          <input
            type='color'
            className='w-12 h-8 border rounded'
            value={buttonBgColor || '#1e3a8a'}
            onChange={(e) => {
              setProp((props: any) => {
                props.buttonBgColor = e.target.value;
              });
            }}
          />
          <input
            type='text'
            className='flex-1 p-2 border rounded text-sm'
            value={buttonBgColor || '#1e3a8a'}
            onChange={(e) => {
              setProp((props: any) => {
                props.buttonBgColor = e.target.value;
              });
            }}
          />
        </div>
      </div>

      <div>
        <label className='text-sm font-medium mb-1 block'>
          Color del texto del botón
        </label>
        <div className='flex gap-2'>
          <input
            type='color'
            className='w-12 h-8 border rounded'
            value={buttonTextColor || '#ffffff'}
            onChange={(e) => {
              setProp((props: any) => {
                props.buttonTextColor = e.target.value;
              });
            }}
          />
          <input
            type='text'
            className='flex-1 p-2 border rounded text-sm'
            value={buttonTextColor || '#ffffff'}
            onChange={(e) => {
              setProp((props: any) => {
                props.buttonTextColor = e.target.value;
              });
            }}
          />
        </div>
      </div>

      <div className='pt-2 border-t'>
        <label className='text-sm font-medium mb-1 block'>
          Color del overlay
        </label>
        <div className='flex gap-2'>
          <input
            type='color'
            className='w-12 h-8 border rounded'
            value={overlayColor || '#000000'}
            onChange={(e) => {
              setProp((props: any) => {
                props.overlayColor = e.target.value;
              });
            }}
          />
          <input
            type='text'
            className='flex-1 p-2 border rounded text-sm'
            value={overlayColor || '#000000'}
            onChange={(e) => {
              setProp((props: any) => {
                props.overlayColor = e.target.value;
              });
            }}
          />
        </div>
      </div>

      <div>
        <label className='text-sm font-medium mb-1 block'>
          Opacidad del overlay ({Math.round((overlayOpacity || 0.3) * 100)}%)
        </label>
        <input
          type='range'
          min='0'
          max='1'
          step='0.1'
          className='w-full'
          value={overlayOpacity || 0.3}
          onChange={(e) => {
            setProp((props: any) => {
              props.overlayOpacity = parseFloat(e.target.value);
            });
          }}
        />
      </div>

      <div>
        <label className='text-sm font-medium mb-1 block'>Altura (px)</label>
        <input
          type='number'
          className='w-full p-2 border rounded text-sm'
          value={parseInt(height?.replace('px', '') || '600')}
          onChange={(e) => {
            setProp((props: any) => {
              props.height = `${e.target.value}px`;
            });
          }}
        />
      </div>
    </div>
  );
};

HeroWithLogo.craft = {
  displayName: 'HeroWithLogo',
  props: {
    backgroundImage:
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1470',
    backgroundImage2:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1470',
    backgroundImage3:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1470',
    backgroundImage4:
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1470',
    logoUrl: '',
    logoText: 'Automotora',
    logoScale: 1,
    buttonText: 'Ver Stock Completo',
    buttonLink: '/vehicles',
    buttonBgColor: '#e05d31',
    buttonTextColor: '#ffffff',
    buttonBorderColor: '#000000',
    buttonBorderWidth: 0,
    buttonBorderRadius: 8,
    buttonIsCircular: 'false',
    overlayColor: '#000000',
    overlayOpacity: 0.3,
    height: '600px',
  },
  related: {
    settings: HeroWithLogoSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};

export { HeroWithLogoSettings };
