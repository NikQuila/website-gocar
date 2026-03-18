'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { motion } from 'framer-motion';
import { Shield, Clock, CreditCard, Award, Headphones, Truck } from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Shield, Clock, CreditCard, Award, Headphones, Truck,
};

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface FeatureShowcaseProps {
  eyebrowText?: string;
  sectionTitle?: string;
  features?: FeatureItem[];
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
}

export const FeatureShowcase = ({
  eyebrowText = 'Por qu\u00e9 elegirnos',
  sectionTitle = 'Una experiencia premium en cada detalle',
  features = [
    { icon: 'Shield', title: 'Garant\u00eda extendida', description: 'Cobertura completa para tu tranquilidad' },
    { icon: 'CreditCard', title: 'Financiamiento flexible', description: 'Planes a tu medida con las mejores tasas' },
    { icon: 'Clock', title: 'Atenci\u00f3n 24/7', description: 'Soporte personalizado cuando lo necesites' },
    { icon: 'Award', title: 'Certificaci\u00f3n premium', description: 'Cada veh\u00edculo pasa por 150 puntos de inspecci\u00f3n' },
    { icon: 'Truck', title: 'Entrega a domicilio', description: 'Tu veh\u00edculo llega donde t\u00fa est\u00e9s' },
    { icon: 'Headphones', title: 'Asesor personal', description: 'Un experto dedicado a tu b\u00fasqueda' },
  ],
  bgColor = '#0a0a0a',
  textColor = '#ffffff',
  accentColor = '',
}: FeatureShowcaseProps) => {
  const { connectors } = useNode();
  const accent = accentColor || '#3b82f6';

  return (
    <div
      ref={connectors.connect}
      style={{ backgroundColor: bgColor, color: textColor, position: 'relative' }}
      className="w-full"
    >
      <div className="max-w-6xl mx-auto px-6 py-24 lg:py-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0 }}
          className="text-center mb-16"
        >
          <p
            className="text-xs font-medium uppercase tracking-[0.3em] mb-4"
            style={{ color: accent }}
            dangerouslySetInnerHTML={{ __html: eyebrowText }}
          />
          <h2
            className="text-[2rem] sm:text-[2.75rem] font-bold"
            style={{ color: textColor, letterSpacing: '-0.03em' }}
            dangerouslySetInnerHTML={{ __html: sectionTitle }}
          />
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const IconComp = ICON_MAP[f.icon] || Shield;
            const isLarge = i === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 * i }}
                className={`rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] ${isLarge ? 'sm:row-span-2 flex flex-col justify-center' : ''}`}
                style={{
                  backgroundColor: hexToRgba(textColor, 0.03),
                  border: `1px solid ${hexToRgba(textColor, 0.06)}`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: hexToRgba(accent, 0.1) }}>
                  <IconComp size={20} className="" style={{ color: accent } as any} />
                </div>
                <h3
                  className={`font-semibold mb-2 ${isLarge ? 'text-2xl' : 'text-lg'}`}
                  style={{ color: textColor }}
                  dangerouslySetInnerHTML={{ __html: f.title }}
                />
                <p
                  className="text-[15px] leading-relaxed"
                  style={{ color: hexToRgba(textColor, 0.5) }}
                  dangerouslySetInnerHTML={{ __html: f.description }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(255,255,255,${alpha})`;
  const num = parseInt(clean, 16);
  return `rgba(${(num >> 16) & 0xff},${(num >> 8) & 0xff},${num & 0xff},${alpha})`;
}

FeatureShowcase.craft = {
  displayName: 'FeatureShowcase',
  props: {
    eyebrowText: 'Por qu\u00e9 elegirnos', sectionTitle: 'Una experiencia premium en cada detalle',
    features: [
      { icon: 'Shield', title: 'Garant\u00eda extendida', description: 'Cobertura completa para tu tranquilidad' },
      { icon: 'CreditCard', title: 'Financiamiento flexible', description: 'Planes a tu medida con las mejores tasas' },
      { icon: 'Clock', title: 'Atenci\u00f3n 24/7', description: 'Soporte personalizado cuando lo necesites' },
      { icon: 'Award', title: 'Certificaci\u00f3n premium', description: 'Cada veh\u00edculo pasa por 150 puntos de inspecci\u00f3n' },
      { icon: 'Truck', title: 'Entrega a domicilio', description: 'Tu veh\u00edculo llega donde t\u00fa est\u00e9s' },
      { icon: 'Headphones', title: 'Asesor personal', description: 'Un experto dedicado a tu b\u00fasqueda' },
    ],
    bgColor: '#0a0a0a', textColor: '#ffffff', accentColor: '',
  },
  rules: { canDrag: () => true, canDrop: () => true, canMoveIn: () => false },
};
