'use client';

import { useLoadScript, GoogleMap, OverlayView } from '@react-google-maps/api';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNode } from '@craftjs/core';
import useClientStore from '@/store/useClientStore';
import { Dealership, Location } from '@/utils/types';
import { supabase } from '@/lib/supabase';
import useThemeStore from '@/store/useThemeStore';
import { useTranslation } from '@/i18n/hooks/useTranslation';

interface HowToArriveProps {
  title?: string;
  subtitle?: string;
  titleAlignment?: 'left' | 'center' | 'right';
  height?: string;
  backgroundColor?: string;
  textColor?: string;
  cardBgColor?: string;
  cardTextColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonLabel?: string;
  iconColor?: string;
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
  iconColor = '#60a5fa',
}: {
  onClick?: () => void;
  address?: string;
  isSelected?: boolean;
  iconColor?: string;
}) => (
  <div className="relative group">
    <div
      onClick={onClick}
      className={`cursor-pointer transform-gpu transition-transform ${
        isSelected ? 'scale-110' : 'group-hover:scale-110'
      }`}
    >
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-8 h-8 drop-shadow-lg"
          style={{ color: iconColor }}
          fill="currentColor"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <div
          className="absolute -inset-1 animate-ping rounded-full duration-1000"
          style={{ backgroundColor: `${iconColor}30` }}
        />
      </div>
    </div>

    {address && (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-white dark:bg-dark-card px-4 py-2 rounded-lg shadow-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-dark-border">
          {address}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-dark-card" />
        </div>
      </div>
    )}
  </div>
);

export default function HowToArrive({
  title = '¿Cómo llegar?',
  subtitle = 'Encuentranos en la siguiente dirección:',
  titleAlignment = 'center',
  height = '400px',
  backgroundColor = '#f9fafb',
  textColor = '#111827',
  cardBgColor = '#ffffff',
  cardTextColor = '#111827',
  buttonBgColor = '#2563eb',
  buttonTextColor = '#ffffff',
  buttonLabel = 'Cómo llegar en Google Maps',
  iconColor,
}: HowToArriveProps) {
  // useNode solo está disponible en el contexto de CraftJS Editor
  let connectors: any = null;
  let selected = false;

  try {
    const nodeData = useNode((state) => ({
      selected: state.events.selected,
    }));
    connectors = nodeData.connectors;
    selected = nodeData.selected;
  } catch (error) {
    connectors = null;
    selected = false;
  }

  const { client } = useClientStore();
  const { theme } = useThemeStore();
  const { t } = useTranslation();

  // Logo según tema 
  const logoSrc =
    theme === 'dark' && client?.logo_dark ? client.logo_dark : client?.logo;

  const logoClassName =
    theme === 'dark' && client?.logo_dark
      ? 'h-12 w-auto mb-2 object-contain'
      : 'h-12 w-auto mb-2 object-contain dark:brightness-90';

  // Color primario por defecto (celestito claro)
  const primaryColor = '#60a5fa';
  const finalIconColor = iconColor || primaryColor;

  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [selectedDealership, setSelectedDealership] =
    useState<Dealership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
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
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div
      ref={connectors?.connect || null}
      className={`py-12 rounded-2xl bg-gray-50 dark:bg-black text-gray-900 dark:text-white ${
        selected
          ? 'border-2 border-dashed border-gray-600  outline-1 outline-dashed outline-gray-400 outline-offset-2'
          : 'border border-transparent'
      }`}
      style={{
        ...(backgroundColor !== '#f9fafb' && { backgroundColor }),
        ...(textColor !== '#111827' && { color: textColor }),
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3
          className={`text-4xl font-semibold mb-4 text-gray-900 dark:text-white ${
            titleAlignment === 'center'
              ? 'text-center'
              : titleAlignment === 'right'
              ? 'text-right'
              : 'text-left'
          }`}
        >
          {title || t('home.howToArrive.title')}
        </h3>
        <p
          className={`mb-12 max-w-3xl mx-auto text-gray-700 dark:text-gray-300 ${
            titleAlignment === 'center'
              ? 'text-center'
              : titleAlignment === 'right'
              ? 'text-right'
              : 'text-left'
          }`}
        >
          {subtitle || t('home.howToArrive.subtitle')}
        </p>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Contact Info with Navigation */}
          <div className="md:col-span-1 space-y-6 p-6 h-full flex flex-col justify-between rounded-xl shadow-sm mx-auto max-w-[90vw] bg-white dark:bg-dark-card text-gray-900 dark:text-white">
            {logoSrc && (
              <img
                src={logoSrc}
                alt={client?.name || 'Logo'}
                className={logoClassName}
              />
            )}

            {dealerships.length > 1 && (
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevDealership}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-full text-gray-700 dark:text-gray-300"
                >
                  <Icon icon="mdi:chevron-left" className="text-2xl" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400 opacity-70">
                  {dealerships.findIndex((d) => d.id === selectedDealership?.id) + 1}{' '}
                  de {dealerships.length}
                </span>
                <button
                  onClick={handleNextDealership}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-full text-gray-700 dark:text-gray-300"
                >
                  <Icon icon="mdi:chevron-right" className="text-2xl" />
                </button>
              </div>
            )}

            {selectedDealership && (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Icon
                    icon="mdi:map-marker"
                    className="text-2xl flex-shrink-0 mt-1"
                    style={{ color: finalIconColor }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {t('home.howToArrive.address')}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 opacity-70">
                      {selectedDealership.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Icon
                    icon="mdi:phone"
                    className="text-2xl flex-shrink-0 mt-1"
                    style={{ color: finalIconColor }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {t('home.howToArrive.phone')}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 opacity-70">
                      {selectedDealership.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Icon
                    icon="mdi:email"
                    className="text-2xl flex-shrink-0 mt-1"
                    style={{ color: finalIconColor }}
                  />
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Email
                    </h4>
                    <p className="break-words text-gray-600 dark:text-gray-400 opacity-70">
                      {selectedDealership.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              className="w-full mt-6"
              style={{
                backgroundColor: buttonBgColor,
                color: buttonTextColor,
              }}
              onPress={() =>
                selectedDealership && handleMarkerClick(selectedDealership)
              }
            >
              {buttonLabel || t('home.howToArrive.button')}
            </Button>
          </div>

          {/* Map */}
          <div className="md:col-span-2">
            <div
              style={{ height, width: '100%' }}
              className="rounded-xl overflow-hidden shadow-lg"
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
                      iconColor={finalIconColor}
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

// Configuración de CraftJS
HowToArrive.craft = {
  displayName: 'HowToArrive',
  props: {
    title: '¿Cómo llegar?',
    subtitle: 'Encuentranos en la siguiente dirección:',
    titleAlignment: 'center',
    height: '400px',
    backgroundColor: '#f9fafb',
    textColor: '#111827',
    cardBgColor: '#ffffff',
    cardTextColor: '#111827',
    buttonBgColor: '#2563eb',
    buttonTextColor: '#ffffff',
    buttonLabel: 'Cómo llegar en Google Maps',
    iconColor: '#60a5fa',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
  },
};
