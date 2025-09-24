'use client';

import React, { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { useLanguageStore } from '@/store/useLanguageStore';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { currentLanguage, setInitialized } = useLanguageStore();

  useEffect(() => {
    // Inicializar i18n con el idioma del store
    if (currentLanguage) {
      i18n.changeLanguage(currentLanguage);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = currentLanguage;
      }
    }

    // Marcar como inicializado
    setInitialized(true);
  }, [currentLanguage, setInitialized]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}


