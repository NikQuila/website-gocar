'use client';

import {
  ClientWebsiteConfigProvider,
  useWebsiteConfig,
} from '@/providers/ClientWebsiteConfigProvider';
import ContactCTA from '@/sections/home/ContactCTA';
import VehiclesSectionSkeleton from '@/sections/home/VehiclesSectionSkeleton';
import WelcomeSection from '@/sections/home/WelcomeSection';
import WelcomeSectionSkeleton from '@/sections/home/WelcomeSectionSkeleton';
import WhyUs from '@/sections/home/WhyUs';
import NewVehiclesSection from '@/sections/vehicles/new-vehicles-section';
import { Suspense, useEffect, useState } from 'react';
import { Editor, Frame } from '@craftjs/core';
import lz from 'lzutf8';
import { supabase } from '@/lib/supabase';
import useClientStore from '@/store/useClientStore';
export const runtime = 'nodejs';

// Importa todos los componentes del builder
import { Container } from '@/components/builder2/userComponents/Container';
import { Text } from '@/components/builder2/userComponents/Text';
import { Image } from '@/components/builder2/userComponents/Image';
import {
  HeroBasic,
  HeroWithBackground,
} from '@/components/builder2/sections/initialfold';
import { VehicleGrid } from '@/components/builder2/sections/vehicles';
import { HeroMinimalistic } from '@/components/builder2/sections/initialfold/HeroMinimalistic';
import { Testimonials } from '@/components/builder2/sections/testimonials';
import { FAQ, WhyChooseUs } from '@/components/builder2/sections/features';
import { VehicleCarousel } from '@/components/builder2/sections/vehicles/VehicleCarousel';
import { VideoEmbed } from '@/components/builder2/sections/videos/VideoEmbed';
import HowToArrive from '@/sections/home/HowToArrive';

// Generic Skeleton loader component
function GenericSkeleton() {
  return (
    <div className='animate-pulse space-y-8 pt-16'>
      {/* Hero section skeleton */}
      <div className='mx-auto max-w-7xl px-4'>
        <div className='h-96 w-full rounded-lg bg-gray-200'></div>
        <div className='mt-6 h-10 w-1/3 rounded bg-gray-200'></div>
        <div className='mt-4 h-6 w-1/2 rounded bg-gray-200'></div>
      </div>

      {/* Content sections skeletons */}
      <div className='mx-auto max-w-7xl px-4'>
        <div className='h-8 w-1/4 rounded bg-gray-200'></div>
        <div className='mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='h-64 rounded-lg bg-gray-200'></div>
          ))}
        </div>
      </div>

      {/* Additional section skeleton */}
      <div className='mx-auto max-w-7xl px-4'>
        <div className='h-8 w-1/4 rounded bg-gray-200'></div>
        <div className='mt-6 h-64 w-full rounded-lg bg-gray-200'></div>
      </div>
    </div>
  );
}

// Componente para renderizar el contenido de CraftJS
function CraftJSContent() {
  const { client, isLoading: isClientLoading } = useClientStore();
  const [json, setJson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback component for unknown CraftJS nodes
  const Unknown: React.FC = () => null;

  // Centralized resolver including fallback
  const resolver = {
    Container,
    Text,
    Image,
    HeroBasic,
    HeroWithBackground,
    VehicleGrid,
    HeroMinimalistic,
    Testimonials,
    FAQ,
    WhyChooseUs,
    VehicleCarousel,
    VideoEmbed,
    HowToArrive,
    Unknown,
  } as const;

  // Sanitize CraftJS state to avoid undefined types
  function sanitizeCraftState(state: any) {
    if (!state || typeof state !== 'object') {
      return state;
    }

    const ensureType = (node: any) => {
      if (!node) return node;
      const resolvedName = node?.type?.resolvedName;
      if (!resolvedName || !(resolvedName in resolver)) {
        node.type = { resolvedName: 'Unknown' };
        node.displayName = 'Unknown';
      }
      return node;
    };

    // CraftJS serialized formats can vary; handle both shapes
    if (state.nodes && typeof state.nodes === 'object') {
      // Newer shape: { nodes: { id: node } }
      const originalNodes = state.nodes as Record<string, any>;
      const validIds = Object.keys(originalNodes).filter((id) => {
        const n = originalNodes[id];
        return n && typeof n === 'object';
      });

      const sanitizedMap: Record<string, any> = {};
      for (const id of validIds) {
        sanitizedMap[id] = ensureType({ ...originalNodes[id] });
      }

      // Filter child references to only existing nodes
      for (const id of Object.keys(sanitizedMap)) {
        const node = sanitizedMap[id];
        if (Array.isArray(node.nodes)) {
          node.nodes = node.nodes.filter((childId: string) =>
            validIds.includes(childId)
          );
        }
        if (node.linkedNodes && typeof node.linkedNodes === 'object') {
          const ln: Record<string, string> = node.linkedNodes;
          for (const key of Object.keys(ln)) {
            if (!validIds.includes(ln[key])) {
              delete ln[key];
            }
          }
          node.linkedNodes = ln;
        }
      }

      return { ...state, nodes: sanitizedMap };
    }

    // Older shape: top-level keys for ROOT and others
    const next: any = { ...state };
    for (const key of Object.keys(next)) {
      if (key === 'ROOT' || key.startsWith('node')) {
        next[key] = ensureType({ ...next[key] });
      }
    }
    return next;
  }

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
        } else {
          const decompressed = JSON.parse(
            lz.decompress(lz.decodeBase64(data.elements_structure))
          );

          // Validar que los datos descomprimidos sean válidos
          const sanitized = sanitizeCraftState(decompressed);
          setJson(sanitized);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar el estado');
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

  if (isLoading) {
    return <GenericSkeleton />;
  }

  if (error) {
    return <div className='p-8 text-center text-red-600'>Error: {error}</div>;
  }

  if (!json) {
    return <TraditionalContent />;
  }

  return (
    <div className='min-h-screen '>
      {json && (
        <div style={{ margin: '0 auto', padding: '0px' }}>
          <Editor resolver={resolver} enabled={false}>
            <Frame data={json} />
          </Editor>
        </div>
      )}
    </div>
  );
}

// Componente para renderizar las secciones tradicionales
function TraditionalContent() {
  const { websiteConfig, isLoading } = useWebsiteConfig();

  // Si todavía está cargando, mostramos el skeleton
  if (isLoading) {
    return <GenericSkeleton />;
  }

  // Renderizar todas las secciones tradicionales
  return (
    <div className='pt-16'>
      <Suspense fallback={<GenericSkeleton />}>
        <WelcomeSection />
      </Suspense>
      <Suspense fallback={<GenericSkeleton />}>
        <NewVehiclesSection />
      </Suspense>
      <Suspense fallback={<GenericSkeleton />}>
        <HowToArrive />
      </Suspense>
      <Suspense fallback={<GenericSkeleton />}>
        <WhyUs />
      </Suspense>
      <Suspense fallback={<GenericSkeleton />}>
        <ContactCTA />
      </Suspense>
    </div>
  );
}

// Componente para decidir qué contenido mostrar basado en is_enabled
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

  if (isConfigLoading) {
    return <GenericSkeleton />;
  }

  // Verificar si está habilitado el website customizado con craftjs
  if (isEnabled) {
    return (
      <div className='mt-[6vh]'>
        <CraftJSContent />
      </div>
    );
  }

  // Si no está habilitado, mostrar el contenido tradicional
  return <TraditionalContent />;
}

// Componente principal exportado
export default function Home() {
  const { client, isLoading: isClientLoading } = useClientStore();

  if (isClientLoading) {
    return <GenericSkeleton />;
  }

  return (
    <ClientWebsiteConfigProvider>
      <WebsiteContent />
    </ClientWebsiteConfigProvider>
  );
}
