'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, AVAILABLE_LANGUAGES } from '@/i18n/types';

interface LanguageState {
  currentLanguage: Language;
  isInitialized: boolean;
}

interface LanguageActions {
  setLanguage: (language: Language) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

type LanguageStore = LanguageState & LanguageActions;

// Estado inicial
const initialState: LanguageState = {
  currentLanguage: AVAILABLE_LANGUAGES.ES,
  isInitialized: false,
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Acciones
      setLanguage: (language: Language) => {
        set({ currentLanguage: language });
      },

      setInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'language-storage', // nombre para localStorage
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
      }), // solo persistir el idioma actual
    }
  )
);

// Selectores para usar en componentes
export const useCurrentLanguage = () =>
  useLanguageStore((state) => state.currentLanguage);
export const useIsLanguageInitialized = () =>
  useLanguageStore((state) => state.isInitialized);

// Función helper para validar idiomas
export const isValidLanguage = (lang: string): lang is Language => {
  return Object.values(AVAILABLE_LANGUAGES).includes(lang as Language);
};



