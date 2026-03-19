'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import lz from 'lzutf8';
import useClientStore from '@/store/useClientStore';
import useThemeStore from '@/store/useThemeStore';

import TraditionalContactCTA from '@/sections/home/ContactCTA';
import WelcomeSection from '@/sections/home/WelcomeSection';
import WhyUs from '@/sections/home/WhyUs';
import NewVehiclesSection from '@/sections/vehicles/new-vehicles-section';

// Lazy-load heavy modules: builder (~30 components + craftjs) y Google Maps
const BuilderRenderer = lazy(() => import('./BuilderRenderer'));
const HowToArrive = lazy(() => import('@/sections/home/HowToArrive'));

export const runtime = 'nodejs';

// =====================
// Sanitizador de Craft state
// =====================
function sanitizeCraftData(state: any, validNames: Set<string>): any {
  if (!state || typeof state !== 'object') return state;

  const isWrapped = state.nodes && typeof state.nodes === 'object';
  const nodes: Record<string, any> = isWrapped ? { ...state.nodes } : { ...state };

  for (const [id, node] of Object.entries(nodes)) {
    if (!node || typeof node !== 'object') { delete nodes[id]; continue; }
    const rn = node.type?.resolvedName;
    if (!rn || typeof rn !== 'string' || !validNames.has(rn)) {
      if (id === 'ROOT') {
        node.type = { resolvedName: 'div' };
      } else {
        delete nodes[id];
        continue;
      }
    }
    if (!Array.isArray(node.nodes)) node.nodes = [];
    if (!node.linkedNodes || typeof node.linkedNodes !== 'object') node.linkedNodes = {};
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

// Known resolver names (must match BuilderRenderer's baseResolver keys)
const RESOLVER_NAMES = new Set([
  'Container', 'Text', 'Image',
  'HeroBasic', 'HeroWithBackground', 'HeroWithLogo', 'HeroWelcome', 'HeroMinimalistic',
  'VehicleGrid', 'VehicleGrid2', 'VehicleCarousel', 'TraditionalVehicleGrid',
  'WhyChooseUs', 'FAQ', 'Testimonials', 'TraditionalWhyUs',
  'ContactCTA', 'TraditionalContactCTA', 'HowToArrive', 'TraditionalHowToArrive',
  'VideoEmbed',
  'HeroModerno', 'StatsModerno', 'TestimonialsModerno', 'CTAModerno', 'FooterModerno',
  'HeroPremium', 'FeatureShowcase', 'TestimonialsPremium', 'GalleryPremium', 'CTAPremium',
  'BuilderNavbar', 'Footer', 'StatsCounter', 'PromoBanner', 'PhotoGallery', 'TeamMembers',
  'div', 'p', 'span', 'img', 'Unknown',
]);

function decompressState(compressed: string): any | null {
  try {
    let parsed: any = lz.decompress(lz.decodeBase64(compressed));
    while (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch { break; }
    }
    return typeof parsed === 'object' && parsed ? sanitizeCraftData(parsed, RESOLVER_NAMES) : null;
  } catch { return null; }
}

// =====================
// Skeleton
// =====================
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg pt-16">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="text-center space-y-6">
          <div className="h-14 sm:h-[72px] max-w-2xl mx-auto rounded-2xl bg-gray-200/50 dark:bg-gray-800/40 animate-pulse" />
          <div className="h-6 sm:h-7 max-w-lg mx-auto rounded-xl bg-gray-200/30 dark:bg-gray-800/25 animate-pulse" />
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="h-14 w-full rounded-2xl bg-gray-100 dark:bg-gray-800/30 animate-pulse" />
          </div>
        </div>
      </div>
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
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800/30" />}>
        <HowToArrive />
      </Suspense>
      <WhyUs />
      <TraditionalContactCTA />
    </div>
  );
}

// =====================
// Componente principal
// =====================
function WebsiteContent() {
  const { client, isLoading: isClientLoading } = useClientStore();
  const { theme, setTheme } = useThemeStore();

  const [lightData, setLightData] = useState<any>(null);
  const [darkData, setDarkData] = useState<any>(null);
  const [mode, setMode] = useState<'loading' | 'traditional' | 'builder'>('loading');

  useEffect(() => {
    if (isClientLoading) return;

    // Use the config already fetched by ClientProvider (no extra query)
    const config = client?.client_website_config;
    const cfg = Array.isArray(config) ? config[0] : config;

    if (!cfg?.is_enabled || !cfg?.elements_structure) {
      setMode('traditional');
      return;
    }

    const raw = String(cfg.elements_structure);
    const serverTheme = cfg.color_scheme === 'DARK' ? 'dark' : 'light';
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

    if (!light && !dark) {
      const single = decompressState(raw);
      if (serverTheme === 'dark') dark = single;
      else light = single;
    }

    if (!light && !dark) {
      setMode('traditional');
      return;
    }

    setLightData(light);
    setDarkData(dark);
    setMode('builder');
  }, [client?.id, isClientLoading]);

  if (mode === 'loading') return <PageSkeleton />;
  if (mode === 'traditional') return <TraditionalContent />;

  const activeData = theme === 'dark' ? (darkData || lightData) : (lightData || darkData);
  if (!activeData) return <TraditionalContent />;

  return (
    <Suspense fallback={<PageSkeleton />}>
      <BuilderRenderer
        data={activeData}
        themeKey={theme}
        fallback={<TraditionalContent />}
      />
    </Suspense>
  );
}

export default function Home() {
  return <WebsiteContent />;
}
