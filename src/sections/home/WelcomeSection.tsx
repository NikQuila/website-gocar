'use client';

import { useEffect, useState } from 'react';
import useClientStore from '../../store/useClientStore';
import AISearchBar from '@/components/search/AISearchBar';
import { useWebsiteConfig } from '@/providers/ClientWebsiteConfigProvider';

interface WelcomeSectionConfig {
  title: string;
  subtitle: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  subtitleColor: string;
}

export default function WelcomeSection() {
  const { client } = useClientStore();
  const { websiteConfig, isLoading: isConfigLoading } = useWebsiteConfig();
  const [config, setConfig] = useState<WelcomeSectionConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConfigLoading) return;

    try {
      // Process the configuration from the context
      if (websiteConfig) {
        console.log('Processing website config from context:', websiteConfig);

        // Use content from the ClientWebsiteConfig
        let sectionConfig: WelcomeSectionConfig | null = null;

        console.log('content available:', Boolean(websiteConfig.content));

        if (websiteConfig.content) {
          // Use content from the standard structure
          sectionConfig = {
            title:
              websiteConfig.content.hero_title ||
              'Encuentra tu próximo vehículo en',
            subtitle:
              websiteConfig.content.hero_subtitle ||
              'Describe el vehículo de tus sueños y deja que nuestra IA encuentre las mejores opciones para ti.',
            primaryColor: websiteConfig.theme?.primary_color || '#0F172A',
            backgroundColor: '#FFFFFF',
            textColor: '#111827',
            subtitleColor: '#4B5563',
          };
          console.log('Using content from config:', sectionConfig);
        }

        if (sectionConfig) {
          console.log('Final configuration to apply:', sectionConfig);
          setConfig(sectionConfig);
        } else {
          console.warn('No valid configuration found to apply');
        }
      }
    } catch (error) {
      console.error('Error processing website configuration:', error);
    }

    setIsLoading(false);
  }, [websiteConfig, isConfigLoading]);

  // If there's no configuration or it's loading, show the default design
  if (isLoading || !config) {
    return (
      <div className='bg-white dark:bg-dark-bg transition-colors'>
        <div className='relative isolate overflow-hidden'>
          <div className='mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8'>
            {/* Hero content - Centered */}
            <div className='text-center'>
              <h1
                className='text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl max-w-3xl mx-auto'
                style={{ lineHeight: '1.1' }}
              >
                Encuentra tu próximo vehículo en{' '}
                <span className='text-primary'>{client?.name}</span>
              </h1>

              <p className='mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
                Describe el vehículo de tus sueños y deja que nuestra IA
                encuentre las mejores opciones para ti.
              </p>

              <div className='mt-8 w-full'>
                {client && (
                  <AISearchBar clientId={client.id} clientName={client.name} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the section with the custom configuration
  return (
    <div className='bg-white dark:bg-dark-bg transition-colors'>
      <div className='relative isolate overflow-hidden'>
        <div className='mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8'>
          {/* Hero content - Centered */}
          <div className='text-center'>
            <h1
              className='text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl max-w-3xl mx-auto'
              style={{ lineHeight: '1.1' }}
            >
              {config.title}{' '}
              <span className='text-primary'>{client?.name}</span>
            </h1>

            <p className='mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
              {config.subtitle}
            </p>

            <div className='mt-8 w-full'>
              {client && (
                <AISearchBar clientId={client.id} clientName={client.name} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
