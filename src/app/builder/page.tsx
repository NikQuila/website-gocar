'use client';
import React, { useEffect, useState } from 'react';
import { Editor, Frame } from '@craftjs/core';
import lz from 'lzutf8';
import { supabase } from '@/lib/supabase';
import useClientStore from '@/store/useClientStore';

export const runtime = 'nodejs';

// === Importa EXACTAMENTE los mismos componentes que usas en el admin ===
import { Container } from '@/components/builder2/userComponents/Container';
import { Text } from '@/components/builder2/userComponents/Text';
import { Image } from '@/components/builder2/userComponents/Image';
import {
  HeroBasic,
  HeroWithBackground,
  HeroWithLogo,
} from '@/components/builder2/sections/initialfold';
import { VehicleGrid } from '@/components/builder2/sections/vehicles';
import { HeroMinimalistic } from '@/components/builder2/sections/initialfold/HeroMinimalistic';
import { Testimonials } from '@/components/builder2/sections/testimonials';
import { FAQ, WhyChooseUs } from '@/components/builder2/sections/features';
import { VehicleCarousel } from '@/components/builder2/sections/vehicles/VehicleCarousel';
import { VideoEmbed } from '@/components/builder2/sections/videos/VideoEmbed';
import HowToArrive from '@/sections/home/HowToArrive';

// 👈 Importa VehicleGrid2 por su ruta real
import { VehicleGrid2 } from '@/components/builder2/sections/vehicles/VehicleGrid2';

// ---------- Fallback seguro (con .craft) ----------
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

// ---------- Resolver ----------
const resolver = {
  Container,
  Text,
  Image,
  HeroBasic,
  HeroWithBackground,
  HeroWithLogo,
  VehicleGrid,
  VehicleGrid2, // 👈 AÑADIDO
  HeroMinimalistic,
  Testimonials,
  FAQ,
  WhyChooseUs,
  VehicleCarousel,
  VideoEmbed,
  HowToArrive,

  // Fallbacks por si en el JSON vienen etiquetas sueltas
  div: Unknown,
  p: Unknown,
  span: Unknown,
  img: Unknown,

  // Fallback explícito
  Unknown,
} as const;

// ---------- Sanitizador: blinda cualquier nodo roto ----------
function sanitizeCraftState(state: any) {
  if (!state || typeof state !== 'object') return state;

  const ensureType = (node: any) => {
    if (!node) return node;
    const resolvedName = node?.type?.resolvedName;
    if (!resolvedName || !(resolvedName in resolver)) {
      node.type = { resolvedName: 'Unknown' };
      node.displayName = 'Unknown';
    }
    return node;
  };

  if (state.nodes && typeof state.nodes === 'object') {
    const originalNodes = state.nodes as Record<string, any>;
    const validIds = Object.keys(originalNodes).filter((id) => {
      const n = originalNodes[id];
      return n && typeof n === 'object';
    });

    const sanitizedMap: Record<string, any> = {};
    for (const id of validIds) {
      sanitizedMap[id] = ensureType({ ...originalNodes[id] });
    }

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
          if (!validIds.includes(ln[key])) delete ln[key];
        }
        node.linkedNodes = ln;
      }
    }
    return { ...state, nodes: sanitizedMap };
  }

  const next: any = { ...state };
  for (const key of Object.keys(next)) {
    if (key === 'ROOT' || key.startsWith('node')) {
      next[key] = ensureType({ ...next[key] });
    }
  }
  return next;
}

export default function WebsitePage() {
  const { client, isLoading: isClientLoading } = useClientStore();
  const [json, setJson] = useState<any>(null);
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
        } else {
          const decompressed = JSON.parse(
            lz.decompress(lz.decodeBase64(data.elements_structure))
          );
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

  if (isLoading) return <div className="p-8 text-center">Cargando vista previa…</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  if (!json) return <div className="p-8 text-center">No hay contenido para mostrar.</div>;

  return (
    <div className="min-h-screen mt-[6vh]">
      <Editor resolver={resolver} enabled={false}>
        <div>
          <Frame data={json} />
        </div>
      </Editor>
    </div>
  );
}
