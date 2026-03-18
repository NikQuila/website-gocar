import React from 'react';
import { useNode } from '@craftjs/core';
import { Star, User, Quote } from 'lucide-react';

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
  const numRating = typeof rating === 'string' ? parseInt(rating, 10) : rating;

  return (
    <div
      className='group relative p-8 rounded-2xl border border-gray-100/80 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full overflow-hidden'
      style={{ backgroundColor: cardBgColor }}
    >
      {/* Decorative gradient blob */}
      <div
        className='absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700'
        style={{ backgroundColor: `${starColor}15` }}
      />

      {/* Stars */}
      <div className='flex mb-5 items-center gap-1'>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < numRating ? starColor : 'none'}
            stroke={starColor}
            strokeWidth={i < numRating ? 0 : 1.5}
          />
        ))}
      </div>

      {/* Testimonial text */}
      <p className='mb-8 text-[15px] leading-[1.75] flex-1 relative' style={{ color: testimonialColor }}>
        <span className='text-3xl font-serif leading-none mr-1 align-top' style={{ color: `${starColor}40` }}>&ldquo;</span>
        <span dangerouslySetInnerHTML={{ __html: testimonial || '' }} />
        <span className='text-3xl font-serif leading-none ml-0.5' style={{ color: `${starColor}40` }}>&rdquo;</span>
      </p>

      {/* Author */}
      <div className='flex items-center gap-3.5'>
        <div
          className='w-11 h-11 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center ring-2 ring-offset-2'
          style={{ backgroundColor: `${starColor}10`, ringColor: `${starColor}25` }}
        >
          {photo ? (
            <img src={photo} alt={name} className='w-full h-full object-cover' />
          ) : (
            <User size={20} style={{ color: starColor }} />
          )}
        </div>
        <div>
          <h4 className='font-semibold text-sm' style={{ color: nameColor }}
            dangerouslySetInnerHTML={{ __html: name || '' }} />
          <p className='text-xs mt-0.5' style={{ color: roleColor }}
            dangerouslySetInnerHTML={{ __html: role || '' }} />
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
  bgColor = '#ffffff',
  titleColor = '#111827',
  cardBgColor = '#ffffff',
  nameColor = '#111827',
  roleColor = '#6b7280',
  testimonialColor = '#374151',
  starColor,
}: TestimonialsProps) => {
  const { connectors, selected, id } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const finalStarColor = starColor || '#f59e0b';

  const numColumns = typeof columns === 'string' ? parseInt(columns, 10) : columns;

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
        border: selected ? '2px dashed #666666' : '1px solid transparent',
        outline: selected ? '1px dashed #999999' : 'none',
        outlineOffset: selected ? '2px' : '0px',
      }}
      className='w-full'
    >
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-14'>
          <p className='text-sm font-semibold uppercase tracking-widest mb-3' style={{ color: finalStarColor }}>
            Testimonios
          </p>
          <h2
            className='text-3xl md:text-4xl lg:text-5xl font-bold'
            style={{ color: titleColor, textAlign: titleAlignment }}
            dangerouslySetInnerHTML={{ __html: sectionTitle || '' }}
          />
        </div>

        <div className={`grid gap-6 ${columnClass}`}>
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
              starColor={finalStarColor}
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
    bgColor: '#ffffff',
    titleColor: '#111827',
    cardBgColor: '#ffffff',
    nameColor: '#111827',
    roleColor: '#6b7280',
    testimonialColor: '#374151',
    starColor: '#f59e0b',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
