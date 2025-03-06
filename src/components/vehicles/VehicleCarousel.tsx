"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import VehicleVerticalCard from "@/components/vehicles/VehicleVerticalCard";
import VehicleCardSkeleton from "@/components/vehicles/VehicleCardSkeleton";
import { Vehicle } from "@/utils/types";

interface VehicleCarouselProps {
  vehicles: Vehicle[];
  isLoading?: boolean;
}

export default function VehicleCarousel({
  vehicles,
  isLoading = false,
}: VehicleCarouselProps) {
  const [currentPage, setCurrentPage] = React.useState(0);

  // Calculate items per page based on screen size using CSS Grid
  const itemsPerPage = {
    mobile: 1, // < 768px
    tablet: 2, // >= 768px
    desktop: 2, // >= 1280px
  };

  // Get current window width
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate current items per page based on window width
  const getCurrentItemsPerPage = () => {
    if (windowWidth >= 1280) return itemsPerPage.desktop;
    if (windowWidth >= 768) return itemsPerPage.tablet;
    return itemsPerPage.mobile;
  };

  const currentItemsPerPage = getCurrentItemsPerPage();
  const totalPages = Math.ceil(vehicles.length / currentItemsPerPage);

  const canScrollPrev = currentPage > 0;
  const canScrollNext = currentPage < totalPages - 1;

  const handlePrevPage = () => {
    if (canScrollPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (canScrollNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Get current page vehicles
  const getCurrentPageVehicles = () => {
    const start = currentPage * currentItemsPerPage;
    const end = start + currentItemsPerPage;
    return vehicles.slice(start, end);
  };

  return (
    <div className="w-full  mx-auto relative px-4">
      {/* Navigation Buttons */}
      {vehicles.length > currentItemsPerPage && !isLoading && (
        <>
          <Button
            isIconOnly
            variant="light"
            className={`absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 
              bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md
              transition-all duration-200
              ${
                !canScrollPrev
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105"
              }`}
            onClick={handlePrevPage}
            disabled={!canScrollPrev}
          >
            <Icon icon="mdi:chevron-left" className="text-xl" />
          </Button>
          <Button
            isIconOnly
            variant="light"
            className={`absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 
              bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md
              transition-all duration-200
              ${
                !canScrollNext
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105"
              }`}
            onClick={handleNextPage}
            disabled={!canScrollNext}
          >
            <Icon icon="mdi:chevron-right" className="text-xl" />
          </Button>
        </>
      )}

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
        {isLoading
          ? Array(currentItemsPerPage)
              .fill(null)
              .map((_, index) => (
                <VehicleCardSkeleton key={`skeleton-${index}`} />
              ))
          : getCurrentPageVehicles().map((vehicle) => (
              <VehicleVerticalCard key={vehicle.id} vehicle={vehicle} />
            ))}
      </div>

      {/* Pagination Dots */}
      {totalPages > 1 && !isLoading && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 
                ${
                  index === currentPage
                    ? "bg-blue-600"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              onClick={() => setCurrentPage(index)}
              aria-label={`Go to page ${index + 1} of ${totalPages}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
