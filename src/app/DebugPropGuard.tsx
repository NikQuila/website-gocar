'use client';
import * as React from 'react';

const WATCH = new Set([
  'bgColor','textColor','showStatuses','showFilters','titleSize','categoryImageSize',
  'filterGlobalColor','backgroundType','gradientStartColor','gradientEndColor',
  'backgroundOpacity','backgroundBrightness','filterButtonColors','cardSettings',
  'newBadgeText','globalFilters'
]);

const DOM_TAGS = new Set([
  'div','span','section','header','footer','main','button','a','img','ul','li','p',
  'h1','h2','h3','h4','h5','h6','nav','aside','article','label','input','textarea',
  'select','form','small','strong','em','figure','figcaption','canvas','video','audio',
  'table','thead','tbody','tr','td','th'
]);

export default function DebugPropGuard({ children }: { children?: React.ReactNode }) {
  if (process.env.NODE_ENV === 'production') return null;

  const validateNode = (node: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(node)) return node;

    const type = node.type as any;

    if (typeof type === 'string' && DOM_TAGS.has(type)) {
      const props = (node as any).props ?? {};
      const badKeys = Object.keys(props).filter((k) => WATCH.has(k));
      if (badKeys.length) {
        // Nombre del componente que creó este elemento (dev only)
        // NOTA: _owner sólo existe en development
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const owner = (node as any)._owner;
        const ownerType = owner?.type;
        const ownerName =
          ownerType?.displayName || ownerType?.name || '(owner desconocido)';

        console.groupCollapsed(
          `⚠️ Prop(s) no DOM ${badKeys.map((k) => `"${k}"`).join(', ')} en <${type}> (owner: ${ownerName})`
        );
        console.log('Props:', props);
        console.trace('Origen (stack):');
        console.groupEnd();
      }
    }

    const children = (node as any).props?.children;
    if (!children) return node;

    const nextChildren = React.Children.map(children, (child) => validateNode(child));
    if (nextChildren === children) return node;

    return React.cloneElement(node, undefined, nextChildren);
  };

  return <>{validateNode(children)}</>;
}
