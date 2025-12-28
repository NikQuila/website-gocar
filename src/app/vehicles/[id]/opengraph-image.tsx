import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Imagen del vehículo';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

async function getVehicle(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/vehicles?id=eq.${id}&select=*,brand:brand_id(name),model:model_id(name),fuel_type:fuel_type_id(name)`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data?.[0] || null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { id: string } }) {
  const vehicle = await getVehicle(params.id);

  // Fallback si no hay vehículo
  if (!vehicle) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a2e',
            color: 'white',
            fontSize: 48,
          }}
        >
          Vehículo no disponible
        </div>
      ),
      { ...size }
    );
  }

  const title = `${vehicle.brand?.name || ''} ${vehicle.model?.name || ''} ${vehicle.year || ''}`.trim();
  const price = vehicle.price
    ? new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(vehicle.price)
    : '';

  // Si hay imagen, usarla como fondo
  if (vehicle.main_image) {
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
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              left: 50,
              right: 50,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: 'white',
                display: 'flex',
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
              }}
            >
              {price && (
                <div
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: '#22c55e',
                    display: 'flex',
                  }}
                >
                  {price}
                </div>
              )}
              {vehicle.mileage && (
                <div
                  style={{
                    fontSize: 26,
                    color: '#e5e5e5',
                    display: 'flex',
                  }}
                >
                  {Number(vehicle.mileage).toLocaleString('es-CL')} km
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // Sin imagen - solo texto
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a2e',
          color: 'white',
          padding: 50,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 700, display: 'flex' }}>{title}</div>
        {price && (
          <div style={{ fontSize: 44, color: '#22c55e', marginTop: 20, display: 'flex' }}>
            {price}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
