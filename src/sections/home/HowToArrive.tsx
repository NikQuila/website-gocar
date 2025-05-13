'use client';

import { useLoadScript, GoogleMap, OverlayView } from '@react-google-maps/api';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import useClientStore from '@/store/useClientStore';
import { Dealership, Location } from '@/utils/types';
import { supabase } from '@/lib/supabase';
import useThemeStore from '@/store/useThemeStore';

interface HowToArriveProps {
  height?: string;
}

const grayMapStyle = [
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b5b2b2' }],
  },
  {
    featureType: 'landscape',
    elementType: 'all',
    stylers: [{ color: '#ececec' }],
  },
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'all',
    stylers: [{ saturation: -100 }, { lightness: 45 }, { color: '#d6d6d6' }],
  },
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'all',
    stylers: [{ color: '#ffffff' }],
  },
];

const MapMarker = ({
  onClick,
  address,
  isSelected,
}: {
  onClick?: () => void;
  address?: string;
  isSelected?: boolean;
}) => (
  <div className='relative group'>
    <div
      onClick={onClick}
      className={`cursor-pointer transform-gpu transition-transform ${
        isSelected ? 'scale-110' : 'group-hover:scale-110'
      }`}
    >
      <div className='relative'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          className={`w-8 h-8 text-primary drop-shadow-lg`}
          fill='currentColor'
        >
          <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' />
        </svg>
        <div className='absolute -inset-1 animate-ping rounded-full bg-primary/30 duration-1000' />
      </div>
    </div>

    {address && (
      <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
        <div className='bg-white px-4 py-2 rounded-lg shadow-lg text-sm text-gray-700 border border-gray-100'>
          {address}
          <div className='absolute -bottom-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white' />
        </div>
      </div>
    )}
  </div>
);

export default function HowToArrive({ height = '400px' }: HowToArriveProps) {
  const { client } = useClientStore();
  const { theme } = useThemeStore();
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [selectedDealership, setSelectedDealership] =
    useState<Dealership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCTH9xZ0XhNsX5sJwp-2wPGcbtiBB1NOKU',
  });

  useEffect(() => {
    const fetchDealerships = async () => {
      if (client?.id) {
        const { data } = await supabase
          .from('dealerships')
          .select('*')
          .eq('client_id', client.id);

        if (data && data.length > 0) {
          setDealerships(data);
          setSelectedDealership(data[0]);
        } else if (client.location) {
          // Create a default dealership using client data if no dealerships found
          const defaultDealership: Dealership = {
            id: 'default',
            client_id: client.id,
            address: client.contact?.address || '',
            phone: client.contact?.phone || '',
            email: client.contact?.email || '',
            location: {
              lat: Number(client.location.lat),
              lng: Number(client.location.lng),
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setDealerships([defaultDealership]);
          setSelectedDealership(defaultDealership);
        }
      }
      setIsLoading(false);
    };

    fetchDealerships();
  }, [client]);

  const mapOptions = useMemo(
    () => ({
      styles: grayMapStyle,
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
    }),
    []
  );

  const handleMarkerClick = useCallback((dealership: Dealership) => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${dealership.location.lat},${dealership.location.lng}`;
    window.open(googleMapsUrl, '_blank');
  }, []);

  const handleNextDealership = () => {
    if (!selectedDealership || dealerships.length <= 1) return;
    const currentIndex = dealerships.findIndex(
      (d) => d.id === selectedDealership.id
    );
    const nextIndex = (currentIndex + 1) % dealerships.length;
    setSelectedDealership(dealerships[nextIndex]);
  };

  const handlePrevDealership = () => {
    if (!selectedDealership || dealerships.length <= 1) return;
    const currentIndex = dealerships.findIndex(
      (d) => d.id === selectedDealership.id
    );
    const prevIndex =
      (currentIndex - 1 + dealerships.length) % dealerships.length;
    setSelectedDealership(dealerships[prevIndex]);
  };

  if (!isLoaded || isLoading) {
    return (
      <div className='flex items-center justify-center' style={{ height }}>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
      </div>
    );
  }

  return (
    <div className='bg-gray-50 dark:bg-dark-bg py-12 rounded-2xl'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h3 className='text-4xl font-semibold text-black text-center mb-4 dark:text-dark-text'>
          ¿Cómo llegar?
        </h3>
        <p className='text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto'>
          Encuentranos en la siguiente dirección:
        </p>

        <div className='grid md:grid-cols-3 gap-8 items-start'>
          {/* Contact Info with Navigation */}
          <div className='md:col-span-1 space-y-6 p-6 h-full flex flex-col justify-between bg-white dark:bg-dark-card rounded-xl shadow-sm dark:border dark:border-dark-border mx-auto max-w-[90vw]'>
            {client?.logo && (
              <img
                src={client.logo}
                alt={client.name}
                className='h-12 w-auto mb-2 object-contain dark:brightness-90'
              />
            )}

            {dealerships.length > 1 && (
              <div className='flex items-center justify-between mb-4'>
                <button
                  onClick={handlePrevDealership}
                  className='p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-full'
                >
                  <Icon
                    icon='mdi:chevron-left'
                    className='text-2xl dark:text-dark-text'
                  />
                </button>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  {dealerships.findIndex(
                    (d) => d.id === selectedDealership?.id
                  ) + 1}{' '}
                  de {dealerships.length}
                </span>
                <button
                  onClick={handleNextDealership}
                  className='p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-full'
                >
                  <Icon
                    icon='mdi:chevron-right'
                    className='text-2xl dark:text-dark-text'
                  />
                </button>
              </div>
            )}

            {selectedDealership && (
              <div className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <Icon
                    icon='mdi:map-marker'
                    className='text-2xl text-primary  flex-shrink-0 mt-1'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-dark-text'>
                      Dirección
                    </h4>
                    <p className='text-gray-600 dark:text-gray-400'>
                      {selectedDealership.address}
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <Icon
                    icon='mdi:phone'
                    className='text-2xl text-primary  flex-shrink-0 mt-1'
                  />
                  <div>
                    <h4 className='font-medium text-gray-900 dark:text-dark-text'>
                      Teléfono
                    </h4>
                    <p className='text-gray-600 dark:text-gray-400'>
                      {selectedDealership.phone}
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <Icon
                    icon='mdi:email'
                    className='text-2xl text-primary  flex-shrink-0 mt-1'
                  />
                  <div className='min-w-0'>
                    <h4 className='font-medium text-gray-900 dark:text-dark-text'>
                      Email
                    </h4>
                    <p className='text-gray-600 dark:text-gray-400 break-words'>
                      {selectedDealership.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              color='primary'
              startContent={<Icon icon='mdi:navigation' />}
              className={`w-full mt-6 ${theme === 'dark' ? 'text-black' : ''}`}
              onPress={() =>
                selectedDealership && handleMarkerClick(selectedDealership)
              }
            >
              Cómo llegar en Google Maps
            </Button>
          </div>

          {/* Map */}
          <div className='md:col-span-2'>
            <div
              style={{ height, width: '100%' }}
              className='rounded-xl overflow-hidden shadow-lg dark:border dark:border-dark-border'
            >
              <GoogleMap
                zoom={13}
                center={
                  selectedDealership
                    ? {
                        lat: Number(selectedDealership.location.lat),
                        lng: Number(selectedDealership.location.lng),
                      }
                    : undefined
                }
                mapContainerStyle={{ width: '100%', height: '100%' }}
                options={mapOptions}
              >
                {dealerships.map((dealership) => (
                  <OverlayView
                    key={dealership.id}
                    position={{
                      lat: Number(dealership.location.lat),
                      lng: Number(dealership.location.lng),
                    }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <MapMarker
                      onClick={() => {
                        setSelectedDealership(dealership);
                        handleMarkerClick(dealership);
                      }}
                      address={dealership.address}
                      isSelected={selectedDealership?.id === dealership.id}
                    />
                  </OverlayView>
                ))}
              </GoogleMap>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
