'use client';

import ContactForm from '@/components/forms/ContactForm';
import BuilderPageWrapper from '@/components/builder2/BuilderPageWrapper';

function TraditionalContact() {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white dark:bg-dark-bg transition-colors duration-300'>
      <div className='text-center mb-16'>
        <p className='mt-4 text-xl text-gray-500 dark:text-gray-400'>
          Estamos aqui para ayudarte. Envianos un mensaje y te responderemos lo
          antes posible.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}

export default function ContactPage() {
  return <BuilderPageWrapper slug="contact" fallback={<TraditionalContact />} />;
}
