import React, { forwardRef } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Button } from '@heroui/react';

interface HeroWithBackgroundProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  textAlignment?: 'left' | 'center' | 'right';
  height?: string;
  children?: React.ReactNode;
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

const HeroWithBackgroundComponent = forwardRef<
  HTMLDivElement,
  HeroWithBackgroundProps
>(
  (
    {
      title = 'Encuentra tu próximo auto',
      subtitle = 'Amplio inventario de autos seminuevos verificados y con garantía',
      buttonText = 'Ver inventario',
      buttonLink = '/inventario',
      backgroundImage = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1470',
      overlayColor = '#000000',
      overlayOpacity = 0.5,
      textColor = '#ffffff',
      textAlignment = 'center',
      height = '500px',
      children,
    }: HeroWithBackgroundProps,
    ref
  ) => {
    const { connectors, selected } = useNode((state) => ({
      selected: state.events.selected,
    }));

    const overlayStyle = {
      backgroundColor: overlayColor,
      opacity: overlayOpacity,
    };

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
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height,
          position: 'relative',
          color: textColor,
          border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
        }}
        className='w-full flex items-center'
      >
        {/* Overlay */}
        <div style={overlayStyle} className='absolute inset-0 z-0' />

        {/* Content */}
        <div className='container mx-auto px-4 z-10 relative'>
          <div
            className={`max-w-3xl mx-auto text-${textAlignment}`}
            style={{ margin: textAlignment === 'center' ? '0 auto' : '0' }}
          >
            <h1
              style={{ color: textColor }}
              className='text-4xl md:text-5xl font-bold mb-4'
            >
              {title}
            </h1>
            <p style={{ color: textColor }} className='text-lg md:text-xl mb-8'>
              {subtitle}
            </p>
            <Button className='px-8 py-3 text-white rounded-md bg-blue-600 hover:bg-blue-700 transition-colors'>
              <a href={buttonLink}>{buttonText}</a>
            </Button>

            {children}
          </div>
        </div>
      </div>
    );
  }
);

HeroWithBackgroundComponent.displayName = 'HeroWithBackground';

const HeroWithBackgroundSettings = () => {
  const { actions, selected } = useEditor((state) => {
    const currentNodeId = state.events.selected;
    let selectedNode = null;

    if (currentNodeId) {
      const nodeId = Array.from(currentNodeId as Set<string>)[0];
      if (nodeId && state.nodes[nodeId]) {
        selectedNode = {
          id: nodeId,
          data: state.nodes[nodeId].data,
          props: state.nodes[nodeId].data.props,
        };
      }
    }

    return {
      selected: selectedNode,
    };
  });

  if (!selected) return null;

  return (
    <div className='space-y-4'>
      <div>
        <label className='text-sm font-medium mb-1 block'>Título</label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={selected.props.title || ''}
          onChange={(e) => {
            actions.setProp(selected.id, (props: any) => {
              props.title = e.target.value;
            });
          }}
        />
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>Subtítulo</label>
        <textarea
          className='w-full p-2 border rounded text-sm'
          rows={3}
          value={selected.props.subtitle || ''}
          onChange={(e) => {
            actions.setProp(selected.id, (props: any) => {
              props.subtitle = e.target.value;
            });
          }}
        />
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          Texto del botón
        </label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={selected.props.buttonText || ''}
          onChange={(e) => {
            actions.setProp(selected.id, (props: any) => {
              props.buttonText = e.target.value;
            });
          }}
        />
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          Enlace del botón
        </label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={selected.props.buttonLink || ''}
          onChange={(e) => {
            actions.setProp(selected.id, (props: any) => {
              props.buttonLink = e.target.value;
            });
          }}
        />
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          URL de imagen de fondo
        </label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={selected.props.backgroundImage || ''}
          onChange={(e) => {
            actions.setProp(selected.id, (props: any) => {
              props.backgroundImage = e.target.value;
            });
          }}
        />
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          Color de superposición
        </label>
        <div className='flex items-center'>
          <input
            type='color'
            className='w-10 h-10 p-1 border rounded'
            value={selected.props.overlayColor || '#000000'}
            onChange={(e) => {
              actions.setProp(selected.id, (props: any) => {
                props.overlayColor = e.target.value;
              });
            }}
          />
          <input
            type='text'
            className='flex-1 p-2 border rounded text-sm ml-2'
            value={selected.props.overlayColor || '#000000'}
            onChange={(e) => {
              actions.setProp(selected.id, (props: any) => {
                props.overlayColor = e.target.value;
              });
            }}
          />
        </div>
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          Opacidad de superposición
        </label>
        <div className='flex items-center space-x-2'>
          <input
            type='range'
            min='0'
            max='1'
            step='0.1'
            className='flex-1'
            value={selected.props.overlayOpacity || 0.5}
            onChange={(e) => {
              actions.setProp(selected.id, (props: any) => {
                props.overlayOpacity = parseFloat(e.target.value);
              });
            }}
          />
          <span className='w-10 text-center'>
            {(selected.props.overlayOpacity || 0.5) * 100}%
          </span>
        </div>
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          Color del texto
        </label>
        <div className='flex items-center'>
          <input
            type='color'
            className='w-10 h-10 p-1 border rounded'
            value={selected.props.textColor || '#ffffff'}
            onChange={(e) => {
              actions.setProp(selected.id, (props: any) => {
                props.textColor = e.target.value;
              });
            }}
          />
          <input
            type='text'
            className='flex-1 p-2 border rounded text-sm ml-2'
            value={selected.props.textColor || '#ffffff'}
            onChange={(e) => {
              actions.setProp(selected.id, (props: any) => {
                props.textColor = e.target.value;
              });
            }}
          />
        </div>
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>
          Alineación del texto
        </label>
        <select
          className='w-full p-2 border rounded text-sm'
          value={selected.props.textAlignment || 'center'}
          onChange={(e) => {
            actions.setProp(selected.id, (props: any) => {
              props.textAlignment = e.target.value;
            });
          }}
        >
          <option value='left'>Izquierda</option>
          <option value='center'>Centro</option>
          <option value='right'>Derecha</option>
        </select>
      </div>
      <div>
        <label className='text-sm font-medium mb-1 block'>Altura</label>
        <input
          type='text'
          className='w-full p-2 border rounded text-sm'
          value={selected.props.height || '500px'}
          onChange={(e) => {
            actions.setProp(selected.id, (props: any) => {
              props.height = e.target.value;
            });
          }}
        />
      </div>
    </div>
  );
};

(HeroWithBackgroundComponent as unknown as CraftComponent).craft = {
  displayName: 'HeroWithBackground',
  props: {
    title: 'Encuentra tu próximo auto',
    subtitle:
      'Amplio inventario de autos seminuevos verificados y con garantía',
    buttonText: 'Ver inventario',
    buttonLink: '/inventario',
    backgroundImage:
      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1470',
    overlayColor: '#000000',
    overlayOpacity: 0.5,
    textColor: '#ffffff',
    textAlignment: 'center',
    height: '500px',
  },
  related: {
    toolbar: HeroWithBackgroundSettings,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
  isCanvas: true,
};

export const HeroWithBackground =
  HeroWithBackgroundComponent as typeof HeroWithBackgroundComponent &
    CraftComponent;
export { HeroWithBackgroundSettings };
