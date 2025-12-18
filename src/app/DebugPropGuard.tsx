'use client';
import { useEffect } from 'react';

// Props de Craft.js que causan warnings en React 19
const SUPPRESSED_PROPS = [
  'bgColor', 'textColor', 'showStatuses', 'showFilters', 'titleSize', 'categoryImageSize',
  'filterGlobalColor', 'backgroundType', 'gradientStartColor', 'gradientEndColor',
  'backgroundOpacity', 'backgroundBrightness', 'filterButtonColors', 'cardSettings',
  'newBadgeText', 'globalFilters'
];

export default function DebugPropGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    const originalError = console.error;

    console.error = (...args: any[]) => {
      const message = args[0];

      // Suprimir warnings de props no reconocidos en DOM (Craft.js + React 19)
      if (typeof message === 'string') {
        // Warning: React does not recognize the `X` prop on a DOM element
        if (message.includes('React does not recognize the') && message.includes('prop on a DOM element')) {
          const isPropSuppressed = SUPPRESSED_PROPS.some(prop => message.includes(`\`${prop}\``));
          if (isPropSuppressed) return;
        }

        // Warning: Accessing element.ref was removed in React 19
        if (message.includes('Accessing element.ref was removed in React 19')) {
          return;
        }
      }

      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
