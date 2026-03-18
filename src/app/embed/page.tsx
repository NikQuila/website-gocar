'use client';

// Embed page — renders the traditional landing sections without navbar/footer
// Each section can be loaded individually via ?section= param
// or all sections at once (default)

import WelcomeSection from '@/sections/home/WelcomeSection';
import NewVehiclesSection from '@/sections/vehicles/new-vehicles-section';
import HowToArrive from '@/sections/home/HowToArrive';
import WhyUs from '@/sections/home/WhyUs';
import TraditionalContactCTA from '@/sections/home/ContactCTA';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ClientWebsiteConfigProvider } from '@/providers/ClientWebsiteConfigProvider';

function EmbedContent() {
  const params = useSearchParams();
  const section = params.get('section');

  // Single section mode
  if (section) {
    switch (section) {
      case 'welcome':
        return <WelcomeSection />;
      case 'vehicles':
        return <NewVehiclesSection minimal />;
      case 'how-to-arrive':
        return <HowToArrive />;
      case 'why-us':
        return (
          <ClientWebsiteConfigProvider>
            <WhyUs />
          </ClientWebsiteConfigProvider>
        );
      case 'contact':
        return <TraditionalContactCTA />;
      default:
        return <p>Unknown section: {section}</p>;
    }
  }

  // All sections (default)
  return (
    <ClientWebsiteConfigProvider>
      <div>
        <WelcomeSection />
        <NewVehiclesSection minimal />
        <HowToArrive />
        <WhyUs />
        <TraditionalContactCTA />
      </div>
    </ClientWebsiteConfigProvider>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<div className='flex items-center justify-center min-h-[200px]'><div className='animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-primary' /></div>}>
      <EmbedContent />
    </Suspense>
  );
}
