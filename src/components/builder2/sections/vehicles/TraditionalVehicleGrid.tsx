'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import NewVehiclesSection from '@/sections/vehicles/new-vehicles-section';

interface TraditionalVehicleGridProps {
  title?: string;
  accentColor?: string;
  sectionBgColor?: string;
  filterBarBgColor?: string;
  filterBarBorderColor?: string;
  filterTextColor?: string;
  filterActiveTextColor?: string;
  filterHoverBgColor?: string;
  cardBgColor?: string;
  cardBorderColor?: string;
  cardTitleColor?: string;
  cardSubtitleColor?: string;
  cardSpecsColor?: string;
  cardPriceColor?: string;
  noResultsTitle?: string;
  noResultsText?: string;
  noResultsButtonText?: string;
}

function isDark(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.4;
}

export const TraditionalVehicleGrid = ({
  sectionBgColor,
  cardBgColor,
  accentColor,
  filterBarBgColor,
  filterBarBorderColor,
  filterTextColor,
  filterActiveTextColor,
}: TraditionalVehicleGridProps) => {
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

  const darkMode = (sectionBgColor && isDark(sectionBgColor)) || (cardBgColor && isDark(cardBgColor));

  return (
    <div
      ref={connectors?.connect || null}
      className={`${selected ? 'ring-2 ring-dashed ring-slate-400' : ''} ${darkMode ? 'dark' : ''}`}
      style={sectionBgColor ? { backgroundColor: sectionBgColor } : undefined}
    >
      <NewVehiclesSection
        minimal
        filterBarBgColor={filterBarBgColor}
        filterBarBorderColor={filterBarBorderColor}
        filterTextColor={filterTextColor}
        filterActiveTextColor={filterActiveTextColor}
        accentColor={accentColor}
        sectionBgColor={sectionBgColor}
      />
    </div>
  );
};

(TraditionalVehicleGrid as any).craft = {
  displayName: 'TraditionalVehicleGrid',
  props: {
    title: '',
    accentColor: '',
    sectionBgColor: '',
    filterBarBgColor: '#ffffff',
    filterBarBorderColor: '#e5e7eb',
    filterTextColor: '#374151',
    filterActiveTextColor: '#ffffff',
    filterHoverBgColor: '#f3f4f6',
    cardBgColor: '#ffffff',
    cardBorderColor: 'rgba(0,0,0,0.1)',
    cardTitleColor: '#171717',
    cardSubtitleColor: '#525252',
    cardSpecsColor: '#262626',
    cardPriceColor: '#171717',
    noResultsTitle: 'Sin resultados',
    noResultsText: 'No encontramos vehículos con esos filtros',
    noResultsButtonText: 'Ver todos los vehículos',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
