import ContactCTA from '@/sections/home/ContactCTA';
import HowToArrive from '@/sections/home/HowToArrive';
import WelcomeSection from '@/sections/home/WelcomeSection';
import WhyUs from '@/sections/home/WhyUs';
import NewVehiclesSection from '@/sections/vehicles/new-vehicles-section';

export default async function Home() {
  return (
    <div className='pt-16'>
      <WelcomeSection />
      <NewVehiclesSection />
      <HowToArrive />
      <WhyUs />
      <ContactCTA />
    </div>
  );
}
