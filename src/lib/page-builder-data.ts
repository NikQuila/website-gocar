import lz from 'lzutf8';
import { baseResolver } from '@/app/BuilderRenderer';

export type PageSlug = 'home' | 'financing' | 'consignments' | 'buy-direct' | 'we-search-for-you' | 'contact' | 'about';

// Build RESOLVER_NAMES from the actual resolver so it's always in sync
const RESOLVER_NAMES = new Set([
  ...Object.keys(baseResolver),
  'div', 'p', 'span', 'img', 'Unknown',
]);

/**
 * Sanitizes CraftJS node tree — removes unknown components, fixes ROOT, cleans orphans.
 * Same logic as page.tsx's sanitizeCraftData.
 */
function sanitizeCraftData(state: any): any {
  if (!state || typeof state !== 'object') return state;

  const isWrapped = state.nodes && typeof state.nodes === 'object';
  const nodes: Record<string, any> = isWrapped ? { ...state.nodes } : { ...state };

  for (const [id, node] of Object.entries(nodes)) {
    if (!node || typeof node !== 'object') { delete nodes[id]; continue; }
    const rn = (node as any).type?.resolvedName;
    if (!rn || typeof rn !== 'string' || !RESOLVER_NAMES.has(rn)) {
      if (id === 'ROOT') {
        (node as any).type = { resolvedName: 'div' };
      } else {
        delete nodes[id];
        continue;
      }
    }
    if (!Array.isArray((node as any).nodes)) (node as any).nodes = [];
    if (!(node as any).linkedNodes || typeof (node as any).linkedNodes !== 'object') (node as any).linkedNodes = {};
  }

  if (!nodes.ROOT) {
    const childIds = Object.keys(nodes);
    nodes.ROOT = {
      type: { resolvedName: 'div' }, isCanvas: true, props: {},
      displayName: 'App Canvas', custom: {}, parent: null,
      nodes: childIds, linkedNodes: {},
    };
  }
  nodes.ROOT.isCanvas = true;
  nodes.ROOT.parent = null;

  const validIds = new Set(Object.keys(nodes));
  for (const node of Object.values(nodes)) {
    if (Array.isArray((node as any).nodes)) {
      (node as any).nodes = (node as any).nodes.filter((c: string) => validIds.has(c));
    }
  }

  return isWrapped ? { ...state, nodes } : nodes;
}

function decompressState(compressed: string): any | null {
  try {
    let parsed: any = lz.decompress(lz.decodeBase64(compressed));
    while (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch { break; }
    }
    return typeof parsed === 'object' && parsed ? sanitizeCraftData(parsed) : null;
  } catch {
    return null;
  }
}

/**
 * Extracts and decompresses builder data for a specific page from the website config.
 * Supports v3 (multi-page), v2 (home-only dual-theme), and legacy formats.
 */
export function getPageBuilderData(
  config: any,
  pageSlug: PageSlug,
  theme: 'light' | 'dark'
): any | null {
  if (!config?.is_enabled || !config?.elements_structure) return null;

  const raw = String(config.elements_structure);

  try {
    const envelope = JSON.parse(raw);

    if (envelope?.v === 3) {
      const pageData = envelope.pages?.[pageSlug];
      if (!pageData) return null;
      const compressed = theme === 'dark' ? (pageData.dark || pageData.light) : (pageData.light || pageData.dark);
      if (!compressed) return null;
      return decompressState(compressed);
    }

    if (envelope?.v === 2) {
      if (pageSlug !== 'home') return null;
      const compressed = theme === 'dark' ? (envelope.dark || envelope.light) : (envelope.light || envelope.dark);
      if (!compressed) return null;
      return decompressState(compressed);
    }
  } catch {
    // Not JSON envelope
  }

  if (pageSlug === 'home') {
    return decompressState(raw);
  }

  return null;
}
