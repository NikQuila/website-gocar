import React from 'react';
import { useNode } from '@craftjs/core';
import { IconStar, IconStarFilled, IconUser } from '@tabler/icons-react';

interface TestimonialCardProps {
  name: string;
  role: string;
  testimonial: string;
  rating: string | number;
  photo?: string;
  cardBgColor: string;
  nameColor: string;
  roleColor: string;
  testimonialColor: string;
  starColor: string;
}

const TestimonialCard = ({
  name,
  role,
  testimonial,
  rating,
  photo,
  cardBgColor,
  nameColor,
  roleColor,
  testimonialColor,
  starColor,
}: TestimonialCardProps) => {
  // Generate stars based on rating
  const renderStars = () => {
    const stars = [];
    // Convert rating to number if it's a string
    const numRating =
      typeof rating === 'string' ? parseInt(rating, 10) : rating;

    for (let i = 1; i <= 5; i++) {
      if (i <= numRating) {
        stars.push(
          <IconStarFilled key={i} size={20} style={{ color: starColor }} />
        );
      } else {
        stars.push(<IconStar key={i} size={20} style={{ color: starColor }} />);
      }
    }
    return stars;
  };

  return (
    <div
      className='p-6 rounded-lg shadow-sm relative'
      style={{ backgroundColor: cardBgColor }}
    >
      <div className='flex mb-4 items-center gap-2'>{renderStars()}</div>
      <p className='mb-6 text-base italic' style={{ color: testimonialColor }}>
        "{testimonial}"
      </p>
      <div className='flex items-center'>
        <div className='w-12 h-12 rounded-full overflow-hidden mr-4 flex items-center justify-center bg-gray-200'>
          {photo ? (
            <img
              src={photo}
              alt={name}
              className='w-full h-full object-cover'
            />
          ) : (
            <IconUser size={28} className='text-gray-400' />
          )}
        </div>
        <div>
          <h4 className='font-bold' style={{ color: nameColor }}>
            {name}
          </h4>
          <p className='text-sm' style={{ color: roleColor }}>
            {role}
          </p>
        </div>
      </div>
    </div>
  );
};

interface TestimonialsProps {
  sectionTitle?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  testimonials?: {
    name: string;
    role: string;
    testimonial: string;
    rating: string | number;
    photo?: string;
  }[];
  columns?: string | number;
  bgColor?: string;
  titleColor?: string;
  cardBgColor?: string;
  nameColor?: string;
  roleColor?: string;
  testimonialColor?: string;
  starColor?: string;
}

export const Testimonials = ({
  sectionTitle = 'Lo que dicen nuestros clientes',
  titleAlignment = 'center',
  testimonials = [
    {
      name: 'Carlos Rodríguez',
      role: 'Comprador de Toyota Corolla',
      testimonial:
        'Excelente servicio de principio a fin. El proceso de compra fue rápido y transparente. Estoy muy contento con mi nuevo auto.',
      rating: 5,
    },
    {
      name: 'María González',
      role: 'Compradora de Honda CR-V',
      testimonial:
        'El asesor fue muy paciente y resolvió todas mis dudas. Me ayudaron a conseguir el financiamiento perfecto para mis necesidades.',
      rating: 4,
    },
    {
      name: 'Juan Pérez',
      role: 'Comprador de Nissan Sentra',
      testimonial:
        'La garantía y el servicio post-venta son excelentes. Me han atendido siempre que lo he necesitado sin problemas.',
      rating: 5,
    },
  ],
  columns = 3,
  bgColor = '#f8f9fa',
  titleColor = '#333333',
  cardBgColor = '#ffffff',
  nameColor = '#333333',
  roleColor = '#666666',
  testimonialColor = '#555555',
  starColor = '#FFD700',
}: TestimonialsProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // Convert columns to number if it's a string
  const numColumns =
    typeof columns === 'string' ? parseInt(columns, 10) : columns;

  const columnClass =
    {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    }[numColumns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div
      ref={connectors.connect}
      style={{
        background: bgColor,
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
            color: titleColor,
            textAlign: titleAlignment,
          }}
        >
          {sectionTitle}
        </h2>

        <div className={`grid gap-8 ${columnClass}`}>
          {testimonials.map((item, index) => (
            <TestimonialCard
              key={index}
              name={item.name}
              role={item.role}
              testimonial={item.testimonial}
              rating={item.rating}
              photo={item.photo}
              cardBgColor={cardBgColor}
              nameColor={nameColor}
              roleColor={roleColor}
              testimonialColor={testimonialColor}
              starColor={starColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

Testimonials.craft = {
  displayName: 'Testimonials',
  props: {
    sectionTitle: 'Lo que dicen nuestros clientes',
    titleAlignment: 'center',
    testimonials: [
      {
        name: 'Carlos Rodríguez',
        role: 'Comprador de Toyota Corolla',
        testimonial:
          'Excelente servicio de principio a fin. El proceso de compra fue rápido y transparente. Estoy muy contento con mi nuevo auto.',
        rating: 5,
      },
      {
        name: 'María González',
        role: 'Compradora de Honda CR-V',
        testimonial:
          'El asesor fue muy paciente y resolvió todas mis dudas. Me ayudaron a conseguir el financiamiento perfecto para mis necesidades.',
        rating: 4,
      },
      {
        name: 'Juan Pérez',
        role: 'Comprador de Nissan Sentra',
        testimonial:
          'La garantía y el servicio post-venta son excelentes. Me han atendido siempre que lo he necesitado sin problemas.',
        rating: 5,
      },
    ],
    columns: 3,
    bgColor: '#f8f9fa',
    titleColor: '#333333',
    cardBgColor: '#ffffff',
    nameColor: '#333333',
    roleColor: '#666666',
    testimonialColor: '#555555',
    starColor: '#FFD700',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
