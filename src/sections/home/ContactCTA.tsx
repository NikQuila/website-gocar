const ContactCTA = () => {
  return (
    <section className='bg-primary'>
      <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between'>
        <h2 className='text-3xl font-extrabold tracking-tight text-white sm:text-4xl'>
          <span className='block'>
            ¿Listo para encontrar tu próximo vehículo?
          </span>
          <span className='block text-secondary'>Contáctanos hoy mismo.</span>
        </h2>
        <div className='mt-8 flex lg:mt-0 lg:flex-shrink-0'>
          <div className='inline-flex rounded-md shadow'>
            <a
              href='/contact'
              className='inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-semibold rounded-md text-primary bg-secondary hover:scale-105 transition-all duration-300'
            >
              Contactar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
