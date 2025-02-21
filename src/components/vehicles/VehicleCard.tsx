"use client";
import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Button,
  Chip,
  Divider,
} from "@heroui/react";
import { Vehicle } from "../../utils/types";
import { useRouter } from "next/navigation";
import {
  mapFuelTypeToSpanish,
  mapTransmissionTypeToSpanish,
} from "@/utils/functions";

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const router = useRouter();

  const formattedPrice = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(vehicle.price);

  const discountedPrice = vehicle.discount_percentage
    ? vehicle.price * (1 - vehicle.discount_percentage / 100)
    : null;

  const isSold = vehicle.status === "sold";

  const handleViewDetails = () => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  return (
    <Card
      isPressable
      onPress={handleViewDetails}
      className="group relative overflow-hidden border border-black/10 transition-all duration-300 hover:scale-[1.05] hover:shadow-xl hover:border-primary/30 h-[450px] flex flex-col"
    >
      {vehicle?.discount_percentage > 0 && !isSold && (
        <div className="absolute top-2 left-2 z-30">
          <Chip
            color="warning"
            variant="shadow"
            className="text-white bg-gradient-to-r from-orange-500 to-red-500"
          >
            ¡Oferta!
          </Chip>
        </div>
      )}

      {isSold && (
        <div className="absolute top-0 right-0 h-[200px] w-[200px] overflow-hidden z-50 rotate-0">
          <div className="absolute top-[30px] right-[-50px] bg-sold text-white font-bold py-2 w-[250px] text-center transform rotate-45">
            VENDIDO
          </div>
        </div>
      )}

      <CardBody className="p-0 flex-shrink-0">
        <div className="relative h-[180px] w-full">
          <Image
            alt={`${vehicle.brand?.name} ${vehicle.model?.name}`}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isSold ? "opacity-75" : ""
            }`}
            src={vehicle.main_image}
            style={{
              objectFit: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      </CardBody>

      <CardFooter className="flex flex-col p-4 flex-grow justify-between">
        <div className="space-y-1.5">
          <p className="text-gray-600">
            {vehicle.brand?.name} {vehicle.year}
          </p>
          <h3 className="text-xl font-bold">{vehicle.model?.name}</h3>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{vehicle.mileage.toLocaleString()} km</span>
            <span>•</span>
            <span>{mapFuelTypeToSpanish(vehicle.fuel_type)}</span>
            <span>•</span>
            <span>{mapTransmissionTypeToSpanish(vehicle.transmission)}</span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {vehicle.features.slice(0, 3).map((feature, index) => (
              <Chip
                key={index}
                size="sm"
                variant="flat"
                className="bg-gray-100"
              >
                {feature}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-2">
          <Divider className="my-2" />

          <div>
            {vehicle.discount_percentage ? (
              <div className="flex flex-col">
                <p className="text-sm line-through text-gray-400 mb-1">
                  {formattedPrice}
                </p>
                <p className="text-2xl font-bold text-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  }).format(discountedPrice!)}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold">{formattedPrice}</p>
            )}
          </div>

          <Button
            onPress={handleViewDetails}
            color={isSold ? "danger" : "primary"}
            fullWidth
            isDisabled={isSold}
            className={`font-semibold mt-1 ${
              isSold ? "bg-sold hover:bg-sold-600" : ""
            }`}
          >
            {isSold ? "Vehículo vendido" : "Ver detalles"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
