'use client';

import { useTranslation } from '@/i18n/hooks/useTranslation';
import WeSearchForm from '@/components/forms/WeSearchForm';
import BuilderPageWrapper from '@/components/builder2/BuilderPageWrapper';

function TraditionalWeSearch() {
  const { t } = useTranslation();
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white dark:bg-dark-bg transition-colors duration-300'>
      <div className='text-center mb-16'>
        <h1 className='text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl'>
          {t('weSearchForYou.hero.title')}
        </h1>
        <p className='mt-4 text-xl text-gray-500 dark:text-gray-400'>
          {t('weSearchForYou.hero.description')}
        </p>
      </div>
      <WeSearchForm />
    </div>
  );
}

export default function WeSearchForYouPage() {
  return <BuilderPageWrapper slug="we-search-for-you" fallback={<TraditionalWeSearch />} />;
}
