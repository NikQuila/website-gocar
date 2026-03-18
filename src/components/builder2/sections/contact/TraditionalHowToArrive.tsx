// TraditionalHowToArrive — website version
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
  cardBgColor?: string;
  cardBorderColor?: string;
  labelColor?: string;
  valueColor?: string;
}

function isDark(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.4;
}

export const TraditionalHowToArrive = ({
  bgColor = '',
  textColor = '',
  subtitleColor = '',
  cardBgColor = '',
  cardBorderColor = '',
  labelColor = '',
  valueColor = '',
}: TraditionalHowToArriveProps) => {
  const { connectors } = useNode();
  const hasBg = bgColor && bgColor !== '';
  const darkMode = hasBg && isDark(bgColor);

  return (
    <div
      ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      className={darkMode ? 'dark' : ''}
    >
      <HowToArrive
        bgColor={bgColor || undefined}
        textColor={textColor || undefined}
        subtitleColor={subtitleColor || undefined}
        cardBgColor={cardBgColor || undefined}
        cardBorderColor={cardBorderColor || undefined}
        labelColor={labelColor || undefined}
        valueColor={valueColor || undefined}
      />
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
    cardBgColor: '',
    cardBorderColor: '',
    labelColor: '',
    valueColor: '',
  },
  rules: { canDrag: () => true, canDrop: () => true, canMoveIn: () => false },
};
