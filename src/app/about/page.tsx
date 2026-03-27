'use client';

import { usePageBuilder } from '@/hooks/usePageBuilder';
import BuilderRenderer from '../BuilderRenderer';
import useClientStore from '@/store/useClientStore';

const AboutPage = () => {
  const { builderData } = usePageBuilder('about');
  const { client } = useClientStore();

  if (builderData) {
    return <BuilderRenderer data={builderData} />;
  }

  // Default static content
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white dark:bg-dark-bg transition-colors duration-300'>
      <div className='text-center mb-16'>
        <h1 className='text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl'>
          Nosotros
        </h1>
        <p className='mt-4 text-xl text-gray-500 dark:text-gray-400'>
          Conoce más sobre {client?.name || 'nosotros'}
        </p>
      </div>
      <div className='text-center py-16'>
        <p className='text-gray-400'>Esta página estará disponible próximamente.</p>
      </div>
    </div>
  );
};

export default AboutPage;
