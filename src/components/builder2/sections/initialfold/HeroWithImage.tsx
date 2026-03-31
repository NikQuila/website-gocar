import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { normalizeBuilderLink } from '@/utils/functions';

interface HeroWithImageProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  imageSrc?: string;
  bgColor?: string;
  textColor?: string;
  imagePosition?: 'left' | 'right';
}

export const HeroWithImage = ({
  title = 'Financiamiento a tu medida',
  subtitle = 'Obtén tu auto seminuevo con opciones de financiamiento accesibles y aprobación rápida',
  buttonText = 'Ver opciones',
  buttonLink = '/financiamiento',
  imageSrc = 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=800',
  bgColor = '#ffffff',
  textColor = '#333333',
  imagePosition = 'right',
}: HeroWithImageProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { isEnabled } = useEditor((state) => ({
    isEnabled: state.options.enabled,
  }));

  const isImageRight = imagePosition === 'right';

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      style={{
        background: bgColor,
        color: textColor,
        padding: '40px 20px',
        position: 'relative',
        border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
      }}
      className='w-full'
    >
      <div className='max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center'>
        {!isImageRight && (
          <div className='h-full'>
            <img
              src={imageSrc}
              alt='GoAuto'
              className='rounded-lg shadow-md w-full h-full object-cover'
              style={{ maxHeight: '400px' }}
            />
          </div>
        )}

        <div className={`text-${isImageRight ? 'left' : 'right'}`}>
          <h1
            style={{ color: textColor }}
            className='text-3xl md:text-4xl font-bold mb-4'
            dangerouslySetInnerHTML={{ __html: title || '' }}
          />
          <p style={{ color: textColor }} className='text-base md:text-lg mb-6'
            dangerouslySetInnerHTML={{ __html: subtitle || '' }}
          />
          <Button
            asChild
            className='px-6 py-2 text-white rounded-md bg-blue-600 hover:bg-blue-700 transition-colors'
          >
            <a href={isEnabled ? '#' : normalizeBuilderLink(buttonLink)}
              dangerouslySetInnerHTML={{ __html: buttonText || '' }} />
          </Button>
        </div>

        {isImageRight && (
          <div className='h-full'>
            <img
              src={imageSrc}
              alt='GoAuto'
              className='rounded-lg shadow-md w-full h-full object-cover'
              style={{ maxHeight: '400px' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

HeroWithImage.craft = {
  displayName: 'Hero con Imagen',
  props: {
    title: 'Financiamiento a tu medida',
    subtitle: 'Obtén tu auto seminuevo con opciones de financiamiento accesibles y aprobación rápida',
    buttonText: 'Ver opciones',
    buttonLink: '/financiamiento',
    imageSrc: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=800',
    bgColor: '#ffffff',
    textColor: '#333333',
    imagePosition: 'right',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
  isCanvas: true,
};
