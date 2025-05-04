import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  questionColor: string;
  answerColor: string;
  accentColor: string;
}

const FAQItem = ({
  question,
  answer,
  isOpen,
  onToggle,
  questionColor,
  answerColor,
  accentColor,
}: FAQItemProps) => {
  return (
    <div className='border-b border-gray-700 pb-4 mb-4 last:border-0 last:mb-0'>
      <button
        className='w-full flex justify-between items-center text-left focus:outline-none'
        onClick={onToggle}
      >
        <h3 className='text-xl font-medium' style={{ color: questionColor }}>
          {question}
        </h3>
        {isOpen ? (
          <IconChevronUp style={{ color: accentColor }} size={24} />
        ) : (
          <IconChevronDown style={{ color: accentColor }} size={24} />
        )}
      </button>
      {isOpen && (
        <div className='mt-3 text-base' style={{ color: answerColor }}>
          {answer}
        </div>
      )}
    </div>
  );
};

interface FAQProps {
  sectionTitle?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  questions?: {
    question: string;
    answer: string;
  }[];
  bgColor?: string;
  titleColor?: string;
  questionColor?: string;
  answerColor?: string;
  accentColor?: string;
}

export const FAQ = ({
  sectionTitle = 'Preguntas frecuentes',
  titleAlignment = 'center',
  questions = [
    {
      question: '¿Qué tipos de vehículos ofrecen?',
      answer:
        'Ofrecemos una amplia gama de vehículos, desde compactos hasta SUVs y vehículos de lujo. Todos nuestros vehículos son seminuevos y han pasado por un riguroso proceso de inspección.',
    },
    {
      question: '¿Cómo funciona el financiamiento?',
      answer:
        'Trabajamos con diversas entidades financieras para ofrecer opciones que se adapten a tus necesidades. Nuestros asesores pueden ayudarte a encontrar el plan más adecuado según tu situación financiera.',
    },
    {
      question: '¿Ofrecen garantía en sus vehículos?',
      answer:
        'Sí, todos nuestros vehículos incluyen garantía. La duración y cobertura pueden variar según el modelo, año y estado del vehículo. Consulta con nuestros asesores para más detalles.',
    },
  ],
  bgColor = '#000000',
  titleColor = '#ffffff',
  questionColor = '#ffffff',
  answerColor = '#9ca3af',
  accentColor = '#3b82f6',
}: FAQProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // State to track which FAQ items are open
  const [openItems, setOpenItems] = useState<number[]>([0]); // First item open by default

  const toggleItem = (index: number) => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter((item) => item !== index));
    } else {
      setOpenItems([...openItems, index]);
    }
  };

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
      <div className='max-w-4xl mx-auto'>
        <h2
          className='text-4xl font-bold mb-16'
          style={{
            color: titleColor,
            textAlign: titleAlignment,
          }}
        >
          {sectionTitle}
        </h2>

        <div className='space-y-6'>
          {questions.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openItems.includes(index)}
              onToggle={() => toggleItem(index)}
              questionColor={questionColor}
              answerColor={answerColor}
              accentColor={accentColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

FAQ.craft = {
  displayName: 'FAQ',
  props: {
    sectionTitle: 'Preguntas frecuentes',
    titleAlignment: 'center',
    questions: [
      {
        question: '¿Qué tipos de vehículos ofrecen?',
        answer:
          'Ofrecemos una amplia gama de vehículos, desde compactos hasta SUVs y vehículos de lujo. Todos nuestros vehículos son seminuevos y han pasado por un riguroso proceso de inspección.',
      },
      {
        question: '¿Cómo funciona el financiamiento?',
        answer:
          'Trabajamos con diversas entidades financieras para ofrecer opciones que se adapten a tus necesidades. Nuestros asesores pueden ayudarte a encontrar el plan más adecuado según tu situación financiera.',
      },
      {
        question: '¿Ofrecen garantía en sus vehículos?',
        answer:
          'Sí, todos nuestros vehículos incluyen garantía. La duración y cobertura pueden variar según el modelo, año y estado del vehículo. Consulta con nuestros asesores para más detalles.',
      },
    ],
    bgColor: '#000000',
    titleColor: '#ffffff',
    questionColor: '#ffffff',
    answerColor: '#9ca3af',
    accentColor: '#3b82f6',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
