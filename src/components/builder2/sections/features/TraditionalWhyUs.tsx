'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import WhyUs from '@/sections/home/WhyUs';

interface TraditionalWhyUsProps {
  title?: string;
  subtitle?: string;
  features?: any[];
  bgColor?: string;
  textColor?: string;
  subtitleColor?: string;
  accentColor?: string;
  cardBgColor?: string;
}

function isDark(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.4;
}

export const TraditionalWhyUs = ({
  bgColor = '',
  textColor = '',
  subtitleColor = '',
  accentColor = '',
  cardBgColor = '',
}: TraditionalWhyUsProps) => {
  let connectors: any = null;
  let selected = false;

  try {
    const nodeData = useNode((state) => ({ selected: state.events.selected }));
    connectors = nodeData.connectors;
    selected = nodeData.selected;
  } catch {
    connectors = null;
    selected = false;
  }

  const hasBg = bgColor && bgColor !== '';
  const darkMode = hasBg && isDark(bgColor);

  return (
    <div
      ref={connectors?.connect || null}
      className={`${selected ? 'ring-2 ring-dashed ring-slate-400' : ''} ${darkMode ? 'dark' : ''}`}
      style={hasBg ? { backgroundColor: bgColor, color: textColor || undefined } : undefined}
    >
      <WhyUs
        bgColor={bgColor || undefined}
        textColor={textColor || undefined}
        subtitleColor={subtitleColor || undefined}
        cardBgColor={cardBgColor || undefined}
        accentColor={accentColor || undefined}
      />
    </div>
  );
};

(TraditionalWhyUs as any).craft = {
  displayName: 'TraditionalWhyUs',
  props: {
    title: '¿Por qué elegirnos?',
    subtitle: 'Descubre por qué nuestros clientes confían en nosotros',
    features: [],
    bgColor: '',
    textColor: '',
    subtitleColor: '',
    accentColor: '',
    cardBgColor: '',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
