'use client';

import { Button, Input, Spinner } from '@heroui/react';
import useClientStore from '../../store/useClientStore';
import { useState, useRef } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import { IoSearch, IoChevronForward, IoChevronBack } from 'react-icons/io5';
import { generateAIQuery, searchVehicles } from '@/lib/vehicles';
import { Vehicle, Customer, Lead } from '@/utils/types';
import VehicleVerticalCard from '@/components/vehicles/VehicleVerticalCard';
import { CustomerDataModal } from '@/components/customers/CustomerDataModal';
import { supabase } from '@/lib/supabase';
import { updateLeadById } from '@/lib/leads';

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 4,
    slidesToSlide: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

export default function WelcomeSection() {
  const { client } = useClientStore();
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [generatedLead, setGeneratedLead] = useState<Lead | null>(null);
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setMatchCount(null);
    setVehicles([]);
    setSearchParams(null);
    setShowThankYouMessage(false);

    try {
      // First, get the search parameters from OpenAI
      const aiQuery = await generateAIQuery(query, client?.id || '');
      setSearchParams(aiQuery.search_params);
      setGeneratedLead(aiQuery.lead);
      // Then, search in Supabase with the generated parameters
      const { vehicles, count } = await searchVehicles(aiQuery.search_params);
      setVehicles(vehicles);
      setMatchCount(count);

      // If no vehicles found, check if customer exists
      if (count === 0) {
        await handleNoResults();
      }
    } catch (error) {
      console.error('Error during search:', error);
      setSearchParams({ error: 'Error en la búsqueda' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoResults = async () => {
    // Check if we have a customer email in localStorage
    const storedEmail = localStorage.getItem('customerEmail');
    if (storedEmail) {
      // Check if customer exists
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('*')
        .eq('email', storedEmail)
        .limit(1);

      if (existingCustomers && existingCustomers.length > 0) {
        // Customer exists, update lead directly
        if (generatedLead) {
          await updateLeadById(generatedLead.id, {
            customer_id: existingCustomers[0].id,
          });
          setShowThankYouMessage(true);
        }
      } else {
        setShowCustomerModal(true);
      }
    } else {
      setShowCustomerModal(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        handleSearch(transcript);
      };

      recognition.start();
    } else {
      alert('La entrada por voz no está soportada en este navegador.');
    }
  };

  const handleSaveCustomer = async (
    customerData: Omit<Customer, 'id' | 'created_at'>
  ) => {
    try {
      // First check if customer exists
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('*')
        .eq('email', customerData.email)
        .limit(1);

      let customerId;

      if (existingCustomers && existingCustomers.length > 0) {
        // Update existing customer
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            first_name: customerData.first_name,
            last_name: customerData.last_name,
            phone: customerData.phone,
          })
          .eq('id', existingCustomers[0].id);

        if (updateError) throw updateError;
        customerId = existingCustomers[0].id;
      } else {
        // Create new customer
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert([{ ...customerData, created_at: new Date().toISOString() }])
          .select()
          .single();

        if (createError) throw createError;
        customerId = newCustomer.id;
      }

      // Store email in localStorage for future searches
      localStorage.setItem('customerEmail', customerData.email);

      // Update the lead with the customer id
      if (searchParams && generatedLead) {
        await updateLeadById(generatedLead.id, {
          customer_id: customerId,
        });
      }

      setShowCustomerModal(false);
      setShowThankYouMessage(true);
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error al guardar los datos del cliente');
    }
  };

  return (
    <div className='bg-white dark:bg-dark-bg transition-colors'>
      <div className='relative isolate overflow-hidden'>
        <div className='mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8'>
          {/* Hero content - Centered */}
          <div className='text-center max-w-3xl mx-auto'>
            <h1 className='text-4xl font-bold text-gray-900 dark:text-white sm:text-6xl'>
              Encuentra tu próximo vehículo en{' '}
              <span className='text-primary'>{client?.name}</span>
            </h1>
            <p className='mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
              Describe el vehículo de tus sueños y deja que nuestra IA encuentre
              las mejores opciones para ti.
            </p>

            {/* AI Search Bar */}
            <div className='mt-8 max-w-2xl mx-auto'>
              <div className='relative'>
                <Input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder='Busco una Ford Explorer de bajo kilometraje...'
                  size='lg'
                  radius='lg'
                  className='w-full'
                  isDisabled={isLoading}
                  endContent={
                    <div className='flex items-center gap-2'>
                      {isLoading ? (
                        <Spinner size='sm' />
                      ) : (
                        <>
                          <button
                            onClick={() => handleSearch(searchQuery)}
                            className='p-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors disabled:opacity-50'
                            disabled={isLoading}
                          >
                            <IoSearch size={20} />
                          </button>
                          <button
                            onClick={startVoiceRecognition}
                            className={`p-2 ${
                              isListening
                                ? 'text-primary'
                                : 'text-gray-600 dark:text-gray-400'
                            } hover:text-primary dark:hover:text-primary transition-colors disabled:opacity-50`}
                            disabled={isLoading}
                          >
                            <FaMicrophone size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  }
                />
              </div>

              {/* Search Results Display */}
              {(searchParams || matchCount !== null) && (
                <div className='mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left'>
                  {matchCount !== null && (
                    <p className='text-lg font-medium text-gray-900 dark:text-white mb-3'>
                      {matchCount === 0
                        ? 'No se encontraron vehículos que coincidan exactamente con tu búsqueda'
                        : `Se encontraron ${matchCount} vehículo${
                            matchCount === 1 ? '' : 's'
                          }`}
                    </p>
                  )}
                  {searchParams && !searchParams.error && (
                    <div className='space-y-4'>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>
                        <p className='font-medium mb-2'>Estamos buscando:</p>
                        <ul className='list-disc list-inside space-y-1'>
                          {searchParams.brand && (
                            <li>Marca: {searchParams.brand}</li>
                          )}
                          {searchParams.model && (
                            <li>Modelo: {searchParams.model}</li>
                          )}
                          {searchParams.year?.min && (
                            <li>Año desde: {searchParams.year.min}</li>
                          )}
                          {searchParams.year?.max && (
                            <li>Año hasta: {searchParams.year.max}</li>
                          )}
                          {searchParams.price?.min && (
                            <li>
                              Precio desde: $
                              {searchParams.price.min.toLocaleString()}
                            </li>
                          )}
                          {searchParams.price?.max && (
                            <li>
                              Precio hasta: $
                              {searchParams.price.max.toLocaleString()}
                            </li>
                          )}
                          {searchParams.mileage?.max && (
                            <li>
                              Kilometraje máximo:{' '}
                              {searchParams.mileage.max.toLocaleString()} km
                            </li>
                          )}
                          {searchParams.transmission && (
                            <li>Transmisión: {searchParams.transmission}</li>
                          )}
                          {searchParams.fuel_type && (
                            <li>Combustible: {searchParams.fuel_type}</li>
                          )}
                          {searchParams.color && (
                            <li>Color: {searchParams.color}</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Vehicle Results */}
              {vehicles.length > 0 && (
                <div className='mt-8 relative'>
                  <div className='absolute left-0 top-1/2 transform -translate-y-1/2 z-10'>
                    <Button
                      isIconOnly
                      variant='light'
                      onClick={() => handleScroll('left')}
                      className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'
                    >
                      <IoChevronBack size={24} />
                    </Button>
                  </div>
                  <div className='absolute right-0 top-1/2 transform -translate-y-1/2 z-10'>
                    <Button
                      isIconOnly
                      variant='light'
                      onClick={() => handleScroll('right')}
                      className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'
                    >
                      <IoChevronForward size={24} />
                    </Button>
                  </div>
                  <div
                    ref={scrollContainerRef}
                    className='flex overflow-x-auto gap-4 px-2 pb-4 scrollbar-hide'
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className='flex-none w-[300px]'>
                        <VehicleVerticalCard vehicle={vehicle} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {matchCount === 0 && !showThankYouMessage && (
                <div className='mt-8 text-center'>
                  <p className='text-gray-600 dark:text-gray-400 mb-4'>
                    ¡No te preocupes! Déjanos tus datos y te avisaremos cuando
                    llegue un vehículo que coincida con tu búsqueda.
                  </p>
                  <Button
                    color='primary'
                    size='lg'
                    onClick={() => setShowCustomerModal(true)}
                  >
                    Notificarme cuando haya coincidencias
                  </Button>
                </div>
              )}

              {/* Thank You Message */}
              {showThankYouMessage && (
                <div className='mt-8 text-center'>
                  <p className='text-xl font-semibold text-primary mb-2'>
                    ¡Gracias por tu interés!
                  </p>
                  <p className='text-gray-600 dark:text-gray-400 mb-4'>
                    Te notificaremos cuando encontremos vehículos que coincidan
                    con tu búsqueda.
                  </p>
                  <p className='text-gray-600 dark:text-gray-400'>
                    Mientras tanto, te invitamos a explorar{' '}
                    <button
                      onClick={() => {
                        window.scrollTo({
                          top: window.innerHeight,
                          behavior: 'smooth',
                        });
                      }}
                      className='text-primary hover:underline font-medium'
                    >
                      todos nuestros vehículos disponibles
                    </button>{' '}
                    justo debajo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Data Modal */}
      <CustomerDataModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSave={handleSaveCustomer}
        title='¡Buscamos el vehículo por ti!'
        description='Te notificaremos cuando encontremos tu vehículo a un buen precio.'
      />
    </div>
  );
}
