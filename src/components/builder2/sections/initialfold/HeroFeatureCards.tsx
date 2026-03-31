import React from 'react';
import { useNode } from '@craftjs/core';
import { CreditCard, Car, CalendarClock, ShieldCheck } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const FeatureCard = ({ icon, title, description, color }: FeatureCardProps) => (
  <div className='flex flex-col items-center bg-white rounded-lg shadow-md p-6 transition-transform hover:-translate-y-1'>
    <div className='p-3 rounded-full mb-4' style={{ backgroundColor: `${color}20` }}>
      <div style={{ color }}>{icon}</div>
    </div>
    <h3 className='text-lg font-semibold mb-2'>{title}</h3>
    <p className='text-gray-600 text-center text-sm'>{description}</p>
  </div>
);

interface HeroFeatureCardsProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  cardBackgroundColor?: string;
  cardTextColor?: string;
  accentColor?: string;
  feature1Title?: string;
  feature1Description?: string;
  feature1Icon?: string;
  feature1Color?: string;
  feature2Title?: string;
  feature2Description?: string;
  feature2Icon?: string;
  feature2Color?: string;
  feature3Title?: string;
  feature3Description?: string;
  feature3Icon?: string;
  feature3Color?: string;
  feature4Title?: string;
  feature4Description?: string;
  feature4Icon?: string;
  feature4Color?: string;
}

export const HeroFeatureCards = ({
  title = 'Lo mejor para tu próximo auto',
  subtitle = 'Descubre por qué miles de personas eligen GoAuto para encontrar vehículos',
  backgroundImage = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1470',
  overlayColor = '#000000',
  overlayOpacity = 0.7,
  textColor = '#ffffff',
  feature1Title = 'Financiamiento a tu medida',
  feature1Description = 'Opciones flexibles de pago adaptadas a tu presupuesto y necesidades',
  feature1Icon = 'CreditCard',
  feature1Color = '#3b82f6',
  feature2Title = 'Amplio catálogo',
  feature2Description = 'Miles de vehículos nuevos y usados con toda la información que necesitas',
  feature2Icon = 'Car',
  feature2Color = '#10b981',
  feature3Title = 'Proceso rápido',
  feature3Description = 'Desde la búsqueda hasta la adquisición en tiempo récord',
  feature3Icon = 'CalendarClock',
  feature3Color = '#f59e0b',
  feature4Title = 'Garantía total',
  feature4Description = 'Todos nuestros vehículos pasan por rigurosas inspecciones de calidad',
  feature4Icon = 'ShieldCheck',
  feature4Color = '#ef4444',
}: HeroFeatureCardsProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard': return <CreditCard size={24} />;
      case 'Car': return <Car size={24} />;
      case 'CalendarClock': return <CalendarClock size={24} />;
      case 'ShieldCheck': return <ShieldCheck size={24} />;
      default: return <Car size={24} />;
    }
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
      <div style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} className='absolute inset-0 z-0' />
      <div className='container mx-auto px-4 z-10 relative py-16'>
        <div className='max-w-3xl mx-auto text-center mb-12'>
          <h1 style={{ color: textColor }} className='text-4xl md:text-5xl font-bold mb-4'>{title}</h1>
          <p style={{ color: textColor }} className='text-lg md:text-xl'>{subtitle}</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8'>
          <FeatureCard icon={getIconComponent(feature1Icon)} title={feature1Title} description={feature1Description} color={feature1Color} />
          <FeatureCard icon={getIconComponent(feature2Icon)} title={feature2Title} description={feature2Description} color={feature2Color} />
          <FeatureCard icon={getIconComponent(feature3Icon)} title={feature3Title} description={feature3Description} color={feature3Color} />
          <FeatureCard icon={getIconComponent(feature4Icon)} title={feature4Title} description={feature4Description} color={feature4Color} />
        </div>
      </div>
    </div>
  );
};

HeroFeatureCards.craft = {
  displayName: 'Hero con Características',
  props: {
    title: 'Lo mejor para tu próximo auto',
    subtitle: 'Descubre por qué miles de personas eligen GoAuto para encontrar vehículos',
    backgroundImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1470',
    overlayColor: '#000000',
    overlayOpacity: 0.7,
    textColor: '#ffffff',
    cardBackgroundColor: '#ffffff',
    cardTextColor: '#333333',
    accentColor: '#3b82f6',
    feature1Title: 'Financiamiento a tu medida',
    feature1Description: 'Opciones flexibles de pago adaptadas a tu presupuesto y necesidades',
    feature1Icon: 'CreditCard',
    feature1Color: '#3b82f6',
    feature2Title: 'Amplio catálogo',
    feature2Description: 'Miles de vehículos nuevos y usados con toda la información que necesitas',
    feature2Icon: 'Car',
    feature2Color: '#10b981',
    feature3Title: 'Proceso rápido',
    feature3Description: 'Desde la búsqueda hasta la adquisición en tiempo récord',
    feature3Icon: 'CalendarClock',
    feature3Color: '#f59e0b',
    feature4Title: 'Garantía total',
    feature4Description: 'Todos nuestros vehículos pasan por rigurosas inspecciones de calidad',
    feature4Icon: 'ShieldCheck',
    feature4Color: '#ef4444',
  },
};
