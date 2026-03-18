'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import NewVehiclesSection from '@/sections/vehicles/new-vehicles-section';

interface TraditionalVehicleGridProps {
  title?: string;
}

export const TraditionalVehicleGrid = ({ title }: TraditionalVehicleGridProps) => {
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
      <NewVehiclesSection minimal />
    </div>
  );
};

(TraditionalVehicleGrid as any).craft = {
  displayName: 'TraditionalVehicleGrid',
  props: { title: '' },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
