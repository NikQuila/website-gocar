# 🌍 Guía de Configuración i18n

Esta guía explica cómo usar el sistema de internacionalización (i18n) implementado en el proyecto usando **react-i18next**.

## 📋 Estructura del Proyecto

```
src/
├── i18n/
│   ├── index.ts              # Configuración principal de i18n
│   ├── types/
│   │   └── index.ts         # Tipos TypeScript y constantes
│   ├── locales/
│   │   ├── pages/          # Traducciones por páginas
│   │   │   ├── es.ts      # Páginas en español
│   │   │   └── en.ts      # Páginas en inglés
│   │   ├── sections/      # Traducciones por secciones
│   │   │   ├── es.ts      # Secciones en español
│   │   │   └── en.ts      # Secciones en inglés
│   │   ├── components/    # Traducciones por componentes
│   │   │   ├── es.ts      # Componentes en español
│   │   │   └── en.ts      # Componentes en inglés
│   │   ├── common/        # Traducciones comunes
│   │   │   ├── es.ts      # Comunes en español
│   │   │   └── en.ts      # Comunes en inglés
│   │   ├── es.ts          # Archivo principal español
│   │   └── en.ts          # Archivo principal inglés
│   └── hooks/
│       └── useTranslation.ts # Hooks personalizados
├── store/
│   └── useLanguageStore.ts   # Store Zustand para idiomas
├── providers/
│   └── I18nProvider.tsx      # Provider de i18n
└── components/ui/
    ├── T.tsx                 # Componente T (compatible con API anterior)
    └── LanguageSelector.tsx  # Selector de idiomas
```

## 🚀 Cómo Usar

### 1. Hook Principal

```tsx
import { useTranslation } from '@/i18n/hooks/useTranslation';

function MyComponent() {
  const { t, changeLanguage, currentLanguage } = useTranslation();

  return (
    <div>
      <h1>{t('vehicles.title')}</h1>
      <button onClick={() => changeLanguage('en')}>Cambiar a inglés</button>
    </div>
  );
}
```

### 2. Hooks Escalables por Categoría

```tsx
import {
  usePageTranslations,
  useHomeSectionsTranslations,
  useVehicleSectionsTranslations,
  useNavigationTranslations,
  useVehicleCardTranslations,
  useActionsTranslations,
} from '@/i18n/hooks/useTranslation';

// Hook para páginas
function VehiclesPage() {
  const pages = usePageTranslations();

  return (
    <div>
      <h1>{pages.vehicles.title}</h1>
      <p>
        {filteredVehicles.length} {pages.vehicles.found}
      </p>
    </div>
  );
}

// Hook para navegación
function Navbar() {
  const nav = useNavigationTranslations();

  return (
    <nav>
      <a href='/vehicles'>{nav.vehicles}</a>
      <a href='/contact'>{nav.contact}</a>
    </nav>
  );
}

// Hook para secciones de home
function WelcomeSection() {
  const home = useHomeSectionsTranslations();

  return (
    <section>
      <h1>{home.welcome.title}</h1>
      <p>{home.welcome.description}</p>
    </section>
  );
}

// Hook para componentes de vehículos
function VehicleCard({ vehicle }) {
  const card = useVehicleCardTranslations();

  return (
    <div>
      <p>
        {card.year}: {vehicle.year}
      </p>
      <p>
        {card.price}: {vehicle.price}
      </p>
      <button>{card.viewDetails}</button>
    </div>
  );
}
```

### 3. Componente T (Compatible con API anterior)

```tsx
import { T } from '@/components/ui/T';

function Example() {
  return (
    <div>
      {/* Usando claves de traducción */}
      <T>vehicles.title</T>

      {/* Con className */}
      <T className='text-lg font-bold'>nav.contact</T>

      {/* Con fallback */}
      <T fallback='Contacto'>nav.contact</T>
    </div>
  );
}
```

### 4. Selector de Idiomas

```tsx
import { LanguageSelector } from '@/components/ui/LanguageSelector';

function MyComponent() {
  return (
    <div>
      {/* Versión completa */}
      <LanguageSelector />

      {/* Versión minimal (para navbar) */}
      <LanguageSelector variant='minimal' />
    </div>
  );
}
```

### 5. Store Zustand

```tsx
import { useLanguageStore, useCurrentLanguage } from '@/store/useLanguageStore';

function MyComponent() {
  const { currentLanguage, setLanguage } = useLanguageStore();
  // O usar el selector específico
  const language = useCurrentLanguage();

  return (
    <div>
      <p>Idioma actual: {currentLanguage}</p>
      <button onClick={() => setLanguage('en')}>Cambiar a inglés</button>
    </div>
  );
}
```

## 🔧 Configuración

### Idiomas Disponibles

```typescript
export const AVAILABLE_LANGUAGES = {
  ES: 'es', // Español (por defecto)
  EN: 'en', // Inglés
} as const;
```

### Persistencia

- **Zustand**: Persiste el idioma seleccionado en `localStorage`
- **i18next**: Detecta automáticamente el idioma del navegador
- **Prioridad**: localStorage > Navegador > Español (por defecto)

## 📝 Agregar Nuevas Traducciones

### 1. Actualizar Tipos

```typescript
// src/i18n/types/index.ts
export interface TranslationKeys {
  // ... existentes
  newSection: {
    title: string;
    description: string;
    // ... más campos
  };
}
```

### 2. Agregar a Todos los Idiomas

```typescript
// src/i18n/locales/es.ts
const es: TranslationKeys = {
  // ... existentes
  newSection: {
    title: 'Título en español',
    description: 'Descripción en español',
  },
};

// Repetir en en.ts
```

### 3. Crear Hook Específico (Opcional)

```typescript
// src/i18n/hooks/useTranslation.ts
export function useNewSectionTranslations() {
  const { t } = useTranslation();

  return {
    title: t('newSection.title'),
    description: t('newSection.description'),
  };
}
```

## 🎯 Mejores Prácticas

### ✅ Hacer

- Usar hooks específicos por sección para mejor organización
- Mantener las claves de traducción descriptivas: `vehicles.sorting.priceAsc`
- Agrupar traducciones relacionadas en objetos
- Usar TypeScript para validar claves de traducción

### ❌ Evitar

- Hardcodear textos directamente en componentes
- Crear claves de traducción muy largas o anidadas profundamente
- Duplicar traducciones en diferentes secciones
- Olvidar agregar traducciones en todos los idiomas

## 🌐 Banderas de Países

El sistema incluye iconos de banderas circulares usando `circle-flags`:

```typescript
export const LANGUAGE_FLAGS: Record<Language, string> = {
  es: 'circle-flags:es', // España
  en: 'circle-flags:us', // Estados Unidos
  fr: 'circle-flags:fr', // Francia
  pt: 'circle-flags:br', // Brasil
  it: 'circle-flags:it', // Italia
  de: 'circle-flags:de', // Alemania
};
```

## 🚨 Migración desde Magic Translate

Si tenías componentes usando Magic Translate `<T>`, puedes:

1. **Mantener la sintaxis**: El componente `T` es compatible
2. **Migrar gradualmente**: Usar hooks específicos para nuevos componentes
3. **Actualizar claves**: Cambiar texto hardcodeado por claves de traducción

```tsx
// Antes (Magic Translate)
<T>Vehículos</T>

// Después (i18n) - Opción 1
<T>vehicles.title</T>

// Después (i18n) - Opción 2
const vehicles = useVehiclesTranslations();
<span>{vehicles.title}</span>
```

## 🎉 ¡Listo para Traducir!

El sistema está completamente configurado y listo para usar. Solo necesitas:

1. ✅ Sistema i18n instalado y configurado
2. ✅ 6 idiomas listos (ES, EN, FR, PT, IT, DE)
3. ✅ Hooks tipados para cada sección
4. ✅ Selector de idiomas con banderas
5. ✅ Persistencia con Zustand
6. ✅ Compatibilidad con API anterior

¡Ahora puedes empezar a aplicar traducciones en tus componentes! 🌍
