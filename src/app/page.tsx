'use client';

import { ClientWebsiteConfigProvider } from '@/providers/ClientWebsiteConfigProvider';
import ContactCTA from '@/sections/home/ContactCTA';
import WelcomeSection from '@/sections/home/WelcomeSection';
import WhyUs from '@/sections/home/WhyUs';
import NewVehiclesSection from '@/sections/vehicles/new-vehicles-section';
import { useEffect, useState, useRef } from 'react';
import { Editor, Frame } from '@craftjs/core';
import lz from 'lzutf8';
import { supabase } from '@/lib/supabase';
import useClientStore from '@/store/useClientStore';

export const runtime = 'nodejs';

// =====================
// Componentes del builder
// =====================
import { Container } from '@/components/builder2/userComponents/Container';
import { Text } from '@/components/builder2/userComponents/Text';
import { Image } from '@/components/builder2/userComponents/Image';
import { HeroBasic, HeroWithBackground, HeroWithLogo } from '@/components/builder2/sections/initialfold';
import { VehicleGrid } from '@/components/builder2/sections/vehicles';
import { HeroMinimalistic } from '@/components/builder2/sections/initialfold/HeroMinimalistic';
import { Testimonials } from '@/components/builder2/sections/testimonials';
import { FAQ, WhyChooseUs } from '@/components/builder2/sections/features';
import { VehicleCarousel } from '@/components/builder2/sections/vehicles/VehicleCarousel';
import { VideoEmbed } from '@/components/builder2/sections/videos/VideoEmbed';
import HowToArrive from '@/sections/home/HowToArrive';
import { VehicleGrid2 } from '@/components/builder2/sections/vehicles/VehicleGrid2';

// =====================
// Fallback seguro
// =====================
const Unknown: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div style={{ display: 'contents' }}>{children}</div>
);
// @ts-ignore
(Unknown as any).craft = {
  displayName: 'Unknown',
  isCanvas: true,
  rules: {},
  props: {},
};

// =====================
// Resolver con Proxy
// =====================
const baseResolver: Record<string, any> = {
  Container,
  Text,
  Image,
  HeroBasic,
  HeroWithBackground,
  HeroWithLogo,
  VehicleGrid,
  VehicleGrid2,
  HeroMinimalistic,
  Testimonials,
  FAQ,
  WhyChooseUs,
  VehicleCarousel,
  VideoEmbed,
  HowToArrive,
  div: Unknown,
  p: Unknown,
  span: Unknown,
  img: Unknown,
  Unknown,
};

const resolver = new Proxy(baseResolver, {
  get(target, prop: string) {
    return prop in target ? (target as any)[prop] : Unknown;
  },
});

// =====================
// Normalizador de Craft state
// =====================
function normalizeCraftTree(raw: any) {
  if (!raw || typeof raw !== 'object') return raw;

  let nodes: Record<string, any> | null = null;

  if (raw.nodes && typeof raw.nodes === 'object') {
    nodes = { ...raw.nodes };
  } else {
    const keys = Object.keys(raw).filter((k) => k === 'ROOT' || k.startsWith('node'));
    if (keys.length) {
      nodes = {};
      for (const k of keys) nodes[k] = { ...(raw as any)[k] };
    }
  }

  if (!nodes) return raw;

  const ensureTypeObj = (node: any) => {
    if (!node) return node;

    const t = node.type;
    if (typeof t === 'string') {
      node.type = { resolvedName: t };
      node.displayName = t;
    } else if (typeof t === 'object' && t !== null) {
      const rn = t.resolvedName;
      if (!rn || typeof rn !== 'string') {
        node.type = { resolvedName: 'Unknown' };
        node.displayName = 'Unknown';
      } else {
        node.displayName = node.displayName || rn;
      }
    } else {
      node.type = { resolvedName: 'Unknown' };
      node.displayName = 'Unknown';
    }

    const rn = node.type?.resolvedName;
    if (!rn || !(rn in resolver)) {
      node.type = { resolvedName: 'Unknown' };
      node.displayName = 'Unknown';
    }

    if (!Array.isArray(node.nodes)) node.nodes = [];
    if (!node.linkedNodes || typeof node.linkedNodes !== 'object') node.linkedNodes = {};

    return node;
  };

  const validIds = Object.keys(nodes).filter((id) => nodes![id] && typeof nodes![id] === 'object');
  const map: Record<string, any> = {};
  for (const id of validIds) {
    map[id] = ensureTypeObj({ ...nodes[id] });
  }

  const idSet = new Set(Object.keys(map));
  for (const id of Object.keys(map)) {
    const node = map[id];
    node.nodes = Array.isArray(node.nodes) ? node.nodes.filter((c: string) => idSet.has(c)) : [];
    if (node.linkedNodes && typeof node.linkedNodes === 'object') {
      const ln = { ...node.linkedNodes };
      Object.keys(ln).forEach((slot) => {
        if (!idSet.has(ln[slot])) delete ln[slot];
      });
      node.linkedNodes = ln;
    } else {
      node.linkedNodes = {};
    }
  }

  if (!map.ROOT) {
    const referenced = new Set<string>();
    for (const id of Object.keys(map)) {
      for (const c of map[id].nodes || []) referenced.add(c);
      Object.values(map[id].linkedNodes || {}).forEach((v: any) => referenced.add(v));
    }
    const candidates = Object.keys(map).filter((id) => !referenced.has(id));
    const rootId = candidates[0] || Object.keys(map)[0];
    map.ROOT = {
      type: { resolvedName: 'Unknown' },
      displayName: 'ROOT',
      isCanvas: true,
      nodes: rootId && rootId !== 'ROOT' ? [rootId] : [],
      linkedNodes: {},
      props: {},
      custom: {},
      parent: null,
    };
  } else {
    map.ROOT = ensureTypeObj({ ...map.ROOT });
    map.ROOT.isCanvas = true;
    map.ROOT.nodes = Array.isArray(map.ROOT.nodes) ? map.ROOT.nodes : [];
    map.ROOT.linkedNodes = map.ROOT.linkedNodes || {};
  }

  return { nodes: map };
}

// =====================
// Loader elegante
// =====================
function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-dark-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
      </div>
    </div>
  );
}

// =====================
// Contenido tradicional
// =====================
function TraditionalContent() {
  return (
    <div className="pt-16">
      <WelcomeSection />
      <NewVehiclesSection minimal />
      <HowToArrive />
      <WhyUs />
      <ContactCTA />
    </div>
  );
}

// =====================
// Contenido del Builder
// =====================
function BuilderContent({ data }: { data: any }) {
  return (
    <div className="min-h-screen mt-[6vh]">
      <Editor resolver={resolver} enabled={false}>
        <Frame data={data} />
      </Editor>
    </div>
  );
}

// =====================
// Componente principal con carga unificada
// =====================
function WebsiteContent() {
  const { client, isLoading: isClientLoading } = useClientStore();
  const [pageState, setPageState] = useState<{
    status: 'loading' | 'ready';
    mode: 'builder' | 'traditional';
    builderData: any;
  }>({
    status: 'loading',
    mode: 'traditional',
    builderData: null,
  });
  const [isVisible, setIsVisible] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Evitar doble carga
    if (hasLoadedRef.current) return;

    const loadEverything = async () => {
      // Esperar a que el cliente esté listo
      if (isClientLoading) return;
      if (!client?.id) {
        hasLoadedRef.current = true;
        setPageState({ status: 'ready', mode: 'traditional', builderData: null });
        // Pequeño delay para transición suave
        requestAnimationFrame(() => setIsVisible(true));
        return;
      }

      try {
        // Cargar config Y estructura en paralelo
        const [configResult, structureResult] = await Promise.all([
          supabase
            .from('client_website_config')
            .select('is_enabled')
            .eq('client_id', client.id)
            .single(),
          supabase
            .from('client_website_config')
            .select('elements_structure')
            .eq('client_id', client.id)
            .single(),
        ]);

        const isEnabled = !!configResult.data?.is_enabled;

        if (isEnabled && structureResult.data?.elements_structure) {
          try {
            const decompressed = JSON.parse(
              lz.decompress(lz.decodeBase64(structureResult.data.elements_structure))
            );
            const normalized = normalizeCraftTree(decompressed);
            hasLoadedRef.current = true;
            setPageState({ status: 'ready', mode: 'builder', builderData: normalized });
          } catch {
            // Si falla el parsing, usar tradicional
            hasLoadedRef.current = true;
            setPageState({ status: 'ready', mode: 'traditional', builderData: null });
          }
        } else {
          hasLoadedRef.current = true;
          setPageState({ status: 'ready', mode: 'traditional', builderData: null });
        }
      } catch {
        hasLoadedRef.current = true;
        setPageState({ status: 'ready', mode: 'traditional', builderData: null });
      }

      // Transición suave
      requestAnimationFrame(() => setIsVisible(true));
    };

    loadEverything();
  }, [client?.id, isClientLoading]);

  // Mostrar loader mientras carga
  if (pageState.status === 'loading') {
    return <PageLoader />;
  }

  return (
    <div
      className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {pageState.mode === 'builder' && pageState.builderData ? (
        <BuilderContent data={pageState.builderData} />
      ) : (
        <TraditionalContent />
      )}
    </div>
  );
}

// =====================
// Export principal
// =====================
export default function Home() {
  return (
    <ClientWebsiteConfigProvider>
      <WebsiteContent />
    </ClientWebsiteConfigProvider>
  );
}
