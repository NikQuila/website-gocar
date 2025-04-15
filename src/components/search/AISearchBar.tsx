'use client';

import { Button, Input, Spinner } from '@heroui/react';
import { useState, useRef } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import { IoSearch, IoChevronForward, IoChevronBack } from 'react-icons/io5';
import { generateAIQuery, searchVehicles } from '@/lib/vehicles';
import { Vehicle, Customer, Lead } from '@/utils/types';
import VehicleCarousel from '@/components/vehicles/VehicleCarousel';
import { CustomerDataModal } from '@/components/customers/CustomerDataModal';
import { supabase } from '@/lib/supabase';
import { updateLeadById } from '@/lib/leads';
import useVehiclesStore from '@/store/useVehiclesStore';
import useThemeStore from '@/store/useThemeStore';
import useCustomerStore from '@/store/useCustomerStore';

interface AISearchBarProps {
  clientId: string;
  clientName: string;
}

export default function AISearchBar({
  clientId,
  clientName,
}: AISearchBarProps) {
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [generatedLead, setGeneratedLead] = useState<Lead | null>(null);
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);

  const { vehicles: allVehicles } = useVehiclesStore();
  const { theme } = useThemeStore();
  const { initializeCustomer } = useCustomerStore();

  const filterVehiclesLocally = (params: any) => {
    return allVehicles.filter((vehicle) => {
      let matches = true;

      // Match brand
      if (
        params.brand &&
        vehicle.brand?.name?.toLowerCase() !== params.brand.toLowerCase()
      ) {
        matches = false;
      }

      // Match model
      if (
        params.model &&
        vehicle.model?.name?.toLowerCase() !== params.model.toLowerCase()
      ) {
        matches = false;
      }

      // Match year range
      if (params.year) {
        if (params.year.min && vehicle.year < params.year.min) matches = false;
        if (params.year.max && vehicle.year > params.year.max) matches = false;
      }

      // Match price range
      if (params.price) {
        if (params.price.min && vehicle.price < params.price.min)
          matches = false;
        if (params.price.max && vehicle.price > params.price.max)
          matches = false;
      }

      // Match mileage range
      if (params.mileage) {
        if (params.mileage.min && vehicle.mileage < params.mileage.min)
          matches = false;
        if (params.mileage.max && vehicle.mileage > params.mileage.max)
          matches = false;
      }

      // Match transmission
      if (
        params.transmission &&
        vehicle.transmission?.toLowerCase() !==
          params.transmission.toLowerCase()
      ) {
        matches = false;
      }

      // Match fuel type
      if (
        params.fuel_type &&
        vehicle.fuel_type?.name?.toLowerCase() !==
          params.fuel_type.toLowerCase()
      ) {
        matches = false;
      }

      // Match condition
      if (
        params.condition &&
        vehicle.condition?.name?.toLowerCase() !==
          params.condition.toLowerCase()
      ) {
        matches = false;
      }

      // Match color
      if (
        params.color &&
        vehicle.color?.name?.toLowerCase() !== params.color.toLowerCase()
      ) {
        matches = false;
      }

      return matches;
    });
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
      const aiQuery = await generateAIQuery(query, clientId);
      setSearchParams(aiQuery.search_params);
      setGeneratedLead(aiQuery.lead);

      // Filter vehicles locally instead of making a backend call
      const filteredVehicles = filterVehiclesLocally(aiQuery.search_params);
      setVehicles(filteredVehicles);
      setMatchCount(filteredVehicles.length);
    } catch (error) {
      console.error('Error during search:', error);
      setSearchParams({ error: 'Error en la búsqueda' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotifyClick = async () => {
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
    setIsSavingCustomer(true);

    if (!clientId) {
      alert('Error al guardar los datos del cliente: clientId es requerido');
      setIsSavingCustomer(false);
      return;
    }

    try {
      const customer = await initializeCustomer({
        ...customerData,
        client_id: clientId,
      });

      localStorage.setItem('customerEmail', customerData.email);

      if (searchParams && generatedLead) {
        await updateLeadById(generatedLead.id, {
          customer_id: customer.id,
        });
      }

      setShowCustomerModal(false);
      setShowThankYouMessage(true);
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error al guardar los datos del cliente');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  return (
    <div className=' mx-auto max-w-2xl'>
      <div className='relative max-w-2xl mx-auto'>
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
      <div className='max-w-2xl mx-auto'>
        {(searchParams || matchCount !== null) && !showThankYouMessage && (
          <div className='mt-4 p-4 bg-gray-100 dark:bg-dark-card rounded-lg text-left'>
            {matchCount !== null && (
              <div className='text-center  mb-3'>
                <p className='text-lg font-medium text-gray-900 dark:text-white'>
                  {matchCount === 0
                    ? 'No se encontraron vehículos que coincidan exactamente con tu búsqueda'
                    : `Se ${
                        matchCount === 1 ? 'encontró' : 'encontraron'
                      } ${matchCount} vehículo${matchCount === 1 ? '' : 's'}`}
                </p>
                <div className='mt-4'>
                  <p className='text-gray-600 dark:text-gray-400 mb-4'>
                    {matchCount === 0
                      ? '¿Te gustaría que te avisemos cuando llegue un vehículo que coincida con lo que buscas?'
                      : '¿Te gustaría que te notifiquemos sobre vehículos similares?'}
                  </p>
                  <Button
                    color='primary'
                    size='md'
                    className={`${theme === 'dark' ? 'text-black' : ''}`}
                    onPress={handleNotifyClick}
                  >
                    {matchCount === 0
                      ? 'Notificarme cuando haya coincidencias'
                      : 'Recibir notificaciones similares'}
                  </Button>
                </div>
              </div>
            )}
            {searchParams && !searchParams.error && (
              <div className='space-y-4'>
                <div className='text-sm text-gray-500 dark:text-gray-400'>
                  <p className='font-medium mb-2'>Estamos buscando:</p>
                  <ul className='list-disc list-inside space-y-1'>
                    {searchParams.brand && <li>Marca: {searchParams.brand}</li>}
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
                        Precio desde: ${searchParams.price.min.toLocaleString()}
                      </li>
                    )}
                    {searchParams.price?.max && (
                      <li>
                        Precio hasta: ${searchParams.price.max.toLocaleString()}
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
                    {searchParams.color && <li>Color: {searchParams.color}</li>}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showThankYouMessage && (
        <div className='mt-8 p-6 bg-gray-100 dark:bg-dark-card rounded-lg text-center'>
          <p className='text-2xl font-semibold text-primary mb-4'>
            ¡Gracias por tu interés!
          </p>
          <p className='text-gray-600 dark:text-gray-400 mb-6 text-lg'>
            Te notificaremos cuando encontremos vehículos que coincidan con tu
            búsqueda.
          </p>
          {vehicles.length === 0 && (
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
          )}
        </div>
      )}
      {vehicles.length > 0 && (
        <div className='mt-8 relative'>
          <VehicleCarousel vehicles={vehicles} isLoading={isLoading} />
        </div>
      )}

      {/* Customer Data Modal */}
      <CustomerDataModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSave={handleSaveCustomer}
        title='¡Buscamos el vehículo por ti!'
        description='Te notificaremos cuando encontremos tu vehículo a un buen precio.'
        isLoading={isSavingCustomer}
      />
    </div>
  );
}
