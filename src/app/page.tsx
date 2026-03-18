'use client';

import { ClientWebsiteConfigProvider } from '@/providers/ClientWebsiteConfigProvider';
import TraditionalContactCTA from '@/sections/home/ContactCTA';
import WelcomeSection from '@/sections/home/WelcomeSection';
import WhyUs from '@/sections/home/WhyUs';
import NewVehiclesSection from '@/sections/vehicles/new-vehicles-section';
import React, { useEffect, useState, useRef } from 'react';
import { Editor, Frame } from '@craftjs/core';
import lz from 'lzutf8';
import { supabase } from '@/lib/supabase';
import useClientStore from '@/store/useClientStore';
import useThemeStore from '@/store/useThemeStore';

export const runtime = 'nodejs';

// =====================
// Componentes del builder
// =====================
import { Container } from '@/components/builder2/userComponents/Container';
import { Text } from '@/components/builder2/userComponents/Text';
import { Image } from '@/components/builder2/userComponents/Image';
import { HeroBasic, HeroWithBackground, HeroWithLogo, HeroWelcome } from '@/components/builder2/sections/initialfold';
import { HeroMinimalistic } from '@/components/builder2/sections/initialfold/HeroMinimalistic';
import { VehicleGrid } from '@/components/builder2/sections/vehicles';
import { VehicleGrid2 } from '@/components/builder2/sections/vehicles/VehicleGrid2';
import { VehicleCarousel } from '@/components/builder2/sections/vehicles/VehicleCarousel';
import { TraditionalVehicleGrid } from '@/components/builder2/sections/vehicles/TraditionalVehicleGrid';
import { Testimonials } from '@/components/builder2/sections/testimonials';
import { FAQ, WhyChooseUs } from '@/components/builder2/sections/features';
import { TraditionalWhyUs } from '@/components/builder2/sections/features/TraditionalWhyUs';
import { VideoEmbed } from '@/components/builder2/sections/videos/VideoEmbed';
import { ContactCTA } from '@/components/builder2/sections/contact/ContactCTA';
import { TraditionalContactCTA as BuilderTraditionalContactCTA } from '@/components/builder2/sections/contact/TraditionalContactCTA';
import HowToArrive from '@/sections/home/HowToArrive';
import { TraditionalHowToArrive } from '@/components/builder2/sections/contact/TraditionalHowToArrive';
// Moderna sections
import { HeroModerno } from '@/components/builder2/sections/moderna/HeroModerno';
import { StatsModerno } from '@/components/builder2/sections/moderna/StatsModerno';
import { TestimonialsModerno } from '@/components/builder2/sections/moderna/TestimonialsModerno';
import { CTAModerno } from '@/components/builder2/sections/moderna/CTAModerno';
import { FooterModerno } from '@/components/builder2/sections/moderna/FooterModerno';
// Premium sections
import { HeroPremium } from '@/components/builder2/sections/premium/HeroPremium';
import { FeatureShowcase } from '@/components/builder2/sections/premium/FeatureShowcase';
import { TestimonialsPremium } from '@/components/builder2/sections/premium/TestimonialsPremium';
import { GalleryPremium } from '@/components/builder2/sections/premium/GalleryPremium';
import { CTAPremium } from '@/components/builder2/sections/premium/CTAPremium';
// Additional sections
import { Footer } from '@/components/builder2/sections/layout/Footer';
import { BuilderNavbar } from '@/components/builder2/sections/layout/BuilderNavbar';
import { StatsCounter } from '@/components/builder2/sections/marketing/StatsCounter';
import { PromoBanner } from '@/components/builder2/sections/marketing/PromoBanner';
import { PhotoGallery } from '@/components/builder2/sections/media/PhotoGallery';
import { TeamMembers } from '@/components/builder2/sections/team/TeamMembers';

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
  // User components
  Container,
  Text,
  Image,
  // Hero sections
  HeroBasic,
  HeroWithBackground,
  HeroWithLogo,
  HeroWelcome,
  HeroMinimalistic,
  // Vehicle sections
  VehicleGrid,
  VehicleGrid2,
  VehicleCarousel,
  TraditionalVehicleGrid,
  // Feature sections
  WhyChooseUs,
  FAQ,
  Testimonials,
  TraditionalWhyUs,
  // Contact sections
  ContactCTA,
  TraditionalContactCTA: BuilderTraditionalContactCTA,
  HowToArrive,
  TraditionalHowToArrive,
  // Media
  VideoEmbed,
  // Moderna sections
  HeroModerno,
  StatsModerno,
  TestimonialsModerno,
  CTAModerno,
  FooterModerno,
  // Premium sections
  HeroPremium,
  FeatureShowcase,
  TestimonialsPremium,
  GalleryPremium,
  CTAPremium,
  // Layout sections
  BuilderNavbar,
  Footer,
  StatsCounter,
  PromoBanner,
  PhotoGallery,
  TeamMembers,
  // Fallback
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
// Sanitizador simple de Craft state
// =====================
function sanitizeCraftData(state: any): any {
  if (!state || typeof state !== 'object') return state;

  // Get nodes - either wrapped in .nodes or flat
  const isWrapped = state.nodes && typeof state.nodes === 'object';
  const nodes: Record<string, any> = isWrapped ? { ...state.nodes } : { ...state };

  // Fix each node
  for (const [id, node] of Object.entries(nodes)) {
    if (!node || typeof node !== 'object') { delete nodes[id]; continue; }
    const rn = node.type?.resolvedName;
    if (!rn || typeof rn !== 'string' || !(rn in baseResolver)) {
      if (id === 'ROOT') {
        node.type = { resolvedName: 'div' };
      } else {
        // Remove invalid nodes
        delete nodes[id];
        continue;
      }
    }
    if (!Array.isArray(node.nodes)) node.nodes = [];
    if (!node.linkedNodes || typeof node.linkedNodes !== 'object') node.linkedNodes = {};
  }

  // Ensure ROOT exists
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

  // Clean child references
  const validIds = new Set(Object.keys(nodes));
  for (const node of Object.values(nodes)) {
    if (Array.isArray((node as any).nodes)) {
      (node as any).nodes = (node as any).nodes.filter((c: string) => validIds.has(c));
    }
  }

  return isWrapped ? { ...state, nodes } : nodes;
}

// =====================
// Normalizador legacy (unused, kept for reference)
// =====================
function normalizeCraftTree(raw: any) {
  if (!raw || typeof raw !== 'object') return raw;

  // If it's somehow still a string, parse it
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { return raw; }
  }

  let nodes: Record<string, any> | null = null;

  if (raw.nodes && typeof raw.nodes === 'object') {
    nodes = { ...raw.nodes };
  } else {
    // Accept any key that has a "type" property (craft.js node) or is ROOT
    const keys = Object.keys(raw).filter((k) => {
      const v = raw[k];
      return k === 'ROOT' || (v && typeof v === 'object' && ('type' in v || 'props' in v));
    });
    if (keys.length) {
      nodes = {};
      for (const k of keys) nodes[k] = { ...(raw as any)[k] };
    }
  }

  if (!nodes) return raw;

  const ensureTypeObj = (node: any) => {
    if (!node) return node;

    const t = node.type;
    if (!t || t === 'undefined') {
      node.type = { resolvedName: 'Unknown' };
      node.displayName = 'Unknown';
    } else if (typeof t === 'string') {
      node.type = { resolvedName: t };
      node.displayName = t;
    } else if (typeof t === 'object' && t !== null) {
      const rn = t.resolvedName;
      if (!rn || typeof rn !== 'string' || rn === 'undefined') {
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

  // List of real component names in the resolver
  const resolverNames = new Set(Object.keys(baseResolver));

  const validIds = Object.keys(nodes).filter((id) => nodes![id] && typeof nodes![id] === 'object');
  const map: Record<string, any> = {};
  for (const id of validIds) {
    const node = ensureTypeObj({ ...nodes[id] });
    const rn = node?.type?.resolvedName;
    // Only keep nodes with valid resolver names (or ROOT which is always 'div')
    if (id === 'ROOT' || (rn && resolverNames.has(rn))) {
      map[id] = node;
    }
    // else: skip this node entirely — it will be cleaned from parent's children below
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
    map.ROOT = { ...map.ROOT };
    map.ROOT.nodes = Array.isArray(map.ROOT.nodes) ? map.ROOT.nodes : [];
    map.ROOT.linkedNodes = map.ROOT.linkedNodes || {};
  }

  // ROOT must always be 'div' with isCanvas
  map.ROOT.type = { resolvedName: 'div' };
  map.ROOT.displayName = map.ROOT.displayName || 'App Canvas';
  map.ROOT.isCanvas = true;
  map.ROOT.parent = null;
  if (!map.ROOT.props) map.ROOT.props = {};

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
      <TraditionalContactCTA />
    </div>
  );
}

// =====================
// Error Boundary para Builder
// =====================
class BuilderErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// =====================
// Contenido del Builder
// =====================
function BuilderContent({ data, themeKey }: { data: any; themeKey: string }) {
  return (
    <div className="min-h-screen">
      <BuilderErrorBoundary fallback={<TraditionalContent />}>
        <Editor key={themeKey} resolver={resolver} enabled={false}>
          <Frame data={data} />
        </Editor>
      </BuilderErrorBoundary>
    </div>
  );
}

// =====================
// Componente principal
// =====================
// Helper: decompress a base64+lzutf8 string → parsed object
function decompressState(compressed: string): any | null {
  try {
    let parsed: any = lz.decompress(lz.decodeBase64(compressed));
    while (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch { break; }
    }
    return typeof parsed === 'object' && parsed ? sanitizeCraftData(parsed) : null;
  } catch { return null; }
}

function WebsiteContent() {
  const { client, isLoading: isClientLoading } = useClientStore();
  const { theme, setTheme } = useThemeStore();

  // Store both theme states (already parsed & sanitized) + loading status
  const [lightData, setLightData] = useState<any>(null);
  const [darkData, setDarkData] = useState<any>(null);
  const [mode, setMode] = useState<'loading' | 'traditional' | 'builder'>('loading');

  // Fetch config once
  useEffect(() => {
    if (isClientLoading) return;
    if (!client?.id) { setMode('traditional'); return; }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('client_website_config')
          .select('is_enabled, elements_structure, color_scheme')
          .eq('client_id', client.id)
          .single();

        if (cancelled) return;
        if (!data?.is_enabled || !data?.elements_structure) { setMode('traditional'); return; }

        const raw = String(data.elements_structure);
        const serverTheme = data.color_scheme === 'DARK' ? 'dark' : 'light';

        // Sync theme store with server default
        setTheme(serverTheme as 'light' | 'dark');

        // Parse v2 envelope or legacy
        let light: any = null;
        let dark: any = null;
        try {
          const envelope = JSON.parse(raw);
          if (envelope?.v === 2) {
            light = decompressState(envelope.light);
            dark = decompressState(envelope.dark);
          }
        } catch {}

        // Legacy single-theme format
        if (!light && !dark) {
          const single = decompressState(raw);
          if (serverTheme === 'dark') dark = single;
          else light = single;
        }

        if (!light && !dark) { setMode('traditional'); return; }

        if (!cancelled) {
          setLightData(light);
          setDarkData(dark);
          setMode('builder');
        }
      } catch {
        if (!cancelled) setMode('traditional');
      }
    })();
    return () => { cancelled = true; };
  }, [client?.id, isClientLoading]);
  if (mode === 'loading') return <PageSkeleton />;
  if (mode === 'traditional') return <TraditionalContent />;

  // Pick the data for the active theme, fallback to whichever exists
  const activeData = theme === 'dark' ? (darkData || lightData) : (lightData || darkData);
  if (!activeData) return <TraditionalContent />;

  return <BuilderContent data={activeData} themeKey={theme} />;
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
