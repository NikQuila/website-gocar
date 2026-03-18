import React, { useState, useEffect, useRef } from 'react';
import { useNode } from '@craftjs/core';
import { motion } from 'framer-motion';

const appleEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

interface StatItem { value: string; suffix: string; label: string; }
interface StatsModernoProps { stats?: StatItem[]; bgColor?: string; textColor?: string; accentColor?: string; }

const AnimatedValue = ({ text }: { text: string }) => {
  const [display, setDisplay] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        const numeric = parseInt(text.replace(/[^0-9]/g, ''));
        if (isNaN(numeric)) { setDisplay(text); return; }
        const steps = 40; const increment = numeric / steps; let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= numeric) { setDisplay(text); clearInterval(timer); }
          else setDisplay(Math.floor(current).toLocaleString());
        }, 1500 / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [text, hasAnimated]);
  return <span ref={ref}>{display}</span>;
};

export const StatsModerno = ({
  stats = [
    { value: '500', suffix: '+', label: 'Vehículos vendidos' },
    { value: '2,000', suffix: '+', label: 'Clientes satisfechos' },
    { value: '15', suffix: '+', label: 'Años de experiencia' },
    { value: '4.9', suffix: '★', label: 'Rating en Google' },
  ],
  bgColor = '#ffffff', textColor = '#0f172a', accentColor = '#3b82f6',
}: StatsModernoProps) => {
  const { connectors } = useNode();
  return (
    <div ref={(el: HTMLDivElement | null) => { if (el) connectors.connect(el); }}
      style={{ backgroundColor: bgColor, color: textColor, position: 'relative',
        borderTop: `1px solid ${hexToRgba(textColor, 0.06)}`, borderBottom: `1px solid ${hexToRgba(textColor, 0.06)}` }}
      className="w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: appleEase }} viewport={{ once: true }} className="text-center min-w-[140px]">
              <div className="text-[2.5rem] sm:text-[3.5rem] font-semibold tracking-tight leading-none" style={{ color: textColor }}>
                <AnimatedValue text={stat.value} />
                <span style={{ color: accentColor }} dangerouslySetInnerHTML={{ __html: stat.suffix || '' }} />
              </div>
              <div className="text-[15px] mt-2" style={{ color: hexToRgba(textColor, 0.5) }} dangerouslySetInnerHTML={{ __html: stat.label || '' }} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(0,0,0,${alpha})`;
  const num = parseInt(clean, 16);
  return `rgba(${(num >> 16) & 0xff},${(num >> 8) & 0xff},${num & 0xff},${alpha})`;
}

StatsModerno.craft = {
  displayName: 'StatsModerno',
  props: {
    stats: [
      { value: '500', suffix: '+', label: 'Vehículos vendidos' },
      { value: '2,000', suffix: '+', label: 'Clientes satisfechos' },
      { value: '15', suffix: '+', label: 'Años de experiencia' },
      { value: '4.9', suffix: '★', label: 'Rating en Google' },
    ],
    bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#3b82f6',
  },
  rules: { canDrag: () => true, canDrop: () => true, canMoveIn: () => false },
};
