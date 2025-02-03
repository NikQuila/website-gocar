'use client';

import { useEffect, useRef, useState } from 'react';
import { Vehicle } from '@/utils/types';
import VehicleCard from './VehicleCard';
import VehicleCardSkeleton from './VehicleCardSkeleton';

interface SimpleCarouselProps {
  vehicles: Vehicle[];
  isLoading: boolean;
}

export default function SimpleCarousel({
  vehicles,
  isLoading,
}: SimpleCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const lastX = useRef(0);
  const lastTime = useRef(Date.now());

  const duplicatedVehicles = [...vehicles, ...vehicles, ...vehicles];
  const skeletonArray = Array(6).fill(null);

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
    lastX.current = clientX;
    lastTime.current = Date.now();
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;

    const x = clientX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1.5;

    const currentTime = Date.now();
    const timeDiff = currentTime - lastTime.current;
    const distanceDiff = clientX - lastX.current;

    setVelocity(distanceDiff / timeDiff);

    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }

    lastX.current = clientX;
    lastTime.current = currentTime;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (Math.abs(velocity) > 0.5) {
      const momentum = velocity * 100;
      if (containerRef.current) {
        containerRef.current.scrollLeft -= momentum;
      }
    }
    setVelocity(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.pageX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragMove(e.pageX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].pageX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].pageX);
  };

  useEffect(() => {
    const autoScroll = () => {
      if (containerRef.current && !isDragging) {
        containerRef.current.scrollLeft += 0.5;
      }
    };

    const interval = setInterval(autoScroll, 16);
    return () => clearInterval(interval);
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className='carousel-container'
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
    >
      <div className='carousel-track'>
        {isLoading
          ? skeletonArray.map((_, index) => (
              <div key={`skeleton-${index}`} className='carousel-item'>
                <VehicleCardSkeleton />
              </div>
            ))
          : duplicatedVehicles.map((vehicle, index) => (
              <div key={`${vehicle.id}-${index}`} className='carousel-item'>
                <VehicleCard vehicle={vehicle} />
              </div>
            ))}
      </div>

      <style jsx>{`
        .carousel-container {
          overflow-x: scroll;
          overflow-y: hidden;
          white-space: nowrap;
          cursor: grab;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: auto;
          touch-action: pan-x;
          user-select: none;
        }

        .carousel-container::-webkit-scrollbar {
          display: none;
        }

        .carousel-container:active {
          cursor: grabbing;
        }

        .carousel-track {
          display: inline-flex;
          gap: 1rem;
          padding: 1rem;
          will-change: transform;
        }

        .carousel-item {
          width: 300px;
          flex-shrink: 0;
          transform: translateZ(0);
        }

        @media (max-width: 640px) {
          .carousel-track {
            gap: 0.5rem;
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
