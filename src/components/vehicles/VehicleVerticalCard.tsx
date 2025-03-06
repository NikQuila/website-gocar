"use client";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Chip,
  Divider,
} from "@heroui/react";
import { Vehicle } from "../../utils/types";
import { useRouter } from "next/navigation";
import {
  mapFuelTypeToSpanish,
  mapTransmissionTypeToSpanish,
} from "@/utils/functions";
import { useEffect, useState } from "react";

interface VehicleVerticalCardProps {
  vehicle: Vehicle;
}

const VehicleVerticalCard = ({ vehicle }: VehicleVerticalCardProps) => {
  const router = useRouter();
  const [imageStyle, setImageStyle] = useState({});

  const formattedPrice = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(vehicle.price);

  const discountedPrice = vehicle.discount_percentage
    ? vehicle.price * (1 - vehicle.discount_percentage / 100)
    : null;

  const savingsAmount = vehicle.discount_percentage
    ? vehicle.price - (discountedPrice || 0)
    : 0;

  const formattedSavings = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(savingsAmount);

  const isSold = vehicle.status === "sold";

  const handleViewDetails = () => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  useEffect(() => {
    const img = document.createElement("img");
    img.onload = () => {
      // Si la imagen es más alta que ancha (vertical)
      if (img.height > img.width * 1.2) {
        // Recorte más agresivo de la parte superior
        setImageStyle({
          objectPosition: "center 95%",
          objectFit: "cover",
          height: "100%",
          width: "100%",
          transform: "scale(0.6)", // Aumentamos el tamaño para mostrar más del auto
        });
      } else {
        // Para imágenes horizontales, no aplicar ningún estilo especial
        setImageStyle({});
      }
    };
    img.src = vehicle.main_image;
  }, [vehicle.main_image]);

  return (
    <Card
      isPressable
      onPress={handleViewDetails}
      className="overflow-hidden bg-white dark:bg-dark-card"
    >
      <div className="w-full">
        <div className="relative w-full h-[200px] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              alt={`${vehicle.brand?.name} ${vehicle.model?.name}`}
              className="object-cover w-full h-full"
              style={imageStyle}
              src={vehicle.main_image}
            />
          </div>
          {vehicle.discount_percentage !== undefined &&
            vehicle.discount_percentage > 0 && (
              <div className="absolute bottom-2 right-2 z-10">
                <Chip
                  size="sm"
                  className="shadow-lg text-white bg-gradient-to-r from-orange-500 to-red-500 border-none"
                >
                  Ahorra {formattedSavings}
                </Chip>
              </div>
            )}
        </div>
      </div>

      <div className="flex flex-col">
        <CardBody className="flex flex-col flex-grow p-4 ">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {vehicle.brand?.name} {vehicle.year}
              </p>
            </div>

            <h3 className="text-xl font-bold dark:text-dark-text">
              {vehicle.model?.name}
            </h3>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{vehicle.mileage.toLocaleString()} km</span>
              <span>•</span>
              <span>{mapFuelTypeToSpanish(vehicle.fuel_type)}</span>
              <span>•</span>
              <span>{mapTransmissionTypeToSpanish(vehicle.transmission)}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {vehicle.features.slice(0, 3).map((feature, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  className="bg-gray-100 dark:bg-dark-border dark:text-dark-text"
                >
                  {feature}
                </Chip>
              ))}
            </div>
          </div>
        </CardBody>

        <Divider className="dark:border-dark-border" />

        <CardFooter className="p-4">
          <div className="w-full text-left">
            {vehicle.discount_percentage ? (
              <>
                <p className="text-sm line-through text-gray-400 dark:text-gray-500 text-left">
                  {formattedPrice}
                </p>
                <p className="text-xl font-semibold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent text-left">
                  {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  }).format(discountedPrice!)}
                </p>
              </>
            ) : (
              <p className="text-xl font-semibold text-primary dark:text-white text-left">
                {formattedPrice}
              </p>
            )}
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};

export default VehicleVerticalCard;
