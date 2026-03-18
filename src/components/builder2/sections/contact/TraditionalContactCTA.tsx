'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import OriginalContactCTA from '@/sections/home/ContactCTA';

interface TraditionalContactCTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  bgColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

function isDark(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.4;
}

export const TraditionalContactCTA = ({
  bgColor = '',
  textColor = '',
  buttonColor = '',
  buttonTextColor = '#ffffff',
}: TraditionalContactCTAProps) => {
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
    >
      <OriginalContactCTA
        bgColor={bgColor || undefined}
        textColor={textColor || undefined}
        buttonColor={buttonColor || undefined}
        buttonTextColor={buttonTextColor || undefined}
      />
    </div>
  );
};

(TraditionalContactCTA as any).craft = {
  displayName: 'TraditionalContactCTA',
  props: {
    title: '¿Listo para encontrar tu próximo vehículo?',
    subtitle: 'Contáctanos hoy mismo.',
    buttonText: 'Contáctanos',
    buttonLink: '/contact',
    bgColor: '',
    textColor: '',
    buttonColor: '',
    buttonTextColor: '#ffffff',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
