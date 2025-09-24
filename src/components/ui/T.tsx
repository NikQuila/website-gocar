'use client';

import React from 'react';
import { useTranslation } from '@/i18n/hooks/useTranslation';

interface TProps {
  children: string;
  className?: string;
  fallback?: string;
}

/**
 * Componente T para traducciones simples compatible con la API anterior
 * Permite usar traducciones de manera similar a Magic Translate
 */
export function T({ children, className, fallback }: TProps) {
  const { t } = useTranslation();

  // Intentar traducir, usar fallback o children como último recurso
  const translatedText = t(children) || fallback || children;

  return <span className={className}>{translatedText}</span>;
}

/**
 * Hook adicional para usar directamente en JSX sin componente wrapper
 */
export function useT() {
  const { t } = useTranslation();
  return t;
}



