import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { normalizeBuilderLink } from '@/utils/functions';

interface HeroWithCardProps {
  title?: string;
  subtitle?: string;
  cardTitle?: string;
  cardDescription?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  cardPosition?: 'left' | 'right';
  cardBackground?: string;
  cardTextColor?: string;
  children?: React.ReactNode;
}

export const HeroWithCard = ({
  title = 'GoAuto - Tu mejor opción',
  subtitle = 'Encuentra el vehículo perfecto para ti',
  cardTitle = 'Financiamiento disponible',
  cardDescription = 'Ofrecemos las mejores opciones de financiamiento adaptadas a tus necesidades. Aprobación rápida y tasas competitivas.',
  buttonText = 'Solicitar ahora',
  buttonLink = '/financiamiento',
  backgroundImage = 'https://images.unsplash.com/photo-1583267746897-2cf415887172?q=80&w=1470',
  overlayColor = '#000000',
  overlayOpacity = 0.6,
  textColor = '#ffffff',
  cardPosition = 'right',
  cardBackground = '#ffffff',
  cardTextColor = '#333333',
  children,
}: HeroWithCardProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { isEnabled } = useEditor((state) => ({
    isEnabled: state.options.enabled,
  }));

  const overlayStyle = {
    backgroundColor: overlayColor,
    opacity: overlayOpacity,
  };

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        color: textColor,
        border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
      }}
      className='w-full min-h-[600px] flex items-center'
    >
      <div style={overlayStyle} className='absolute inset-0 z-0' />
      <div className='container mx-auto px-4 z-10 relative py-12'>
        <div className={`flex flex-col lg:flex-row items-center ${cardPosition === 'left' ? 'lg:flex-row-reverse' : ''} gap-8`}>
          <div className='lg:w-1/2 space-y-6'>
            <h1 style={{ color: textColor }} className='text-4xl md:text-5xl font-bold'
              dangerouslySetInnerHTML={{ __html: title || '' }} />
            <p style={{ color: textColor }} className='text-lg md:text-xl'
              dangerouslySetInnerHTML={{ __html: subtitle || '' }} />
          </div>
          <div className='lg:w-1/2'>
            <div style={{ backgroundColor: cardBackground, color: cardTextColor }} className='rounded-lg shadow-lg p-8'>
              <h3 className='text-2xl font-bold mb-4' dangerouslySetInnerHTML={{ __html: cardTitle || '' }} />
              <p className='mb-6' dangerouslySetInnerHTML={{ __html: cardDescription || '' }} />
              <Button asChild className='px-6 py-2 text-white rounded-md bg-blue-600 hover:bg-blue-700 transition-colors'>
                <a href={isEnabled ? '#' : normalizeBuilderLink(buttonLink)} dangerouslySetInnerHTML={{ __html: buttonText || '' }} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

HeroWithCard.craft = {
  displayName: 'HeroWithCard',
  props: {
    title: 'GoAuto - Tu mejor opción',
    subtitle: 'Encuentra el vehículo perfecto para ti',
    cardTitle: 'Financiamiento disponible',
    cardDescription: 'Ofrecemos las mejores opciones de financiamiento adaptadas a tus necesidades. Aprobación rápida y tasas competitivas.',
    buttonText: 'Solicitar ahora',
    buttonLink: '/financiamiento',
    backgroundImage: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?q=80&w=1470',
    overlayColor: '#000000',
    overlayOpacity: 0.6,
    textColor: '#ffffff',
    cardPosition: 'right',
    cardBackground: '#ffffff',
    cardTextColor: '#333333',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
  isCanvas: true,
};
