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

interface WhyUsProps {
  bgColor?: string;
  textColor?: string;
  subtitleColor?: string;
  cardBgColor?: string;
  accentColor?: string;
}

const WhyUs = ({ bgColor, textColor, subtitleColor, cardBgColor, accentColor }: WhyUsProps = {}) => {
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
    <section
      className={!bgColor ? 'bg-slate-50/50 dark:bg-dark-bg py-16' : 'py-16'}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h2
          className={!textColor ? 'text-3xl font-bold text-gray-900 dark:text-dark-text text-center mb-4' : 'text-3xl font-bold text-center mb-4'}
          style={textColor ? { color: textColor } : undefined}
        >
          {title}
        </h2>
        <p
          className={!subtitleColor ? 'text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto' : 'text-center mb-12 max-w-3xl mx-auto'}
          style={subtitleColor ? { color: subtitleColor } : undefined}
        >
          {subtitle}
        </p>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {items.map((item, i) => (
            <div
              key={item.id || i}
              className={!cardBgColor ? 'text-center p-6 bg-white dark:bg-dark-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 dark:border dark:border-dark-border' : 'text-center p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200'}
              style={cardBgColor ? { backgroundColor: cardBgColor } : undefined}
            >
              <div className='flex justify-center mb-4'>
                <Icon icon={item.icon} className='w-12 h-12' style={accentColor ? { color: accentColor } : undefined} />
              </div>
              <h3
                className={!textColor ? 'text-lg font-medium text-gray-900 dark:text-dark-text' : 'text-lg font-medium'}
                style={textColor ? { color: textColor } : undefined}
              >
                {item.title}
              </h3>
              <p
                className={!subtitleColor ? 'mt-2 text-base text-gray-500 dark:text-gray-400' : 'mt-2 text-base'}
                style={subtitleColor ? { color: subtitleColor } : undefined}
              >
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
