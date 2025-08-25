import React from 'react';
import { useNode } from '@craftjs/core';
import {
  IconCheck,
  IconCurrencyDollar,
  IconUserCircle,
  IconCar,
  IconStar,
  IconShield,
  IconHome,
  IconClock,
  IconSettings,
  IconPhone,
  IconMail,
  IconMap,
} from '@tabler/icons-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  cardBgColor: string;
  cardTextColor: string;
  descriptionColor: string;
  link?: string;
}

const FeatureCard = ({
  icon,
  title,
  description,
  cardBgColor,
  cardTextColor,
  descriptionColor,
  link,
}: FeatureCardProps) => {
  const scrollToSection = (sectionId: string) => {
    // Check if it's a phone number (starts with + or contains only numbers and spaces)
    const phoneRegex = /^(\+?[\d\s\-\(\)]+)$/;
    if (phoneRegex.test(sectionId.trim())) {
      // Convert to WhatsApp link
      const cleanNumber = sectionId.replace(/[\s\-\(\)]/g, '');
      const whatsappUrl = `https://wa.me/${cleanNumber}`;
      window.open(whatsappUrl, '_blank');
      return;
    }

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
    } else if (sectionId.startsWith('/')) {
      // Es una ruta interna, navegamos a ella
      window.location.href = sectionId;
    } else if (sectionId.startsWith('http')) {
      // Es una URL externa, navegamos a ella
      window.open(sectionId, '_blank');
    }
  };

  const handleClick = () => {
    if (link) {
      scrollToSection(link);
    }
  };

  return (
    <div
      className={`rounded-lg p-6 flex flex-col items-center text-center transition-all duration-200 ${
        link ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : ''
      }`}
      style={{ backgroundColor: cardBgColor }}
      onClick={handleClick}
    >
      <div className='mb-4 flex justify-center'>{icon}</div>
      <h3 className='text-xl font-bold mb-2' style={{ color: cardTextColor }}>
        {title}
      </h3>
      <p style={{ color: descriptionColor }}>{description}</p>
    </div>
  );
};

interface WhyChooseUsProps {
  sectionTitle?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  features?: {
    icon: string;
    title: string;
    description: string;
    link?: string;
  }[];
  bgColor?: string;
  textColor?: string;
  cardBgColor?: string;
  cardTextColor?: string;
  iconColor?: string;
  descriptionColor?: string;
}

export const WhyChooseUs = ({
  sectionTitle = '¿Por qué elegirnos?',
  titleAlignment = 'center',
  features = [
    {
      icon: 'check',
      title: 'Autos inspeccionados y garantizados',
      description: 'Seguridad y calidad aseguradas',
    },
    {
      icon: 'dollar',
      title: 'Financiamiento a tu medida',
      description: 'Diseñado según tus necesidades',
    },
    {
      icon: 'user',
      title: 'Atención personalizada',
      description: 'Un asesor te acompaña en todo el proceso',
    },
  ],
  bgColor = '#000000',
  textColor = '#ffffff',
  cardBgColor = '#1A1A1A',
  cardTextColor = '#ffffff',
  iconColor = '#3b82f6',
  descriptionColor = '#9ca3af',
}: WhyChooseUsProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const getIcon = (iconType: string, size = 48) => {
    const iconProps = { size, style: { color: iconColor } };

    switch (iconType) {
      case 'check':
        return <IconCheck {...iconProps} />;
      case 'dollar':
        return <IconCurrencyDollar {...iconProps} />;
      case 'user':
        return <IconUserCircle {...iconProps} />;
      case 'car':
        return <IconCar {...iconProps} />;
      case 'star':
        return <IconStar {...iconProps} />;
      case 'shield':
        return <IconShield {...iconProps} />;
      case 'home':
        return <IconHome {...iconProps} />;
      case 'clock':
        return <IconClock {...iconProps} />;
      case 'settings':
        return <IconSettings {...iconProps} />;
      case 'phone':
        return <IconPhone {...iconProps} />;
      case 'mail':
        return <IconMail {...iconProps} />;
      case 'map':
        return <IconMap {...iconProps} />;
      default:
        return <IconCheck {...iconProps} />;
    }
  };

  return (
    <div
      ref={connectors.connect}
      style={{
        background: bgColor,
        color: textColor,
        padding: '80px 20px',
        position: 'relative',
        border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
      }}
      className='w-full'
    >
      <div className='max-w-6xl mx-auto'>
        <h2
          className='text-4xl font-bold mb-16'
          style={{
            color: textColor,
            textAlign: titleAlignment,
          }}
        >
          {sectionTitle}
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={getIcon(feature.icon)}
              title={feature.title}
              description={feature.description}
              cardBgColor={cardBgColor}
              cardTextColor={cardTextColor}
              descriptionColor={descriptionColor}
              link={feature.link}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

WhyChooseUs.craft = {
  displayName: 'WhyChooseUs',
  props: {
    sectionTitle: '¿Por qué elegirnos?',
    titleAlignment: 'center',
    features: [
      {
        icon: 'check',
        title: 'Autos inspeccionados y garantizados',
        description: 'Seguridad y calidad aseguradas',
        link: '',
      },
      {
        icon: 'dollar',
        title: 'Financiamiento a tu medida',
        description: 'Diseñado según tus necesidades',
        link: '',
      },
      {
        icon: 'user',
        title: 'Atención personalizada',
        description: 'Un asesor te acompaña en todo el proceso',
        link: '',
      },
    ],
    bgColor: '#000000',
    textColor: '#ffffff',
    cardBgColor: '#1A1A1A',
    cardTextColor: '#ffffff',
    iconColor: '#3b82f6',
    descriptionColor: '#9ca3af',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
