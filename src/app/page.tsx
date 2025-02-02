import ContactCTA from '@/sections/home/ContactCTA';
import HowToArrive from '@/sections/home/HowToArrive';
import WelcomeSection from '@/sections/home/WelcomeSection';
import WhyUs from '@/sections/home/WhyUs';

export default async function Home() {
  return (
    <div className='pt-16'>
      <WelcomeSection />
      <HowToArrive />
      <WhyUs />
      <ContactCTA />
    </div>
  );
}
