import React, { forwardRef } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Button } from '@/components/ui/button';

interface HeroBasicProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonTextSecondary?: string;
  buttonLinkSecondary?: string;
  bgColor?: string;
  textColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonSecondaryBgColor?: string;
  buttonSecondaryTextColor?: string;
  alignment?: 'left' | 'center' | 'right';
}

interface CraftComponent {
  craft: {
    displayName: string;
    props: Record<string, any>;
    related?: {
      toolbar?: React.ComponentType<any>;
    };
    rules?: {
      canDrag: () => boolean;
      canDrop: () => boolean;
      canMoveIn: () => boolean;
    };
    isCanvas?: boolean;
  };
}

// Remove the internal settings component as we now have an external one
const HeroBasicComponent = forwardRef<HTMLDivElement, HeroBasicProps>(
  (
    {
      title = 'Encuentra el auto ideal para ti',
      subtitle = 'Amplio catálogo de vehículos seminuevos certificados con garantía y financiamiento a tu medida',
      buttonText = 'Ver catálogo',
      buttonLink = '/catalogo',
      buttonTextSecondary = 'Contactar',
      buttonLinkSecondary = '#contact',
      bgColor = '#f8f9fa',
      textColor = '#333333',
      buttonBgColor = '#3b82f6',
      buttonTextColor = '#ffffff',
      buttonSecondaryBgColor = 'transparent',
      buttonSecondaryTextColor = '#3b82f6',
      alignment = 'center',
    }: HeroBasicProps,
    ref
  ) => {
    let connectors, selected;

    try {
      const nodeData = useNode((state) => ({
        selected: state.events.selected,
      }));
      connectors = nodeData.connectors;
      selected = nodeData.selected;
    } catch (error) {
      // Si no estamos en el contexto de CraftJS, usar valores por defecto
      connectors = { connect: null };
      selected = false;
    }

    const textAlignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }[alignment];

    return (
      <div
        ref={(node) => {
          if (node) {
            connectors?.connect?.(node);
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }
        }}
        style={{
          background: bgColor,
          color: textColor,
          padding: '50px 0',
          position: 'relative',
          border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
        }}
        className='w-full'
      >
        <div className={`max-w-5xl mx-auto ${textAlignClass}`}>
          <h1
            style={{ color: textColor }}
            className='text-4xl md:text-5xl font-bold mb-6'
          >
            {title}
          </h1>
          <p
            style={{ color: textColor }}
            className='text-lg md:text-xl mb-8 max-w-2xl mx-auto'
          >
            {subtitle}
          </p>
          <div className='flex flex-wrap gap-4 justify-center'>
            <Button
              className='px-8 py-3 rounded-md transition-colors'
              style={{
                backgroundColor: buttonBgColor,
                color: buttonTextColor,
              }}
            >
              <a
                href={buttonLink}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {buttonText}
              </a>
            </Button>
            <Button
              className='px-8 py-3 rounded-md border transition-colors'
              variant='outline'
              style={{
                backgroundColor: buttonSecondaryBgColor,
                color: buttonSecondaryTextColor,
                borderColor: buttonSecondaryTextColor,
              }}
            >
              <a
                href={buttonLinkSecondary}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {buttonTextSecondary}
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

HeroBasicComponent.displayName = 'HeroBasic';

(HeroBasicComponent as unknown as CraftComponent).craft = {
  displayName: 'HeroBasic',
  props: {
    title: 'Encuentra el auto ideal para ti',
    subtitle:
      'Amplio catálogo de vehículos seminuevos certificados con garantía y financiamiento a tu medida',
    buttonText: 'Ver catálogo',
    buttonLink: '/catalogo',
    buttonTextSecondary: 'Contactar',
    buttonLinkSecondary: '#contact',
    bgColor: '#f8f9fa',
    textColor: '#333333',
    buttonBgColor: '#3b82f6',
    buttonTextColor: '#ffffff',
    buttonSecondaryBgColor: 'transparent',
    buttonSecondaryTextColor: '#3b82f6',
    alignment: 'center',
  },
  related: {
    // Remove settings reference as we'll use the external component instead
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};

export const HeroBasic = HeroBasicComponent as typeof HeroBasicComponent &
  CraftComponent;
