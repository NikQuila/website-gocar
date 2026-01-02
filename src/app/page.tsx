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
// Skeleton genérico (funciona para ambos casos)
// =====================
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg pt-16">
      {/* Hero grande */}
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="text-center space-y-6">
          <div className="h-14 sm:h-[72px] max-w-2xl mx-auto rounded-2xl bg-gray-200/50 dark:bg-gray-800/40 animate-pulse" />
          <div className="h-6 sm:h-7 max-w-lg mx-auto rounded-xl bg-gray-200/30 dark:bg-gray-800/25 animate-pulse" />
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="h-14 w-full rounded-2xl bg-gray-100 dark:bg-gray-800/30 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Grid de cards */}
      <div className="bg-gray-50/50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white dark:bg-[#0B0B0F] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800/30 shadow-sm">
                <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-800/30 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-gray-200/50 dark:bg-gray-800/30 animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-gray-200/30 dark:bg-gray-800/20 animate-pulse" />
                  <div className="h-6 w-2/5 rounded bg-gray-200/40 dark:bg-gray-800/30 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
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
// Componente principal
// =====================
function WebsiteContent() {
  const { client, isLoading: isClientLoading } = useClientStore();
  const [content, setContent] = useState<{ type: 'loading' | 'traditional' | 'builder'; data?: any }>({ type: 'loading' });
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || isClientLoading) return;
    loadedRef.current = true;

    (async () => {
      if (!client?.id) {
        setContent({ type: 'traditional' });
        return;
      }

      try {
        const { data } = await supabase
          .from('client_website_config')
          .select('is_enabled, elements_structure')
          .eq('client_id', client.id)
          .single();

        if (!data?.is_enabled || !data?.elements_structure) {
          setContent({ type: 'traditional' });
          return;
        }

        const decompressed = JSON.parse(lz.decompress(lz.decodeBase64(data.elements_structure)));
        setContent({ type: 'builder', data: normalizeCraftTree(decompressed) });
      } catch {
        setContent({ type: 'traditional' });
      }
    })();
  }, [client?.id, isClientLoading]);

  // Loading → skeleton genérico
  if (content.type === 'loading') {
    return <PageSkeleton />;
  }

  // Builder → contenido del builder
  if (content.type === 'builder') {
    return <BuilderContent data={content.data} />;
  }

  // Tradicional → contenido tradicional
  return <TraditionalContent />;
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
