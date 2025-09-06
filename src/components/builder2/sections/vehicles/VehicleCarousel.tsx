import React, { useEffect, useState } from 'react';
import { useNode } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { VehicleCard } from './VehicleCard';
import Marquee from 'react-fast-marquee';
import { Vehicle } from '@/utils/types';
import useClientStore from '@/store/useClientStore';
import { supabase } from '@/lib/supabase';

// Versión simplificada del vehículo - EXPORT this interface
export interface SimpleVehicle extends Vehicle {
  label?: string; // Campo para etiqueta personalizada
  vehicles_sales?:
    | Array<{ created_at: string; [key: string]: any }>
    | { created_at: string; [key: string]: any }
    | null;
  vehicles_reservations?:
    | Array<{ created_at: string; [key: string]: any }>
    | { created_at: string; [key: string]: any }
    | null;
  event_date?: string; // To store the created_at of the sale/reservation event
}

interface VehicleCarouselProps {
  title?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  autoplay?: boolean;
  autoplaySpeed?: number;
  itemsToShow?: number;
  showStatuses?: ('Publicado' | 'Vendido' | 'Reservado')[];
  cardSettings?: {
    cardBgColor: string;
    cardBorderColor: string;
    cardTextColor: string;
    cardPriceColor: string;
    cardButtonColor: string;
    cardButtonTextColor: string;
    detailsButtonText: string;
    bannerPosition: 'left' | 'right';
    featuresConfig?: {
      feature1: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
      feature2: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
      feature3: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
      feature4: 'category' | 'year' | 'fuel' | 'mileage' | 'transmission';
    };
  }[];
  newBadgeText?: string; // New prop for the "Recién publicado" badge text
  children?: React.ReactNode;
}

export const VehicleCarousel = ({
  title = 'Vehículos destacados',
  subtitle = 'Descubre nuestra selección de vehículos',
  bgColor = '#ffffff',
  textColor = '#333333',
  buttonText = 'Ver todos',
  buttonLink = '/vehicles',
  buttonBgColor = '#3b82f6',
  buttonTextColor = '#ffffff',
  autoplay = true,
  autoplaySpeed = 5000,
  itemsToShow = 3,
  showStatuses = ['Publicado', 'Vendido', 'Reservado'],
  cardSettings = [
    {
      cardBgColor: '#ffffff',
      cardBorderColor: '#e5e7eb',
      cardTextColor: '#1f2937',
      cardPriceColor: '#ffffff',
      cardButtonColor: '#3b82f6',
      cardButtonTextColor: '#ffffff',
      detailsButtonText: 'Ver detalles',
      bannerPosition: 'right',
      featuresConfig: {
        feature1: 'category',
        feature2: 'year',
        feature3: 'fuel',
        feature4: 'mileage',
      },
    },
  ],
  newBadgeText = 'Nuevo',
  children,
}: VehicleCarouselProps) => {
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
    // useNode no está disponible (contexto tradicional), usar valores por defecto
    connectors = null;
    selected = false;
  }

  // Convert string-based props to their actual types
  const autoplayValue =
    typeof autoplay === 'string' ? autoplay === 'true' : autoplay;
  const itemsToShowValue =
    typeof itemsToShow === 'string' ? parseInt(itemsToShow) : itemsToShow;

  // Handle complex showStatuses
  const statusValues =
    Array.isArray(showStatuses) &&
    showStatuses.length > 0 &&
    typeof showStatuses[0] === 'object'
      ? showStatuses.map((item: any) => item.status)
      : showStatuses;

  const { client } = useClientStore();
  const [vehicles, setVehicles] = useState<SimpleVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Ajustar cantidad de vehículos visibles según el tamaño de pantalla
  const getVisibleItems = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return Math.min(2, itemsToShowValue);
      return itemsToShowValue;
    }
    return itemsToShowValue;
  };

  const [visibleItems, setVisibleItems] = useState(getVisibleItems());

  useEffect(() => {
    const handleResize = () => {
      setVisibleItems(getVisibleItems());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch vehículos desde Supabase
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!client?.id) return;
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('vehicles')
          .select(
            `
            id, 
            brand_id, 
            model_id, 
            year, 
            price,
            mileage,
            main_image,
            status_id,
            discount_percentage,
            created_at,
            label,
            transmission,
            status:status_id(id, name),
            brand:brand_id(id, name),
            model:model_id(id, name),
            category:category_id(id, name),
            fuel_type:fuel_type_id(id, name),
            vehicles_sales!vehicle_id(*),
            vehicles_reservations!vehicle_id(*)
          `
          )
          .eq('client_id', +client?.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching vehicles:', error);
        } else {
          const processedData = data.map((vehicle: any) => {
            let event_date: string | undefined;

            if (vehicle.status?.name === 'Vendido' && vehicle.vehicles_sales) {
              if (
                Array.isArray(vehicle.vehicles_sales) &&
                vehicle.vehicles_sales.length > 0
              ) {
                const sortedSales = [...vehicle.vehicles_sales].sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                );
                event_date = sortedSales[0].created_at;
              } else if (
                !Array.isArray(vehicle.vehicles_sales) &&
                vehicle.vehicles_sales.created_at
              ) {
                // It's a single object
                event_date = vehicle.vehicles_sales.created_at;
              }
            } else if (
              vehicle.status?.name === 'Reservado' &&
              vehicle.vehicles_reservations
            ) {
              if (
                Array.isArray(vehicle.vehicles_reservations) &&
                vehicle.vehicles_reservations.length > 0
              ) {
                const sortedReservations = [
                  ...vehicle.vehicles_reservations,
                ].sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                );
                event_date = sortedReservations[0].created_at;
              } else if (
                !Array.isArray(vehicle.vehicles_reservations) &&
                vehicle.vehicles_reservations.created_at
              ) {
                // It's a single object
                event_date = vehicle.vehicles_reservations.created_at;
              }
            }
            return { ...vehicle, event_date };
          });

          const vehiclesData = processedData as unknown as SimpleVehicle[];

          // Filtrar vehículos por estado y luego por fecha de evento para Vendido/Reservado
          console.log('vehicles data with event_date', vehiclesData);
          console.log('status values', statusValues);

          const threeDaysAgo = new Date(); // Define threeDaysAgo once
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          threeDaysAgo.setHours(0, 0, 0, 0); // Optional: Compare against the start of the day

          const activelyFilteredVehicles = vehiclesData.filter((vehicle) => {
            if (
              !vehicle.status ||
              !statusValues.includes(vehicle.status.name as any)
            ) {
              return false; // Filtered out by showStatuses prop
            }

            if (
              vehicle.status.name === 'Vendido' ||
              vehicle.status.name === 'Reservado'
            ) {
              if (vehicle.event_date) {
                const eventDate = new Date(vehicle.event_date);
                return eventDate >= threeDaysAgo;
              }
              return false; // If no event_date for sold/reserved, exclude it
            }
            return true; // Keep 'Publicado' and other statuses not explicitly filtered by date
          });

          // Ordenar para que los vehículos con estado "Publicado" aparezcan primero y luego por precio
          const sortedVehicles = [...activelyFilteredVehicles].sort((a, b) => {
            // Prioritize "Publicado" status
            if (
              a.status?.name === 'Publicado' &&
              b.status?.name !== 'Publicado'
            ) {
              return -1;
            }
            if (
              a.status?.name !== 'Publicado' &&
              b.status?.name === 'Publicado'
            ) {
              return 1;
            }

            // If statuses are the same (or both not 'Publicado'), sort by created_at (newest first)
            if (a.created_at && b.created_at) {
              const dateA = new Date(a.created_at).getTime();
              const dateB = new Date(b.created_at).getTime();
              if (dateA > dateB) return -1; // dateA is newer, comes first
              if (dateA < dateB) return 1; // dateB is newer, comes first
            }

            // If created_at is also the same (or one is missing), then sort by price
            const tempPriceA =
              a.price && a.discount_percentage && a.discount_percentage > 0
                ? a.price * (1 - a.discount_percentage / 100)
                : a.price;
            const tempPriceB =
              b.price && b.discount_percentage && b.discount_percentage > 0
                ? b.price * (1 - b.discount_percentage / 100)
                : b.price;

            const priceA = tempPriceA ?? Infinity;
            const priceB = tempPriceB ?? Infinity;

            if (priceA < priceB) {
              return -1;
            }
            if (priceA > priceB) {
              return 1;
            }

            return 0;
          });

          console.log('filtered by status, date, and price', sortedVehicles);

          setVehicles(sortedVehicles);
        }
      } catch (err) {
        console.error('Failed to fetch vehicles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [statusValues, client?.id]);

  return (
    <div
      ref={(ref) => ref && connectors?.connect?.(ref)}
      style={{
        background: bgColor,
        color: textColor,
        padding: '40px 0',
        position: 'relative',
        border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
        minWidth: 0,
      }}
      className='w-full VehicleCarousel'
      data-section='vehicle-carousel'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 overflow-hidden'>
        {/* Encabezado */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h2
              style={{ color: textColor }}
              className='text-3xl font-bold mb-2'
            >
              {title}
            </h2>
            <p style={{ color: textColor }} className='text-base text-gray-600'>
              {subtitle}
            </p>
          </div>
          <div>
            <Button
              style={{
                backgroundColor: buttonBgColor,
                color: buttonTextColor,
                borderColor: 'transparent',
              }}
              className='hover:opacity-90 transition-opacity'
              asChild
            >
              <a href={buttonLink}>{buttonText}</a>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className='flex justify-center items-center h-60'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className='text-center p-8 bg-gray-50 rounded-xl'>
            <h3 className='text-lg font-medium text-gray-700 mb-2'>
              No hay vehículos disponibles
            </h3>
            <p className='text-gray-500 mb-4'>
              En este momento no hay vehículos para mostrar
            </p>
          </div>
        ) : (
          <div className='w-full overflow-hidden'>
            <Marquee
              gradient={false}
              speed={autoplayValue ? 50 : 0}
              pauseOnHover={true}
            >
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className='px-2'
                  style={{
                    width: '320px',
                  }}
                >
                  <VehicleCard
                    vehicle={vehicle}
                    compact={false}
                    cardBgColor={cardSettings[0]?.cardBgColor}
                    cardBorderColor={cardSettings[0]?.cardBorderColor}
                    cardTextColor={cardSettings[0]?.cardTextColor}
                    cardPriceColor={cardSettings[0]?.cardPriceColor}
                    cardButtonColor={cardSettings[0]?.cardButtonColor}
                    cardButtonTextColor={cardSettings[0]?.cardButtonTextColor}
                    detailsButtonText={cardSettings[0]?.detailsButtonText}
                    bannerPosition={cardSettings[0]?.bannerPosition}
                    featuresConfig={cardSettings[0]?.featuresConfig}
                    newBadgeText={newBadgeText}
                  />
                </div>
              ))}
            </Marquee>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

VehicleCarousel.craft = {
  displayName: 'VehicleCarousel',
  props: {
    title: 'Vehículos destacados',
    subtitle: 'Descubre nuestra selección de vehículos',
    bgColor: '#ffffff',
    textColor: '#333333',
    buttonText: 'Ver todos',
    buttonLink: '/vehicles',
    buttonBgColor: '#3b82f6',
    buttonTextColor: '#ffffff',
    autoplay: 'true',
    autoplaySpeed: 50,
    itemsToShow: '3',
    showStatuses: [{ status: 'Publicado' }],
    cardSettings: [
      {
        cardBgColor: '#ffffff',
        cardBorderColor: '#e5e7eb',
        cardTextColor: '#1f2937',
        cardPriceColor: '#ffffff',
        cardButtonColor: '#3b82f6',
        cardButtonTextColor: '#ffffff',
        detailsButtonText: 'Ver detalles',
        bannerPosition: 'right',
        featuresConfig: {
          feature1: 'category',
          feature2: 'year',
          feature3: 'fuel',
          feature4: 'mileage',
        },
      },
    ],
    newBadgeText: 'Nuevo',
  },
  related: {
    // Settings component will be external
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => true,
    canDelete: () => true,
  },
  isCanvas: true,
};
