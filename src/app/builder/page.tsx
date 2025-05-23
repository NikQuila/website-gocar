'use client';
import React, { useEffect, useState } from 'react';
import { Editor, Frame } from '@craftjs/core';
import lz from 'lzutf8';
import { supabase } from '@/lib/supabase';
import useClientStore from '@/store/useClientStore';

export const runtime = 'nodejs';

// Importa aquí todos los componentes que usas en tu builder
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
          setJson(decompressed);
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
    return <div className='p-8 text-center'>Cargando vista previa…</div>;
  }

  if (error) {
    return <div className='p-8 text-center text-red-600'>Error: {error}</div>;
  }

  if (!json) {
    return (
      <div className='p-8 text-center'>No hay contenido para mostrar.</div>
    );
  }

  return (
    <div className='min-h-screen mt-[6vh]'>
      {json && (
        <Editor
          resolver={{
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
            /*, …otros*/
          }}
          enabled={false}
        >
          <div className=''>
            <Frame data={json} />
          </div>
        </Editor>
      )}
    </div>
  );
}
