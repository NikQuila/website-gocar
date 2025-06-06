'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VehicleDetailSection from '@/components/vehicles/VehicleDetailSection';
import { Icon } from '@iconify/react';
import useClientStore from '@/store/useClientStore';
import useCustomerStore from '@/store/useCustomerStore';
import { Client, Vehicle } from '@/utils/types';
import { CustomerDataModal } from '@/components/customers/CustomerDataModal';
import { getVehicleById, incrementVehicleViews } from '@/lib/vehicles';

export default function VehicleDetailsPageClient() {
  const params = useParams();
  const router = useRouter();
  const { client } = useClientStore();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const isIncrementingRef = useRef(false);
  const {
    customer,
    likes,
    toggleLike,
    isModalOpen,
    setIsModalOpen,
    initializeCustomer,
  } = useCustomerStore();

  const fetchVehicle = async () => {
    if (!params.id) return;
    try {
      const response = await getVehicleById(params.id as string);
      setVehicle(response);
      setLoading(false);

      // Solo incrementar si no está en proceso y no está en sessionStorage
      const viewKey = `vehicle_view_${params.id}`;
      if (!isIncrementingRef.current && !sessionStorage.getItem(viewKey)) {
        isIncrementingRef.current = true;
        try {
          await incrementVehicleViews(Number(params.id));
          sessionStorage.setItem(viewKey, 'true');
        } finally {
          isIncrementingRef.current = false;
        }
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleLike = async (vehicleId: string) => {
    if (!customer) {
      setIsModalOpen(true);
    } else {
      await toggleLike(vehicleId);
    }
  };

  return (
    <div className='container mx-auto px-4 py-20 bg-white dark:bg-dark-bg min-h-screen'>
      <div className='mb-8'>
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors'
        >
          <Icon icon='mdi:arrow-left' className='text-xl' />
          <span>Volver</span>
        </button>
      </div>
      <VehicleDetailSection
        vehicle={vehicle}
        loading={loading}
        client={client as Client}
        onLike={handleLike}
        isLiked={likes.includes(vehicle?.id || '')}
        showLikeButton={true}
      />

      <CustomerDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (customerData) => {
          await initializeCustomer({
            ...customerData,
            client_id: client?.id || '',
          });
          if (vehicle) {
            await toggleLike(vehicle.id);
          }
        }}
      />
    </div>
  );
}
