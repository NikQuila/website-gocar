'use client';

import { ClientWebsiteConfigProvider } from '@/providers/ClientWebsiteConfigProvider';
import ContactCTA from '@/sections/home/ContactCTA';
import WelcomeSection from '@/sections/home/WelcomeSection';
import WhyUs from '@/sections/home/WhyUs';
import NewVehiclesSection from '@/sections/vehicles/new-vehicles-section';
import { useEffect, useState } from 'react';
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
// 👇 añade el nuevo
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

  // etiquetas sueltas que pueden venir en el JSON
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
// Normalizador TOTAL de Craft state
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

  // limpiar nulos y normalizar
  const validIds = Object.keys(nodes).filter((id) => nodes![id] && typeof nodes![id] === 'object');
  const map: Record<string, any> = {};
  for (const id of validIds) {
    map[id] = ensureTypeObj({ ...nodes[id] });
  }

  // limpiar referencias a hijos inexistentes
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

  // garantizar ROOT válido
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
// CraftJSContent (usa normalizador)
// =====================
function CraftJSContent() {
  const { client, isLoading: isClientLoading } = useClientStore();
  const [safeData, setSafeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchState = async () => {
      if (!client?.id) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('client_website_config')
          .select('elements_structure')
          .eq('client_id', client.id)
          .single();

        if (error) throw error;
        if (!data?.elements_structure) {
          setError('No hay estado guardado para este cliente.');
          setSafeData(null);
          return;
        }

        const decompressed = JSON.parse(lz.decompress(lz.decodeBase64(data.elements_structure)));
        const normalized = normalizeCraftTree(decompressed);
        setSafeData(normalized);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el estado');
        setSafeData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (client?.id) {
      fetchState();
    } else if (!isClientLoading) {
      setIsLoading(false);
    }
  }, [client?.id, isClientLoading]);

  if (isLoading) return null;
  if (error || !safeData) return <TraditionalContent />;

  return (
    <div className="min-h-screen">
      <Editor resolver={resolver} enabled={false}>
        <Frame data={safeData} />
      </Editor>
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
// Selector de contenido (is_enabled)
// =====================
function WebsiteContent() {
  const { client } = useClientStore();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isConfigLoading, setIsConfigLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkWebsiteConfig = async () => {
      if (!client?.id) {
        setIsConfigLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('client_website_config')
          .select('is_enabled')
          .eq('client_id', client.id)
          .single();
        if (error) throw error;
        setIsEnabled(!!data?.is_enabled);
      } catch (err) {
        console.error('Error checking website config:', err);
        setIsEnabled(false);
      } finally {
        setIsConfigLoading(false);
      }
    };
    checkWebsiteConfig();
  }, [client?.id]);

  if (isConfigLoading) return null;
  return isEnabled ? (
    <div className="mt-[6vh]">
      <CraftJSContent />
    </div>
  ) : (
    <TraditionalContent />
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
