'use client';

import {
  ClientWebsiteConfigProvider,
  useWebsiteConfig,
} from '@/providers/ClientWebsiteConfigProvider';
import ContactCTA from '@/sections/home/ContactCTA';
import HowToArrive from '@/sections/home/HowToArrive';
import VehiclesSectionSkeleton from '@/sections/home/VehiclesSectionSkeleton';
import WelcomeSection from '@/sections/home/WelcomeSection';
import WelcomeSectionSkeleton from '@/sections/home/WelcomeSectionSkeleton';
import WhyUs from '@/sections/home/WhyUs';
import NewVehiclesSection from '@/sections/vehicles/new-vehicles-section';
import { Suspense } from 'react';

// Componente Skeleton para mostrar mientras carga la configuración

// Componente para renderizar las secciones según la configuración
function WebsiteContent() {
  const { websiteConfig, isLoading } = useWebsiteConfig();

  // Mapeo de claves de sección a componentes
  const sectionComponents = {
    hero: (
      <Suspense key='hero' fallback={<div>Loading welcome section...</div>}>
        <WelcomeSection />
      </Suspense>
    ),
    catalog: (
      <Suspense key='catalog' fallback={<div>Loading vehicles section...</div>}>
        <NewVehiclesSection />
      </Suspense>
    ),
    map: (
      <Suspense
        key='map'
        fallback={<div>Loading how to arrive section...</div>}
      >
        <HowToArrive />
      </Suspense>
    ),
    whyUs: (
      <Suspense key='whyUs' fallback={<div>Loading why us section...</div>}>
        <WhyUs />
      </Suspense>
    ),
    contact: (
      <Suspense key='contact' fallback={<div>Loading contact section...</div>}>
        <ContactCTA />
      </Suspense>
    ),
  };

  // Si todavía está cargando, mostramos el skeleton
  if (isLoading) {
    return (
      <>
        <WelcomeSectionSkeleton />
        <div className='mt-16'>
          <VehiclesSectionSkeleton />
        </div>
      </>
    );
  }

  // Si no hay configuración o no tiene secciones, mostramos todas las secciones
  if (!websiteConfig || !websiteConfig.sections) {
    return (
      <div className='pt-16'>
        <Suspense fallback={<div>Loading welcome section...</div>}>
          <WelcomeSection />
        </Suspense>
        <Suspense fallback={<div>Loading vehicles section...</div>}>
          <NewVehiclesSection />
        </Suspense>
        <Suspense fallback={<div>Loading how to arrive section...</div>}>
          <HowToArrive />
        </Suspense>
        <Suspense fallback={<div>Loading why us section...</div>}>
          <WhyUs />
        </Suspense>
        <Suspense fallback={<div>Loading contact section...</div>}>
          <ContactCTA />
        </Suspense>
      </div>
    );
  }

  // Obtener las secciones ordenadas y habilitadas
  const orderedSections = Object.entries(websiteConfig.sections)
    .filter(([_, sectionData]) => sectionData.enabled) // Solo secciones habilitadas
    .sort((a, b) => a[1].order - b[1].order) // Ordenar por el campo 'order'
    .map(([sectionKey]) => sectionKey);

  // Renderizar las secciones habilitadas en el orden correcto
  return (
    <div className='pt-16'>
      {orderedSections.map((sectionKey) => {
        const sectionComponent =
          sectionComponents[sectionKey as keyof typeof sectionComponents];
        return sectionComponent || null;
      })}
    </div>
  );
}

// Componente principal exportado
export default function Home() {
  return (
    <ClientWebsiteConfigProvider>
      <WebsiteContent />
    </ClientWebsiteConfigProvider>
  );
}
