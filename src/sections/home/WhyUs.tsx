import { Icon } from '@iconify/react';

const features = [
  {
    title: 'Garantía',
    description: 'Todos nuestros vehículos cuentan con garantía',
    icon: 'mdi:shield-check',
  },
  {
    title: 'Financiamiento',
    description: 'Opciones de financiamiento flexibles',
    icon: 'mdi:cash-multiple',
  },
  {
    title: 'Calidad',
    description: 'Vehículos seleccionados y certificados',
    icon: 'mdi:certificate',
  },
];

const WhyUs = () => {
  return (
    <section className='bg-gray-50 py-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h2 className='text-3xl font-bold text-gray-900 text-center mb-12'>
          ¿Por qué elegirnos?
        </h2>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature, i) => (
            <div
              key={i}
              className='text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200'
            >
              <div className='flex justify-center mb-4'>
                <Icon icon={feature.icon} className='w-12 h-12 text-primary' />
              </div>
              <h3 className='text-lg font-medium text-gray-900'>
                {feature.title}
              </h3>
              <p className='mt-2 text-base text-gray-500'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
