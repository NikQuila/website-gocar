import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones
import es from './locales/es';
import en from './locales/en';

// Recursos de traducción
const resources = {
  es: { translation: es },
  en: { translation: en },
};

// Determinar idioma inicial priorizando el persist de Zustand
let initialLanguage = 'es';
if (typeof window !== 'undefined') {
  try {
    const persisted = localStorage.getItem('language-storage');
    if (persisted) {
      const parsed = JSON.parse(persisted);
      initialLanguage =
        parsed?.state?.currentLanguage || parsed?.currentLanguage || initialLanguage;
    } else {
      // Fallback a i18next cache si existe
      const cached = localStorage.getItem('i18nextLng');
      if (cached) initialLanguage = cached;
    }
  } catch (e) {
    // Ignorar errores de parseo y mantener 'es'
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es', // Idioma por defecto
    lng: initialLanguage, // Idioma inicial (persistente si existe)

    // Configuración del detector de idioma
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React ya maneja XSS
    },

    // Configuración para desarrollo
    debug: process.env.NODE_ENV === 'development',

    // Configuración de namespace
    ns: 'translation',
    defaultNS: 'translation',
  });

export default i18n;
