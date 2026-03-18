'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import WhyUs from '@/sections/home/WhyUs';

interface TraditionalWhyUsProps {
  title?: string;
  subtitle?: string;
  features?: any[];
}

export const TraditionalWhyUs = ({ title, subtitle, features }: TraditionalWhyUsProps) => {
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
      <WhyUs />
    </div>
  );
};

(TraditionalWhyUs as any).craft = {
  displayName: 'TraditionalWhyUs',
  props: {
    title: '¿Por qué elegirnos?',
    subtitle: 'Descubre por qué nuestros clientes confían en nosotros',
    features: [],
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
