'use client';

import { Card, CardBody, CardFooter } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { Calendar, Gauge, Settings, Fuel, Car } from 'lucide-react';
import { Vehicle } from '../../utils/types';
import { useCurrency } from '@/hooks/useCurrency';

// =============================
// Normalizadores locales (ES)
// =============================
type FuelEN = 'Gasoline' | 'Diesel' | 'Hybrid' | 'Electric' | 'Gas';
const normalizeFuel = (name?: string): FuelEN | undefined => {
  const k = (name ?? '').trim().toLowerCase();
  if (['gasoline', 'gasolina', 'bencina', 'nafta', 'petrol'].includes(k)) return 'Gasoline';
  if (['diesel', 'diésel', 'diseal', 'dísel'].includes(k)) return 'Diesel';
  if (['hybrid', 'híbrido', 'hibrido'].includes(k)) return 'Hybrid';
  if (['electric', 'eléctrico', 'electrico', 'ev'].includes(k)) return 'Electric';
  if (['gas', 'lpg', 'gnv', 'gpl', 'gás'].includes(k)) return 'Gas';
  return undefined;
};

type TransEN = 'Manual' | 'Automatic' | 'CVT' | 'Semi-Automatic' | 'Tiptronic' | 'Dual-Clutch';
const normalizeTrans = (name?: string): TransEN | undefined => {
  const k = (name ?? '').trim().toLowerCase();
  if (['manual', 'mecánica', 'mecanica', 'stick'].includes(k)) return 'Manual';
  if (['automatic', 'automática', 'automatica', 'auto'].includes(k)) return 'Automatic';
  if (['cvt'].includes(k)) return 'CVT';
  if (['semi-automatic', 'semiautomática', 'semiautomatica'].includes(k)) return 'Semi-Automatic';
  if (['tiptronic'].includes(k)) return 'Tiptronic';
  if (['dct', 'dual clutch', 'doble embrague'].includes(k)) return 'Dual-Clutch';
  return undefined;
};

const fuelEs: Record<FuelEN, string> = {
  Gasoline: 'Gasolina',
  Diesel: 'Diésel',
  Hybrid: 'Híbrido',
  Electric: 'Eléctrico',
  Gas: 'Gas',
};

const transEs: Record<TransEN, string> = {
  Manual: 'Manual',
  Automatic: 'Automática',
  CVT: 'CVT',
  'Semi-Automatic': 'Semiautomática',
  Tiptronic: 'Tiptronic',
  'Dual-Clutch': 'Doble embrague',
};

interface VehicleGridCardProps {
  vehicle: Vehicle;
  newBadgeText?: string;
}

/* =============================
 * Colores por tipo de etiqueta
 * ============================= */
const getChipColor = (txt: string) => {
  const k = txt.toLowerCase();
  if (k.includes('nuevo') || k.includes('0 km') || k.includes('seminuevo')) return '#F5036A'; // magenta
  if (k.includes('recién') || k.includes('recien')) return '#A21CAF'; // violeta
  if (k.includes('usado')) return '#22D3EE'; // cyan
  if (k.includes('garant')) return '#22C55E'; // verde
  if (k.includes('destacad') || k.includes('promo') || k.includes('oportunidad')) return '#F59E0B'; // ámbar
  return '#8B5CF6'; // violeta genérico
};

/* =============================
 * Etiqueta con borde de color (efecto neón minimalista)
 * ============================= */
type NeonTagProps = {
  text: string;
  color?: string;
};

const NeonTag = ({ text, color = '#F5036A' }: NeonTagProps) => {
  return (
    <div
      className="rounded-full  inline-block"
      style={{ backgroundColor: color }}
    >
      <div className="bg-gradient-to-r from-black/40 to-transparent px-3 py-1 rounded-full flex items-center justify-center">
        <span className="text-white text-[12px] font-semibold tracking-wide uppercase">
          {text}
        </span>
      </div>
    </div>
  );
};

const VehicleGridCard = ({ vehicle, newBadgeText = 'Nuevo' }: VehicleGridCardProps) => {
  const router = useRouter();
  const { formatPrice } = useCurrency();

  // Estados
  const status = (vehicle.status?.name || '').trim().toLowerCase();
  const isSold = status === 'vendido';
  const isReserved = status === 'reservado';
  const isUnavailable = isSold || isReserved;

  // "Reciente"
  const isNew = () => {
    if (!vehicle.created_at) return false;
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    return new Date(vehicle.created_at) > fiveDaysAgo;
  };

  // Badge promocional
  const promoBadgeText = (() => {
    if (vehicle.label) return vehicle.label;
    if (!isUnavailable && isNew()) {
      const opts = ['Nuevo', 'Recién llegado', 'Oportunidad', 'Destacado'];
      const hash = vehicle.id
        ? vehicle.id.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0)
        : Math.floor(Math.random() * 1000);
      return newBadgeText === 'Nuevo' ? opts[hash % opts.length] : newBadgeText;
    }
    return undefined;
  })();

  const goDetails = () => {
    if (!isUnavailable && vehicle.id) router.push(`/vehicles/${vehicle.id}`);
  };

  const formattedPrice = formatPrice(vehicle.price);
  const discountedPrice =
    vehicle.discount_percentage && vehicle.discount_percentage > 0
      ? vehicle.price * (1 - vehicle.discount_percentage / 100)
      : null;

  const mileageText =
    typeof vehicle.mileage === 'number' ? `${vehicle.mileage.toLocaleString('es-CL')} km` : '—';

  const transRaw = (vehicle as any).transmission ?? (vehicle as any).transmission_type;
  const transNorm = normalizeTrans(typeof transRaw === 'string' ? transRaw : String(transRaw ?? ''));
  const transLabel = transNorm ? transEs[transNorm] : '—';

  const fuelNorm = normalizeFuel(vehicle.fuel_type?.name);
  const fuelLabel = fuelNorm ? fuelEs[fuelNorm] : '—';

  const specs = [
    { icon: <Gauge size={16} className="opacity-80" />, text: mileageText },
    { icon: <Calendar size={16} className="opacity-80" />, text: vehicle.year ? String(vehicle.year) : '—' },
    { icon: <Settings size={16} className="opacity-80" />, text: transLabel },
    { icon: <Fuel size={16} className="opacity-80" />, text: fuelLabel },
  ];

  const conditionText = vehicle.condition?.name
    ? vehicle.condition.name.charAt(0).toUpperCase() + vehicle.condition.name.slice(1).toLowerCase()
    : undefined;

  const backendArrays = [
    (vehicle as any).badges,
    (vehicle as any).tags,
    (vehicle as any).labels,
  ].filter(Array.isArray) as string[][];

  const setLower = new Set<string>();
  const addUnique = (arr: string[], val?: string) => {
    if (!val) return arr;
    const v = val.trim();
    if (!setLower.has(v.toLowerCase())) {
      setLower.add(v.toLowerCase());
      arr.push(v);
    }
    return arr;
  };

  let leftChips: string[] = [];
  leftChips = addUnique(leftChips, conditionText);
  if (isNew()) leftChips = addUnique(leftChips, 'Recién llegado');
  backendArrays.forEach((a) => a.forEach((v) => addUnique(leftChips, v)));
  if (promoBadgeText) leftChips = leftChips.filter((c) => c.toLowerCase() !== promoBadgeText.toLowerCase());
  leftChips = leftChips.slice(0, 4);

  return (
    <div
      role={!isUnavailable ? 'button' : undefined}
      tabIndex={!isUnavailable ? 0 : -1}
      onClick={!isUnavailable ? goDetails : undefined}
      className={`group h-full outline-none ${!isUnavailable ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <Card
        className={`h-full flex flex-col overflow-hidden rounded-2xl
        bg-white dark:bg-[#0B0B0F]
        border border-black/10 dark:border-white/10
        shadow-sm transition-all duration-300
        ${isUnavailable ? 'opacity-90' : 'group-hover:shadow-xl group-hover:-translate-y-2'}`}
      >
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-black">
          {vehicle.main_image ? (
            <div
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url(${vehicle.main_image})` }}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-neutral-200 dark:bg-neutral-900">
              <Car size={48} className="text-neutral-400" />
            </div>
          )}

          {/* Ribbons */}
          {isSold && (
            <div className="absolute top-0 right-0 h-[200px] w-[200px] overflow-hidden z-20">
              <div className="absolute top-[30px] right-[-50px] bg-rose-600 text-white font-bold py-2 w-[250px] text-center rotate-45">
                VENDIDO
              </div>
            </div>
          )}
          {isReserved && (
            <div className="absolute top-0 right-0 h-[200px] w-[200px] overflow-hidden z-20">
              <div className="absolute top-[30px] right-[-50px] bg-amber-400 text-black font-bold py-2 w-[250px] text-center rotate-45">
                RESERVADO
              </div>
            </div>
          )}

          {/* Badges izquierda */}
          {leftChips.length > 0 && (
            <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2 max-w-[72%]">
              {leftChips.map((txt, i) => (
                <NeonTag key={i} text={txt} color={getChipColor(txt)} />
              ))}
            </div>
          )}

          {/* Badge derecha */}
          {promoBadgeText && (
            <div className="absolute top-3 right-3 z-20">
              <NeonTag text={promoBadgeText} color={getChipColor(promoBadgeText)} />
            </div>
          )}
        </div>

        {/* CONTENIDO */}
        <CardBody className="flex-1 px-5 pt-4 pb-2">
          <h3 className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-neutral-900 dark:text-white">
            {vehicle.model?.name ?? 'Modelo'}
          </h3>
          <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
            {vehicle.brand?.name} {vehicle.year ?? ''}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-[13px] text-neutral-800 dark:text-neutral-300">
            {specs.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 min-w-0">
                {s.icon}
                <span className="truncate">{s.text}</span>
              </div>
            ))}
          </div>

          {Array.isArray(vehicle.features) && vehicle.features.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {vehicle.features.slice(0, 3).map((f, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full text-[11px] leading-5 bg-neutral-100 text-neutral-700 dark:bg-white/5 dark:text-neutral-200"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </CardBody>

        {/* FOOTER */}
        <CardFooter className="px-5 pb-5 pt-3">
          <div className="w-full flex items-end justify-between">
            <div className="flex flex-col">
              {discountedPrice ? (
                <>
                  <span className="text-sm line-through text-neutral-500 dark:text-neutral-400">
                    {formattedPrice}
                  </span>
                  <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    {formatPrice(discountedPrice)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                  {formattedPrice}
                </span>
              )}
            </div>

            {isUnavailable && (
              <span className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">
                No disponible
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VehicleGridCard;
