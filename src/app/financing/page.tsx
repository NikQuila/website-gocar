'use client';

import { useTranslation } from '@/i18n/hooks/useTranslation';
import FinancingForm from '@/components/forms/FinancingForm';
import { usePageBuilder } from '@/hooks/usePageBuilder';
import BuilderRenderer from '../BuilderRenderer';

const FinancingPage = () => {
  const { t } = useTranslation();
  const { builderData } = usePageBuilder('financing');

  if (builderData) {
    return <BuilderRenderer data={builderData} />;
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white dark:bg-dark-bg transition-colors duration-300'>
      {/* Hero Section */}
      <div className='text-center mb-16'>
        <h1 className='text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl'>
          {t('financing.hero.title')}
        </h1>
        <p className='mt-4 text-xl text-gray-500 dark:text-gray-400'>
          {t('financing.hero.description')}
        </p>
      </div>

      <FinancingForm />
    </div>
  );
};

export default FinancingPage;
