// src/app/consignments/page.tsx
'use client';

import { useTranslation } from '@/i18n/hooks/useTranslation';
import ConsignmentsForm from '@/components/forms/ConsignmentsForm';
import { usePageBuilder } from '@/hooks/usePageBuilder';
import BuilderRenderer from '../BuilderRenderer';

const ConsignmentsPage = () => {
  const { t } = useTranslation();
  const { builderData } = usePageBuilder('consignments');

  if (builderData) {
    return <BuilderRenderer data={builderData} />;
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white dark:bg-dark-bg transition-colors duration-300'>
      {/* Hero Section */}
      <div className='text-center mb-16'>
        <h1 className='text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl'>
          {t('consignments.hero.title')}
        </h1>
        <p className='mt-4 text-xl text-gray-500 dark:text-gray-400'>
          {t('consignments.hero.description')}
        </p>
      </div>

      <ConsignmentsForm />
    </div>
  );
};

export default ConsignmentsPage;
