import React, { forwardRef } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Button } from '@heroui/react';

interface HeroBasicProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  bgColor?: string;
  textColor?: string;
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
      bgColor = '#f8f9fa',
      textColor = '#333333',
      alignment = 'center',
    }: HeroBasicProps,
    ref
  ) => {
    const { connectors, selected } = useNode((state) => ({
      selected: state.events.selected,
    }));

    const textAlignClass = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    }[alignment];

    return (
      <div
        ref={(node) => {
          if (node) {
            connectors.connect(node);
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
          <Button className='px-8 py-3 text-white rounded-md bg-blue-600 hover:bg-blue-700 transition-colors'>
            <a href={buttonLink}>{buttonText}</a>
          </Button>
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
    bgColor: '#f8f9fa',
    textColor: '#333333',
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
