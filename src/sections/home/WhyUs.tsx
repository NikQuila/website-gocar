'use client';

import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useWebsiteConfig } from '@/providers/ClientWebsiteConfigProvider';
import { useTranslation } from '@/i18n/hooks/useTranslation';

interface WhyUsItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const defaultItems: WhyUsItem[] = [
  { id: '1', title: 'Garantía', description: 'Todos nuestros vehículos cuentan con garantía', icon: 'mdi:shield-check' },
  { id: '2', title: 'Financiamiento', description: 'Opciones de financiamiento flexibles', icon: 'mdi:cash-multiple' },
  { id: '3', title: 'Calidad', description: 'Vehículos seleccionados y certificados', icon: 'mdi:certificate' },
];

const WhyUs = () => {
  const { websiteConfig, isLoading } = useWebsiteConfig();
  const { t } = useTranslation();

  const config = useMemo(() => {
    if (isLoading) return null;

    const sectionTitle = websiteConfig?.content?.why_us_title || t('home.whyUs.title');
    const sectionSubtitle = websiteConfig?.content?.why_us_subtitle;

    const items =
      websiteConfig?.why_us_items && Array.isArray(websiteConfig.why_us_items)
        ? websiteConfig.why_us_items
        : defaultItems;

    return { title: sectionTitle, subtitle: sectionSubtitle, items };
  }, [websiteConfig?.content?.why_us_title, websiteConfig?.content?.why_us_subtitle, websiteConfig?.why_us_items, isLoading, t]);

  const items = config?.items || defaultItems;
  const title = config?.title || t('home.whyUs.title');
  const subtitle = config?.subtitle || t('home.whyUs.subtitle');

  return (
    <section className='bg-slate-50/50 dark:bg-dark-bg py-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h2 className='text-3xl font-bold text-gray-900 dark:text-dark-text text-center mb-4'>
          {title}
        </h2>
        <p className='text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto'>
          {subtitle}
        </p>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {items.map((item, i) => (
            <div
              key={item.id || i}
              className='text-center p-6 bg-white dark:bg-[#0B0B0F] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200'
            >
              <div className='flex justify-center mb-4'>
                <Icon icon={item.icon} className='w-12 h-12 text-primary' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 dark:text-dark-text'>
                {item.title}
              </h3>
              <p className='mt-2 text-base text-gray-500 dark:text-gray-400'>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
