import { ImageResponse } from 'next/og';
import { getVehicleById } from '@/lib/vehicles';

export const runtime = 'nodejs';

export const alt = 'Imagen del vehículo';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const vehicle = await getVehicleById(params.id);

  if (!vehicle) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(to bottom, #1a1a2e, #16213e)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          Vehículo no encontrado
        </div>
      ),
      { ...size }
    );
  }

  const title = `${vehicle.brand?.name || ''} ${vehicle.model?.name || ''} ${vehicle.year || ''}`.trim();
  const price = vehicle.price
    ? new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(vehicle.price)
    : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#0f0f0f',
        }}
      >
        {/* Imagen del vehículo como fondo */}
        {vehicle.main_image && (
          <img
            src={vehicle.main_image}
            alt={title}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Overlay oscuro para legibilidad */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0))',
            display: 'flex',
          }}
        />

        {/* Contenido */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '40px 50px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Título del vehículo */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              display: 'flex',
            }}
          >
            {title}
          </div>

          {/* Precio y detalles */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '30px',
            }}
          >
            {price && (
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 'bold',
                  color: '#22c55e',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  display: 'flex',
                }}
              >
                {price}
              </div>
            )}

            {vehicle.mileage && (
              <div
                style={{
                  fontSize: 28,
                  color: '#d1d5db',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  display: 'flex',
                }}
              >
                {vehicle.mileage.toLocaleString('es-DO')} km
              </div>
            )}

            {vehicle.fuel_type?.name && (
              <div
                style={{
                  fontSize: 28,
                  color: '#d1d5db',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  display: 'flex',
                }}
              >
                {vehicle.fuel_type.name}
              </div>
            )}
          </div>
        </div>

        {/* Logo/marca de agua en esquina superior */}
        <div
          style={{
            position: 'absolute',
            top: '30px',
            right: '40px',
            fontSize: 32,
            fontWeight: 'bold',
            color: 'white',
            textShadow: '2px 2px 8px rgba(0,0,0,0.9)',
            display: 'flex',
            padding: '10px 20px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '8px',
          }}
        >
          GoCar
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
