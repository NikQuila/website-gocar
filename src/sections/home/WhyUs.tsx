'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useWebsiteConfig } from '@/providers/ClientWebsiteConfigProvider';
import useClientStore from '@/store/useClientStore';

interface WhyUsItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface WhyUsConfig {
  title: string;
  items: WhyUsItem[];
}

const defaultItems = [
  {
    id: '1',
    title: 'Garantía',
    description: 'Todos nuestros vehículos cuentan con garantía',
    icon: 'mdi:shield-check',
  },
  {
    id: '2',
    title: 'Financiamiento',
    description: 'Opciones de financiamiento flexibles',
    icon: 'mdi:cash-multiple',
  },
  {
    id: '3',
    title: 'Calidad',
    description: 'Vehículos seleccionados y certificados',
    icon: 'mdi:certificate',
  },
];

const WhyUs = () => {
  const { client } = useClientStore();
  const { websiteConfig, isLoading: isConfigLoading } = useWebsiteConfig();
  const [config, setConfig] = useState<WhyUsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConfigLoading) return;

    try {
      // Process the configuration from the context
      if (websiteConfig) {
        console.log('Processing website config for WhyUs:', websiteConfig);

        // Check if we have why_us_items in the config
        let whyUsConfig: WhyUsConfig | null = null;

        // Default section title
        const sectionTitle = '¿Por qué elegirnos?';

        if (
          websiteConfig.why_us_items &&
          Array.isArray(websiteConfig.why_us_items)
        ) {
          whyUsConfig = {
            title: sectionTitle,
            items: websiteConfig.why_us_items,
          };
          console.log('Using why_us_items from config:', whyUsConfig);
        } else {
          // Use default items
          whyUsConfig = {
            title: sectionTitle,
            items: defaultItems,
          };
          console.log('Using default items for WhyUs section');
        }

        if (whyUsConfig) {
          console.log('Final WhyUs configuration:', whyUsConfig);
          setConfig(whyUsConfig);
        } else {
          console.warn('No valid configuration found for WhyUs section');
        }
      }
    } catch (error) {
      console.error('Error processing WhyUs configuration:', error);
    }

    setIsLoading(false);
  }, [websiteConfig, isConfigLoading]);

  // If there's no configuration or it's loading, show the default design
  if (isLoading || !config) {
    return (
      <section className='bg-gray-50 dark:bg-dark-bg py-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl font-bold text-gray-900 dark:text-dark-text text-center mb-12'>
            ¿Por qué elegirnos?
          </h2>
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {defaultItems.map((feature, i) => (
              <div
                key={i}
                className='text-center p-6 bg-white dark:bg-dark-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 dark:border dark:border-dark-border dark:hover:border-primary/30'
              >
                <div className='flex justify-center mb-4'>
                  <Icon
                    icon={feature.icon}
                    className='w-12 h-12 text-primary'
                  />
                </div>
                <h3 className='text-lg font-medium text-gray-900 dark:text-dark-text'>
                  {feature.title}
                </h3>
                <p className='mt-2 text-base text-gray-500 dark:text-gray-400'>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show the section with the custom configuration
  return (
    <section className='bg-gray-50 dark:bg-dark-bg py-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h2 className='text-3xl font-bold text-gray-900 dark:text-dark-text text-center mb-12'>
          {config.title}
        </h2>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {config.items.map((item, i) => (
            <div
              key={item.id || i}
              className='text-center p-6 bg-white dark:bg-dark-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 dark:border dark:border-dark-border dark:hover:border-primary/30'
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
