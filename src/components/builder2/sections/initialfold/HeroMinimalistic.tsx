'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { Element, useEditor } from '@craftjs/core';

interface HeroMinimalisticProps {
  title?: string;
  subtitle?: string;
  buttonText1?: string;
  buttonText2?: string;
  buttonLink1?: string;
  buttonLink2?: string;
  bgColor?: string;
  textColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonPaddingX?: string;
  buttonPaddingY?: string;
  carImageUrl?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

export const HeroMinimalistic = ({
  title = 'Descubre Tu Próximo Vehículo',
  subtitle = 'Explora nuestra selección premium de autos y encuentra el que se adapta a tu estilo de vida',
  buttonText1 = 'Ver vehículos',
  buttonText2 = 'Contactar',
  buttonLink1 = '#vehicles',
  buttonLink2 = '#contact',
  bgColor = '#ffffff',
  textColor = '#333333',
  buttonBgColor = '#e05d31',
  buttonTextColor = '#ffffff',
  buttonPaddingX = '1.5rem',
  buttonPaddingY = '0.5rem',
  carImageUrl = 'https://images.unsplash.com/photo-1493238792000-8113da705763?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
  titleAlignment = 'left',
  children,
}: HeroMinimalisticProps) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
    dragged: state.events.dragged,
  }));

  const scrollToSection = (sectionId: string) => {
    // En el modo editor, simplemente registramos que se ha hecho clic
    if (sectionId.startsWith('#')) {
      const targetId = sectionId.substring(1); // Remover el # inicial

      // Buscar por ID
      const section = document.getElementById(targetId);

      // Si no encuentra por ID, buscar por clase o por atributo data-section
      const alternativeSection =
        section ||
        document.querySelector(`[data-section="${targetId}"]`) ||
        document.querySelector(`.section-${targetId}`);

      if (alternativeSection) {
        alternativeSection.scrollIntoView({ behavior: 'smooth' });
        console.log(`Scrolling to section: ${targetId}`);
        return;
      }

      // Si no hemos encontrado la sección, intentamos buscar componentes con nombres similares
      const possibleSections = document.querySelectorAll(
        '[class*="vehicle"], [id*="vehicle"], [data-section*="vehicle"]'
      );
      if (possibleSections.length > 0) {
        possibleSections[0].scrollIntoView({ behavior: 'smooth' });
        console.log(`Scrolling to vehicle section via fuzzy match`);
        return;
      }

      console.log(
        `Section ${targetId} not found. This is normal in editor mode.`
      );
    } else {
      // Es una URL externa, navegamos a ella
      window.open(sectionId, '_blank');
    }
  };

  return (
    <div
      ref={(ref) => connect(ref as HTMLDivElement)}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
      }}
      className='w-full py-12 md:py-16 overflow-hidden '
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid md:grid-cols-2 gap-8 items-center'>
          <div className={`text-${titleAlignment}`}>
            <h1
              className='text-4xl md:text-5xl font-bold mb-4 leading-tight'
              style={{ color: textColor }}
            >
              {title}
            </h1>
            <p
              className='text-lg md:text-xl mb-8 max-w-lg'
              style={{ color: textColor, opacity: 0.9 }}
            >
              {subtitle}
            </p>
            <div className='flex flex-wrap gap-4'>
              <Button
                className='rounded-md font-medium text-base'
                style={{
                  backgroundColor: buttonBgColor,
                  color: buttonTextColor,
                  paddingLeft: buttonPaddingX,
                  paddingRight: buttonPaddingX,
                  paddingTop: buttonPaddingY,
                  paddingBottom: buttonPaddingY,
                }}
                onClick={() => scrollToSection(buttonLink1)}
              >
                {buttonText1}
              </Button>
              <Button
                className='rounded-md font-medium text-base border'
                variant='outline'
                style={{
                  borderColor: buttonBgColor,
                  color: buttonBgColor,
                  paddingLeft: buttonPaddingX,
                  paddingRight: buttonPaddingX,
                  paddingTop: buttonPaddingY,
                  paddingBottom: buttonPaddingY,
                }}
                onClick={() => scrollToSection(buttonLink2)}
              >
                {buttonText2}
              </Button>
            </div>
          </div>

          <div className='flex justify-center md:justify-end'>
            {carImageUrl && (
              <div className='relative rounded-lg overflow-hidden shadow-xl transform transition-transform hover:scale-105 duration-300'>
                <img
                  src={carImageUrl}
                  alt='Auto destacado'
                  className='w-full h-auto object-cover rounded-lg'
                  style={{ maxHeight: '400px' }}
                />
              </div>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

// Settings component for the editor
export const HeroMinimalisticSettings = () => {
  const {
    actions: { setProp },
    title,
    subtitle,
    buttonText1,
    buttonText2,
    buttonLink1,
    buttonLink2,
    bgColor,
    textColor,
    buttonBgColor,
    buttonTextColor,
    buttonPaddingX,
    buttonPaddingY,
    carImageUrl,
    titleAlignment,
  } = useNode((node) => ({
    title: node.data.props.title,
    subtitle: node.data.props.subtitle,
    buttonText1: node.data.props.buttonText1,
    buttonText2: node.data.props.buttonText2,
    buttonLink1: node.data.props.buttonLink1,
    buttonLink2: node.data.props.buttonLink2,
    bgColor: node.data.props.bgColor,
    textColor: node.data.props.textColor,
    buttonBgColor: node.data.props.buttonBgColor,
    buttonTextColor: node.data.props.buttonTextColor,
    buttonPaddingX: node.data.props.buttonPaddingX,
    buttonPaddingY: node.data.props.buttonPaddingY,
    carImageUrl: node.data.props.carImageUrl,
    titleAlignment: node.data.props.titleAlignment,
  }));

  return (
    <div className='space-y-4'>
      <div>
        <label className='text-sm font-medium mb-1 block'>Título</label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={title}
          onChange={(e) =>
            setProp((props: any) => (props.title = e.target.value))
          }
        />
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>Subtítulo</label>
        <textarea
          className='w-full p-2 border rounded text-sm'
          rows={3}
          value={subtitle}
          onChange={(e) =>
            setProp((props: any) => (props.subtitle = e.target.value))
          }
        />
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          Alineación del texto
        </label>
        <select
          className='w-full p-2 border rounded text-sm'
          value={titleAlignment}
          onChange={(e) =>
            setProp((props: any) => (props.titleAlignment = e.target.value))
          }
        >
          <option value='left'>Izquierda</option>
          <option value='center'>Centro</option>
          <option value='right'>Derecha</option>
        </select>
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>Texto Botón 1</label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={buttonText1}
          onChange={(e) =>
            setProp((props: any) => (props.buttonText1 = e.target.value))
          }
        />
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>Enlace Botón 1</label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={buttonLink1}
          onChange={(e) =>
            setProp((props: any) => (props.buttonLink1 = e.target.value))
          }
        />
        <p className='text-xs text-gray-500 mt-1'>
          Usa '#id' para enlazar a una sección en la página
        </p>
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>Texto Botón 2</label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={buttonText2}
          onChange={(e) =>
            setProp((props: any) => (props.buttonText2 = e.target.value))
          }
        />
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>Enlace Botón 2</label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={buttonLink2}
          onChange={(e) =>
            setProp((props: any) => (props.buttonLink2 = e.target.value))
          }
        />
        <p className='text-xs text-gray-500 mt-1'>
          Usa '#id' para enlazar a una sección en la página
        </p>
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          URL Imagen del Auto
        </label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={carImageUrl}
          onChange={(e) =>
            setProp((props: any) => (props.carImageUrl = e.target.value))
          }
        />
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>Color de fondo</label>
        <div className='flex items-center'>
          <input
            type='color'
            className='w-10 h-10 p-1 border rounded'
            value={bgColor}
            onChange={(e) =>
              setProp((props: any) => (props.bgColor = e.target.value))
            }
          />
          <input
            type='text'
            className='flex-1 p-2 border rounded text-sm ml-2'
            value={bgColor}
            onChange={(e) =>
              setProp((props: any) => (props.bgColor = e.target.value))
            }
          />
        </div>
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>Color de texto</label>
        <div className='flex items-center'>
          <input
            type='color'
            className='w-10 h-10 p-1 border rounded'
            value={textColor}
            onChange={(e) =>
              setProp((props: any) => (props.textColor = e.target.value))
            }
          />
          <input
            type='text'
            className='flex-1 p-2 border rounded text-sm ml-2'
            value={textColor}
            onChange={(e) =>
              setProp((props: any) => (props.textColor = e.target.value))
            }
          />
        </div>
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          Color de fondo del botón
        </label>
        <div className='flex items-center'>
          <input
            type='color'
            className='w-10 h-10 p-1 border rounded'
            value={buttonBgColor}
            onChange={(e) =>
              setProp((props: any) => (props.buttonBgColor = e.target.value))
            }
          />
          <input
            type='text'
            className='flex-1 p-2 border rounded text-sm ml-2'
            value={buttonBgColor}
            onChange={(e) =>
              setProp((props: any) => (props.buttonBgColor = e.target.value))
            }
          />
        </div>
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          Color de texto del botón
        </label>
        <div className='flex items-center'>
          <input
            type='color'
            className='w-10 h-10 p-1 border rounded'
            value={buttonTextColor}
            onChange={(e) =>
              setProp((props: any) => (props.buttonTextColor = e.target.value))
            }
          />
          <input
            type='text'
            className='flex-1 p-2 border rounded text-sm ml-2'
            value={buttonTextColor}
            onChange={(e) =>
              setProp((props: any) => (props.buttonTextColor = e.target.value))
            }
          />
        </div>
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          Padding horizontal del botón
        </label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={buttonPaddingX}
          onChange={(e) =>
            setProp((props: any) => (props.buttonPaddingX = e.target.value))
          }
        />
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          Padding vertical del botón
        </label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={buttonPaddingY}
          onChange={(e) =>
            setProp((props: any) => (props.buttonPaddingY = e.target.value))
          }
        />
      </div>
    </div>
  );
};

HeroMinimalistic.craft = {
  displayName: 'HeroMinimalistic',
  props: {
    title: 'Descubre Tu Próximo Vehículo',
    subtitle:
      'Explora nuestra selección premium de autos y encuentra el que se adapta a tu estilo de vida',
    buttonText1: 'Ver vehículos',
    buttonText2: 'Contactar',
    buttonLink1: '#vehicles',
    buttonLink2: '#contact',
    bgColor: '#ffffff',
    textColor: '#333333',
    buttonBgColor: '#e05d31',
    buttonTextColor: '#ffffff',
    buttonPaddingX: '1.5rem',
    buttonPaddingY: '0.5rem',
    carImageUrl:
      'https://images.unsplash.com/photo-1493238792000-8113da705763?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    titleAlignment: 'left',
  },
  related: {
    settings: HeroMinimalisticSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
  isCanvas: true,
};
