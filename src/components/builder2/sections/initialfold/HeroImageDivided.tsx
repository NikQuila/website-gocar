import React from 'react';
import { useNode } from '@craftjs/core';
import { ChevronRight, Star, Check, Shield } from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature = ({ icon, title, description }: FeatureProps) => (
  <div className='flex gap-3 items-start'>
    <div className='flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600'>{icon}</div>
    <div>
      <h3 className='font-medium text-gray-900'>{title}</h3>
      <p className='text-sm text-gray-600 mt-1'>{description}</p>
    </div>
  </div>
);

interface HeroImageDividedProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  imageSrc?: string;
  primaryButtonColor?: string;
  primaryButtonTextColor?: string;
  secondaryButtonColor?: string;
  secondaryButtonTextColor?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  showFeatures?: boolean;
  featureOneTitle?: string;
  featureOneDesc?: string;
  featureTwoTitle?: string;
  featureTwoDesc?: string;
  featureThreeTitle?: string;
  featureThreeDesc?: string;
  reversed?: boolean;
}

export const HeroImageDivided = ({
  title = 'La mejor selección de autos seminuevos y nuevos',
  subtitle = 'GoAuto',
  description = 'Encuentra el vehículo perfecto para ti. Con miles de opciones disponibles, garantía extendida y financiamiento accesible, comprar tu próximo auto nunca fue tan fácil.',
  primaryButtonText = 'Ver catálogo',
  secondaryButtonText = 'Solicitar cotización',
  imageSrc = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1470',
  primaryButtonColor = '#3b82f6',
  primaryButtonTextColor = '#ffffff',
  secondaryButtonColor = '#ffffff',
  secondaryButtonTextColor = '#111827',
  backgroundColor = '#ffffff',
  textColor = '#111827',
  accentColor = '#3b82f6',
  showFeatures = true,
  featureOneTitle = 'Autos certificados',
  featureOneDesc = 'Todos nuestros vehículos son inspeccionados minuciosamente',
  featureTwoTitle = 'Garantía extendida',
  featureTwoDesc = 'Hasta 3 años de garantía en motor y transmisión',
  featureThreeTitle = 'Compra segura',
  featureThreeDesc = 'Documentación verificada y proceso transparente',
  reversed = false,
}: HeroImageDividedProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      style={{ backgroundColor, border: selected ? '1px dashed #1e88e5' : '1px solid transparent' }}
      className='w-full py-12 md:py-20'
    >
      <div className='container px-4 mx-auto'>
        <div className={`flex flex-col md:flex-row gap-12 md:gap-16 items-center ${reversed ? 'md:flex-row-reverse' : ''}`}>
          <div className='flex-1'>
            <div className='max-w-xl' style={{ color: textColor }}>
              <p className='text-sm font-semibold uppercase tracking-wider mb-3' style={{ color: accentColor }}>{subtitle}</p>
              <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4'>{title}</h1>
              <p className='text-lg opacity-90 mb-8'>{description}</p>
              <div className='flex flex-wrap gap-4 mb-12'>
                <button style={{ backgroundColor: primaryButtonColor, color: primaryButtonTextColor }} className='px-6 py-3 rounded-lg font-medium text-base inline-flex items-center transition-all hover:brightness-110'>
                  {primaryButtonText}<ChevronRight size={18} className='ml-1' />
                </button>
                <button style={{ backgroundColor: secondaryButtonColor, color: secondaryButtonTextColor, borderColor: secondaryButtonTextColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : '#e5e7eb' }} className='px-6 py-3 rounded-lg font-medium text-base border transition-all hover:bg-gray-50'>
                  {secondaryButtonText}
                </button>
              </div>
              {showFeatures && (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <Feature icon={<Shield size={20} />} title={featureOneTitle} description={featureOneDesc} />
                  <Feature icon={<Check size={20} />} title={featureTwoTitle} description={featureTwoDesc} />
                  <Feature icon={<Star size={20} />} title={featureThreeTitle} description={featureThreeDesc} />
                </div>
              )}
            </div>
          </div>
          <div className='flex-1'>
            <div className='relative rounded-xl overflow-hidden shadow-xl' style={{ aspectRatio: '4/3' }}>
              <img src={imageSrc} alt={title} className='w-full h-full object-cover' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

HeroImageDivided.craft = {
  displayName: 'Hero con Imagen Dividida',
  props: {
    title: 'La mejor selección de autos seminuevos y nuevos',
    subtitle: 'GoAuto',
    description: 'Encuentra el vehículo perfecto para ti. Con miles de opciones disponibles, garantía extendida y financiamiento accesible, comprar tu próximo auto nunca fue tan fácil.',
    primaryButtonText: 'Ver catálogo',
    secondaryButtonText: 'Solicitar cotización',
    imageSrc: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1470',
    primaryButtonColor: '#3b82f6',
    primaryButtonTextColor: '#ffffff',
    secondaryButtonColor: '#ffffff',
    secondaryButtonTextColor: '#111827',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    accentColor: '#3b82f6',
    showFeatures: true,
    featureOneTitle: 'Autos certificados',
    featureOneDesc: 'Todos nuestros vehículos son inspeccionados minuciosamente',
    featureTwoTitle: 'Garantía extendida',
    featureTwoDesc: 'Hasta 3 años de garantía en motor y transmisión',
    featureThreeTitle: 'Compra segura',
    featureThreeDesc: 'Documentación verificada y proceso transparente',
    reversed: false,
  },
};
