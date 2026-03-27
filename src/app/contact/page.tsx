'use client';

import ContactForm from '@/components/forms/ContactForm';
import { usePageBuilder } from '@/hooks/usePageBuilder';
import BuilderRenderer from '../BuilderRenderer';

const ContactPage = () => {
  const { builderData } = usePageBuilder('contact');

  if (builderData) {
    return <BuilderRenderer data={builderData} />;
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white dark:bg-dark-bg transition-colors duration-300'>
      {/* Hero Section */}
      <div className='text-center mb-16'>
        <p className='mt-4 text-xl text-gray-500 dark:text-gray-400'>
          Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo
          antes posible.
        </p>
      </div>

      <ContactForm />
    </div>
  );
};

export default ContactPage;
