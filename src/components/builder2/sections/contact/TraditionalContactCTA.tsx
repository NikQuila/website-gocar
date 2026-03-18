'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import OriginalContactCTA from '@/sections/home/ContactCTA';

interface TraditionalContactCTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

export const TraditionalContactCTA = ({ title, subtitle, buttonText, buttonLink }: TraditionalContactCTAProps) => {
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

  return (
    <div
      ref={connectors?.connect || null}
      className={selected ? 'ring-2 ring-dashed ring-slate-400' : ''}
    >
      <OriginalContactCTA />
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
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
