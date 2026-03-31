import React from 'react';
import { useNode } from '@craftjs/core';

interface HeroCarSearchProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  searchButtonColor?: string;
  searchBoxBackground?: string;
  searchBoxTextColor?: string;
  showMakeModel?: boolean;
  showPrice?: boolean;
  showYear?: boolean;
  buttonText?: string;
}

export const HeroCarSearch = ({
  title = 'Encuentra tu auto ideal',
  subtitle = 'Busca entre miles de vehículos disponibles',
  backgroundImage = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1470',
  overlayColor = '#000000',
  overlayOpacity = 0.5,
  textColor = '#ffffff',
  searchButtonColor = '#3b82f6',
  searchBoxBackground = '#ffffff',
  searchBoxTextColor = '#333333',
  showMakeModel = true,
  showPrice = true,
  showYear = true,
  buttonText = 'Buscar',
}: HeroCarSearchProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

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
      className='w-full min-h-[500px] flex items-center'
    >
      <div style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} className='absolute inset-0 z-0' />
      <div className='container mx-auto px-4 z-10 relative py-12'>
        <div className='max-w-3xl mx-auto text-center mb-8'>
          <h1 style={{ color: textColor }} className='text-4xl md:text-5xl font-bold mb-4'>{title}</h1>
          <p style={{ color: textColor }} className='text-lg md:text-xl'>{subtitle}</p>
        </div>
        <div style={{ backgroundColor: searchBoxBackground, color: searchBoxTextColor }} className='rounded-lg shadow-lg p-4 md:p-6 max-w-4xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {showMakeModel && (
              <div>
                <label className='text-sm font-medium mb-1 block'>Marca y Modelo</label>
                <input type='text' placeholder='Ej: Toyota Corolla' className='w-full p-2 border rounded' />
              </div>
            )}
            {showYear && (
              <div>
                <label className='text-sm font-medium mb-1 block'>Año</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input type='number' placeholder='Desde' className='w-full p-2 border rounded' />
                  <input type='number' placeholder='Hasta' className='w-full p-2 border rounded' />
                </div>
              </div>
            )}
            {showPrice && (
              <div>
                <label className='text-sm font-medium mb-1 block'>Precio</label>
                <div className='grid grid-cols-2 gap-2'>
                  <input type='number' placeholder='Mínimo' className='w-full p-2 border rounded' />
                  <input type='number' placeholder='Máximo' className='w-full p-2 border rounded' />
                </div>
              </div>
            )}
          </div>
          <div className='mt-6 text-center'>
            <button style={{ backgroundColor: searchButtonColor }} className='px-6 py-2 text-white rounded-md hover:opacity-90 transition-opacity'>
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

HeroCarSearch.craft = {
  displayName: 'Hero con Buscador',
  props: {
    title: 'Encuentra tu auto ideal',
    subtitle: 'Busca entre miles de vehículos disponibles',
    backgroundImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1470',
    overlayColor: '#000000',
    overlayOpacity: 0.5,
    textColor: '#ffffff',
    searchButtonColor: '#3b82f6',
    searchBoxBackground: '#ffffff',
    searchBoxTextColor: '#333333',
    showMakeModel: true,
    showPrice: true,
    showYear: true,
    buttonText: 'Buscar',
  },
};
