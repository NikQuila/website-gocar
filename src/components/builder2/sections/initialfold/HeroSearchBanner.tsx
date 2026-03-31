import React from 'react';
import { useNode } from '@craftjs/core';
import { Search, Car, Calendar, DollarSign, CornerDownRight } from 'lucide-react';

interface SearchOptionProps {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
}

const SearchOption = ({ label, placeholder, icon }: SearchOptionProps) => (
  <div className='relative flex-1 min-w-[200px]'>
    <label className='block text-xs font-medium mb-1 text-gray-600'>{label}</label>
    <div className='relative'>
      <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>{icon}</div>
      <input type='text' placeholder={placeholder} className='w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all' />
    </div>
  </div>
);

interface HeroSearchBannerProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  accentColor?: string;
  buttonText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  searchBarBackgroundColor?: string;
  searchBarTextColor?: string;
  searchOptionMake?: string;
  searchOptionModel?: string;
  searchOptionYear?: string;
  searchOptionPrice?: string;
}

export const HeroSearchBanner = ({
  title = 'Encuentra tu auto ideal',
  subtitle = 'Miles de vehículos disponibles en toda la región',
  backgroundImage = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1472',
  overlayColor = '#000000',
  overlayOpacity = 0.6,
  textColor = '#ffffff',
  buttonText = 'Buscar',
  buttonColor = '#3b82f6',
  buttonTextColor = '#ffffff',
  searchBarBackgroundColor = '#ffffff',
  searchOptionMake = 'Marca',
  searchOptionModel = 'Modelo',
  searchOptionYear = 'Año',
  searchOptionPrice = 'Precio',
}: HeroSearchBannerProps) => {
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
      className='w-full min-h-[600px] flex items-center'
    >
      <div style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} className='absolute inset-0 z-0' />
      <div className='container mx-auto px-4 z-10 relative py-16'>
        <div className='max-w-4xl mx-auto text-center mb-12'>
          <h1 style={{ color: textColor }} className='text-4xl md:text-5xl font-bold mb-4'>{title}</h1>
          <p style={{ color: textColor }} className='text-lg md:text-xl'>{subtitle}</p>
        </div>
        <div className='max-w-5xl mx-auto rounded-xl shadow-xl overflow-hidden'>
          <div style={{ backgroundColor: searchBarBackgroundColor }} className='p-6 flex flex-col md:flex-row gap-4'>
            <SearchOption label={searchOptionMake} placeholder='Todas las marcas' icon={<Car size={18} />} />
            <SearchOption label={searchOptionModel} placeholder='Todos los modelos' icon={<CornerDownRight size={18} />} />
            <SearchOption label={searchOptionYear} placeholder='Todos los años' icon={<Calendar size={18} />} />
            <SearchOption label={searchOptionPrice} placeholder='Cualquier precio' icon={<DollarSign size={18} />} />
            <div className='flex items-end'>
              <button style={{ backgroundColor: buttonColor, color: buttonTextColor }} className='w-full md:w-auto px-6 py-3 rounded-lg flex items-center justify-center font-medium transition-all hover:brightness-110'>
                <Search size={18} className='mr-2' />{buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

HeroSearchBanner.craft = {
  displayName: 'Hero con Buscador',
  props: {
    title: 'Encuentra tu auto ideal',
    subtitle: 'Miles de vehículos disponibles en toda la región',
    backgroundImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1472',
    overlayColor: '#000000',
    overlayOpacity: 0.6,
    textColor: '#ffffff',
    accentColor: '#3b82f6',
    buttonText: 'Buscar',
    buttonColor: '#3b82f6',
    buttonTextColor: '#ffffff',
    searchBarBackgroundColor: '#ffffff',
    searchBarTextColor: '#333333',
    searchOptionMake: 'Marca',
    searchOptionModel: 'Modelo',
    searchOptionYear: 'Año',
    searchOptionPrice: 'Precio',
  },
};
