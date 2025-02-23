'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import VehicleVerticalCard from '@/components/vehicles/VehicleVerticalCard';
import VehicleCardSkeleton from '@/components/vehicles/VehicleCardSkeleton';
import useVehiclesStore from '../../store/useVehiclesStore';

export default function EmblaAutoplayCarousel() {
  const { vehicles, isLoading } = useVehiclesStore();
  const duplicatedVehicles = [...vehicles, ...vehicles, ...vehicles];
  // Configuramos embla con loop infinito y el plugin de autoplay.
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 2000, stopOnInteraction: false }),
  ]);

  // Si quieres forzar un tamaño fijo para cada slide, lo definimos aquí.
  // En este ejemplo usamos 300px, que es el ancho de la card.
  return (
    <div className='embla'>
      <div className='embla__viewport' ref={emblaRef}>
        <div className='embla__container'>
          {isLoading
            ? Array(6)
                .fill(null)
                .map((_, index) => (
                  <div className='embla__slide' key={`skeleton-${index}`}>
                    <div className='card-wrapper'>
                      <VehicleCardSkeleton />
                    </div>
                  </div>
                ))
            : duplicatedVehicles.map((vehicle, index) => (
                <div className='embla__slide' key={`${vehicle.id}-${index}`}>
                  <div className='card-wrapper'>
                    <VehicleVerticalCard vehicle={vehicle} />
                  </div>
                </div>
              ))}
        </div>
      </div>

      <style jsx>{`
        .embla {
          overflow: hidden;
          width: 100%;
          background: transparent;
          padding: 20px 0;
        }
        .embla__viewport {
          overflow: hidden;
          width: 100%;
        }
        .embla__container {
          display: flex;
        }
        .embla__slide {
          flex: 0 0 auto;
          width: 300px; /* Ancho fijo para cada tarjeta */
          margin-right: 16px; /* Espaciado entre slides */
        }
        .card-wrapper {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
