import { ClientWebsiteConfigProvider } from '@/providers/ClientWebsiteConfigProvider';
import ContactCTA from '@/sections/home/ContactCTA';
import HowToArrive from '@/sections/home/HowToArrive';
import WelcomeSection from '@/sections/home/WelcomeSection';
import WhyUs from '@/sections/home/WhyUs';
import NewVehiclesSection from '@/sections/vehicles/new-vehicles-section';
import { Suspense } from 'react';

export default function Home() {
  return (
    <ClientWebsiteConfigProvider>
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
    </ClientWebsiteConfigProvider>
  );
}
