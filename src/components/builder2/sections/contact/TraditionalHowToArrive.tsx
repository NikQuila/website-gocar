// TraditionalHowToArrive — website version
// Wraps the existing HowToArrive section from the website
import React from 'react';
import { useNode } from '@craftjs/core';
import HowToArrive from '@/sections/home/HowToArrive';

interface TraditionalHowToArriveProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  subtitleColor?: string;
  accentColor?: string;
  buttonText?: string;
}

export const TraditionalHowToArrive = (_props: TraditionalHowToArriveProps) => {
  const { connectors } = useNode();

  return (
    <div ref={connectors.connect}>
      <HowToArrive />
    </div>
  );
};

(TraditionalHowToArrive as any).craft = {
  displayName: 'TraditionalHowToArrive',
  props: {
    title: '¿Cómo llegar?',
    subtitle: 'Encuéntranos en la siguiente dirección:',
    bgColor: '',
    textColor: '',
    subtitleColor: '',
    accentColor: '',
    buttonText: 'Cómo llegar',
  },
  rules: { canDrag: () => true, canDrop: () => true, canMoveIn: () => false },
};
