import React, { useEffect, useState } from 'react';
import { useNode } from '@craftjs/core';
import { supabase } from '@/lib/supabase';
import { Vehicle } from '@/utils/types';
import { Button } from '@/components/ui/button';
import Marquee from 'react-fast-marquee';
import useClientStore from '@/store/useClientStore';
import { VehicleCard } from './VehicleCard';

// Versión simplificada del vehículo
export interface SimpleVehicle extends Vehicle {
  brand?: { id: number; name: string };
  model?: { id: number; name: string };
  status?: { id: number; name: string };
  category?: { id: number; name: string };
  fuel_type?: { id: number; name: string };
  condition?: { id: number; name: string };
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
  }[];
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
    },
  ],
  children,
}: VehicleCarouselProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

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
            status:status_id(id, name),
            brand:brand_id(id, name),
            model:model_id(id, name),
            category:category_id(id, name),
            fuel_type:fuel_type_id(id, name)
          `
          )
          .eq('client_id', client?.id as number)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching vehicles:', error);
        } else {
          // Convertir al tipo SimpleVehicle
          const vehiclesData = data as unknown as SimpleVehicle[];

          // Filtrar vehículos por estado
          console.log('vehicles data', vehiclesData);
          console.log('status values', statusValues);
          const filteredByStatus = vehiclesData.filter(
            (vehicle) =>
              vehicle.status &&
              statusValues.includes(vehicle.status.name as any)
          );

          // Ordenar para que los vehículos con estado "Publicado" aparezcan primero
          const sortedVehicles = [...filteredByStatus].sort((a, b) => {
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
            return 0;
          });

          console.log('filtered by status', sortedVehicles);

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
      ref={(ref) => ref && connectors.connect(ref)}
      style={{
        background: bgColor,
        color: textColor,
        padding: '40px 0',
        position: 'relative',
        border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
      }}
      className='w-full VehicleCarousel'
      data-section='vehicle-carousel'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6'>
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
          <div>
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
                    id={vehicle.id}
                    brand={vehicle.brand}
                    model={vehicle.model}
                    price={vehicle.price}
                    year={vehicle.year}
                    mileage={vehicle.mileage}
                    main_image={vehicle.main_image}
                    status={vehicle.status}
                    category={vehicle.category}
                    fuel_type={vehicle.fuel_type}
                    compact={false}
                    cardBgColor={cardSettings[0]?.cardBgColor}
                    cardBorderColor={cardSettings[0]?.cardBorderColor}
                    cardTextColor={cardSettings[0]?.cardTextColor}
                    cardPriceColor={cardSettings[0]?.cardPriceColor}
                    cardButtonColor={cardSettings[0]?.cardButtonColor}
                    cardButtonTextColor={cardSettings[0]?.cardButtonTextColor}
                    detailsButtonText={cardSettings[0]?.detailsButtonText}
                    bannerPosition={cardSettings[0]?.bannerPosition}
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
      },
    ],
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
