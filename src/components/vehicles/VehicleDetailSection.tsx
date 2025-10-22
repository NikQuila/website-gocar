'use client';

import {
  Card,
  CardBody,
  Image,
  Button,
  Chip,
  Divider,
  useDisclosure,
  Tooltip,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { useState, useEffect, useMemo, useRef } from 'react';

import VehicleDetailSkeleton from './VehicleDetailSkeleton';
import VehicleImagesModal from './VehicleImagesModal';
import type { Client, Vehicle } from '../../utils/types';
import { mapTransmissionTypeToSpanish, contactByWhatsApp } from '@/utils/functions';
import useCustomerStore from '@/store/useCustomerStore';
import { supabase } from '@/lib/supabase';
import { useCurrency } from '@/hooks/useCurrency';
import { useTranslation } from '@/i18n/hooks/useTranslation';

interface VehicleDetailSectionProps {
  vehicle: Vehicle | null;
  loading?: boolean;
  client?: Client;
  onLike?: (vehicleId: string) => Promise<void>;
  isLiked?: boolean;
  showLikeButton?: boolean;
}

interface DetailCardProps {
  icon: string;
  label: string;
  value: string;
  className?: string;
}

/** Helpers de color */
function pickAccent(v: any): string {
  return (
    v?.theme_color ||
    v?.accent_color ||
    v?.brand?.primary_color ||
    v?.brand_color ||
    v?.ui_color ||
    '#6C2CF9'
  );
}
function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 108, g: 44, b: 249 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}
function bestTextColor(bgHex: string) {
  const { r, g, b } = hexToRgb(bgHex);
  const srgb = [r, g, b].map(v => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return L > 0.5 ? '#0b0b0b' : '#ffffff';
}

/** Tarjeta de especificación (compacta) */
function DetailCard({ icon, label, value, className }: DetailCardProps) {
  return (
    <div className={`group relative w-full ${className || ''}`} role="listitem" aria-label={`${label}: ${value}`}>
      <Card className="relative rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-gray-800 hover:border-primary/40 transition">
        <CardBody className="flex flex-col items-center justify-center gap-1.5 p-4">
          <Icon icon={icon} className="text-lg text-gray-700 dark:text-gray-200" />
          <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-[13px] font-semibold text-gray-900 dark:text-white text-center truncate max-w-[180px]">
            {value}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

/** Fila de miniaturas FLUIDA (una sola fila + “+N”) */
function ThumbRow({
  images,
  onOpenModal,
  gap = 12,
  aspect = 10 / 7,
  minThumb = 92,
  maxThumb = 148,
  maxCols = 6,
}: {
  images: string[];
  onOpenModal: (img?: string) => void;
  gap?: number;
  aspect?: number;
  minThumb?: number;
  maxThumb?: number;
  maxCols?: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [layout, setLayout] = useState({ cols: 0, thumbW: 0, thumbH: 0, show: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const compute = () => {
      const W = el.clientWidth;
      if (!W) return;

      let bestCols = 1;
      let bestW = W;

      for (let cols = 1; cols <= maxCols; cols++) {
        const totalGap = gap * (cols - 1);
        const w = (W - totalGap) / cols;
        if (w >= minThumb && w <= maxThumb) {
          bestCols = cols;
          bestW = w;
        }
      }

      if (bestCols === 1) {
        for (let cols = 1; cols <= maxCols; cols++) {
          const totalGap = gap * (cols - 1);
          const w = (W - totalGap) / cols;
          if (w >= minThumb) { bestCols = cols; bestW = w; break; }
          if (cols === maxCols) { bestCols = cols; bestW = w; }
        }
      }

      const needsPlus = images.length > bestCols;
      const visible = needsPlus ? bestCols - 1 : Math.min(images.length, bestCols);
      const totalGapVisible = gap * (visible + (needsPlus ? 1 : 0) - 1);
      const tiles = visible + (needsPlus ? 1 : 0);
      const thumbW = (W - totalGapVisible) / tiles;
      const thumbH = Math.round(thumbW / aspect);

      setLayout({ cols: bestCols, thumbW, thumbH, show: visible });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [gap, aspect, minThumb, maxThumb, maxCols, images.length]);

  if (!images?.length) return null;

  const canShowAll = images.length <= layout.cols;
  const thumbs = canShowAll ? images.slice(0, layout.show || images.length) : images.slice(0, Math.max(0, layout.show));
  const remaining = Math.max(0, images.length - (thumbs.length));

  return (
    <div ref={wrapRef} className="w-full min-w-0">
      <div className="flex items-center" style={{ gap }}>
        {thumbs.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => onOpenModal(src)}
            className="relative  overflow-hidden rounded-xl ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-primary transition grid place-items-center"
            style={{ width: layout.thumbW, height: layout.thumbH }}
            aria-label={`Miniatura ${i + 1}`}
          >
            <img
              src={src}
              alt={`thumb ${i + 1}`}
              className="max-w-full  h-full w-auto  object-cover"
              loading="lazy"
              draggable={false}
            />
          </button>
        ))}

        {!canShowAll && (
          <button
            type="button"
            onClick={() => onOpenModal(thumbs[0] || images[0])}
            className="grid place-content-center rounded-xl bg-gray-100 dark:bg-dark-card ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-primary transition"
            style={{ width: layout.thumbW, height: layout.thumbH }}
            aria-label="Ver toda la galería"
          >
            <Icon icon="mdi:image-multiple" className="text-2xl text-gray-700 dark:text-gray-300" />
            <span className="text-xs text-gray-700 dark:text-gray-300">+{remaining}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function VehicleDetailSection({
  vehicle,
  loading = false,
  client,
  onLike,
  isLiked = false,
  showLikeButton = true,
}: VehicleDetailSectionProps) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const isLoadingUI = loading || !vehicle;
  const v = (vehicle ?? {}) as Vehicle;

  // hooks en orden
  const images = useMemo(
    () => (v?.main_image ? [v.main_image, ...(v.gallery || [])].filter(Boolean) : []),
    [v?.main_image, v?.gallery]
  );

  const ACCENT = pickAccent(v);
  const ACCENT_TEXT = bestTextColor(ACCENT);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentModalImage, setCurrentModalImage] = useState<string>('');
  const handleImageClick = (img: string) => {
    setCurrentModalImage(img);
    onOpen();
  };

  const [mainImageStyle, setMainImageStyle] = useState<Record<string, any>>({});
  useEffect(() => {
    if (isLoadingUI || !v?.main_image) return;
    const img = document.createElement('img');
    img.onload = () => {
      const vertical = img.height > img.width * 1.2;
      setMainImageStyle({
        objectPosition: vertical ? 'center 88%' : 'center center',
        objectFit: 'cover',
        width: '100%',
        height: '100%',
      });
    };
    img.src = v.main_image!;
  }, [isLoadingUI, v?.main_image]);

  const { setIsModalOpen } = useCustomerStore();
  const [sellerPhone, setSellerPhone] = useState<string | null>(null);
  const [dealershipPhone, setDealershipPhone] = useState<string | null>(null);
  const fmtPhone = (p?: string | null) => {
    if (!p) return null;
    const n = p.replace(/\D/g, '');
    if (n.length === 11 && n.startsWith('569')) return `+${n}`;
    if (n.length === 9 && n.startsWith('9')) return `+56${n}`;
    if (n.length === 8) return `+569${n}`;
    if (n.length === 12 && n.startsWith('0569')) return `+${n.slice(1)}`;
    if (n.length === 13 && n.startsWith('00569')) return `+${n.slice(2)}`;
    return null;
  };
  useEffect(() => {
    if (isLoadingUI) return;
    const run = async () => {
      if (v?.seller_id) {
        const { data } = await supabase.from('users').select('phone').eq('id', v.seller_id).single();
        setSellerPhone(fmtPhone(data?.phone));
      }
      if (v?.dealership_id) {
        const { data } = await supabase.from('dealerships').select('phone').eq('id', v.dealership_id).single();
        setDealershipPhone(fmtPhone(data?.phone));
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingUI, v?.seller_id, v?.dealership_id]);

  const getPhone = () => sellerPhone || dealershipPhone || fmtPhone(client?.contact?.phone) || '';

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = `${v.brand?.name} ${v.model?.name} ${v.year}`;
    if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
      try { await navigator.share({ title, text: `Mira este ${title}`, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); toast.success('¡Enlace copiado!', { autoClose: 1600 }); }
      catch { toast.error('Error al copiar', { autoClose: 1600 }); }
    }
  };

  const handleLike = async () => {
    if (!client) return setIsModalOpen(true);
    if (onLike && v.id) await onLike(v.id);
  };

  const isSold = v.status?.name === 'Vendido';
  const isReserved = v.status?.name === 'Reservado';

  const price = v.price ?? 0;
  const formattedPrice = formatPrice(price);
  const discountedPrice = v.discount_percentage ? price * (1 - (v.discount_percentage || 0) / 100) : null;

  if (isLoadingUI) {
    return <VehicleDetailSkeleton />;
  }

  return (
    <div
      className="
        isolate
        max-w-[1280px] mx-auto w-full
        grid gap-6 sm:gap-8
        grid-cols-1
        lg:[grid-template-columns:minmax(0,1fr)_minmax(420px,480px)]
        xl:[grid-template-columns:minmax(0,1fr)_minmax(460px,520px)]
        px-0 md:px-6
      "
    >
      {/* ===== Columna izquierda ===== */}
      <div className="space-y-4 min-w-0 md:sticky md:top-24 self-start">
        <Card className="w-full relative dark:bg-dark-card dark:border-dark-border rounded-3xl overflow-hidden border border-gray-100 shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
          {(isSold || isReserved) && (
            <div className="absolute top-0 right-0 h-[200px] w-[200px] overflow-hidden z-20">
              <div className={`absolute top-[30px] right-[-50px] ${isSold ? 'bg-sold' : 'bg-yellow-500'} text-white font-bold py-2 w-[250px] text-center transform rotate-45`}>
                {(isSold ? t('vehicles.status.sold') : t('vehicles.status.reserved')).toUpperCase()}
              </div>
            </div>
          )}

          <CardBody className="p-0 w-full">
            <div className="relative  w-full overflow-hidden rounded-[22px]">
              <div className="relative aspect-[4/3] md:aspect-[16/11] 2xl:aspect-[16/10] max-h-[540px]">
                {!!images[0] && (
                  <Image
                    alt={`${v?.brand?.name} ${v?.model?.name}`}
                    className={`absolute inset-0 w-full h-full cursor-pointer ${isSold || isReserved ? 'opacity-85' : ''}`}
                    style={mainImageStyle}
                    src={images[0]}
                    onClick={() => handleImageClick(images[0])}
                    removeWrapper
                    radius="none"
                  />
                )}
              </div>
              <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5 dark:ring-white/10 rounded-[22px]" />
            </div>
          </CardBody>
        </Card>

        {images.length > 1 && (
          <ThumbRow
            images={images}
            onOpenModal={(img) => handleImageClick(img || images[0])}
            gap={12}
            aspect={10 / 7}
            minThumb={92}
            maxThumb={148}
            maxCols={6}
          />
        )}
      </div>

      {/* ===== Columna derecha ===== */}
      <div className="min-w-0">
        <Card
          className="
            relative rounded-3xl overflow-hidden
            bg-white dark:bg-dark-card
            shadow-[0_8px_28px_rgba(0,0,0,0.08)]
            border border-gray-100 dark:border-gray-800
            md:sticky md:top-24
          "
        >
          {/* Header */}
          <div className="p-5 md:p-6 border-b border-gray-200/70 dark:border-gray-700/60">
            <div className="flex items-start justify-between gap-3 min-w-0">
              <div className="min-w-0">
                <h1 className="text-[26px] md:text-[32px] leading-tight font-extrabold text-gray-900 dark:text-white break-words">
                  {v.brand?.name} {v.model?.name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center h-7 px-2.5 rounded-full text-xs md:text-sm ring-1 ring-gray-200 dark:ring-gray-700 text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-white/5">
                    <Icon icon="mdi:calendar" className="text-base" />
                    {v.year}
                  </span>

                  {v.discount_percentage ? (
                    <span className="inline-flex items-center h-7 px-2 rounded-md text-xs font-semibold bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30">
                      <Icon icon="mdi:tag-outline" className="text-base" />
                      -{v.discount_percentage}%
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Botón compartir (DESKTOP) */}
              <div className="hidden sm:flex shrink-0 items-center">
                <Button
                  isIconOnly
                  radius="full"
                  variant="light"
                  size="lg"
                  onPress={handleShare}
                  aria-label={t('common.actions.share')}
                  style={{ color: ACCENT }}
                  className="hover:opacity-90"
                >
                  <Icon icon="mdi:share-variant" className="text-2xl" />
                </Button>
              </div>

              {/* Botón compartir (MOBILE) */}
              <div className="flex sm:hidden shrink-0 items-center">
                <Button
                  isIconOnly
                  radius="full"
                  variant="light"
                  size="md"
                  onPress={handleShare}
                  aria-label={t('common.actions.share')}
                  style={{ color: ACCENT }}
                  className="hover:opacity-90"
                >
                  <Icon icon="mdi:share-variant" className="text-xl" />
                </Button>
              </div>
            </div>
          </div>

          {/* Body */}
          <CardBody className="p-4 md:p-6 space-y-6">
            {/* Precio */}
            <div className="space-y-2">
              {v.discount_percentage ? (
                <>
                  <p className="text-[36px] md:text-[42px] font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-800 dark:from-white dark:to-white/90 leading-none tracking-tight whitespace-nowrap tabular-nums">
                    {formatPrice(discountedPrice!)}
                  </p>
                  <p className="text-sm line-through text-gray-400 dark:text-gray-500 whitespace-nowrap tabular-nums">
                    {formattedPrice}
                  </p>
                </>
              ) : (
                <p className="text-[36px] md:text-[42px] font-black text-gray-900 dark:text-white leading-none tracking-tight whitespace-nowrap tabular-nums">
                  {formattedPrice}
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {showLikeButton && (
                <Button
                  size="lg"
                  variant="bordered"
                  onPress={handleLike}
                  aria-label={t('common.actions.save')}
                  className="sm:flex-1"
                  style={{ borderColor: ACCENT, color: ACCENT }}
                  startContent={<Icon icon={isLiked ? 'mdi:heart' : 'mdi:heart-outline'} />}
                >
                  {t('common.actions.save')}
                </Button>
              )}
              <Button
                size="lg"
                as="a"
                startContent={<Icon icon="mdi:whatsapp" className="text-xl" />}
                href={contactByWhatsApp(
                  getPhone(),
                  `Hola, me interesa el ${v.brand?.name} ${v?.model?.name} ${v.year} que vi en ${typeof window !== 'undefined' ? window.location.href : ''}`
                )}
                target="_blank"
                className="sm:flex-1"
                aria-label={t('vehicles.card.contact')}
                style={{ backgroundColor: ACCENT, color: bestTextColor(ACCENT) }}
              >
                {t('vehicles.card.contact')}
              </Button>
            </div>

            <Divider className="dark:border-dark-border" />

            {/* Specs */}
            <div role="list" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <DetailCard
                icon="mdi:speedometer"
                label={t('vehicles.card.mileage')}
                value={`${(v.mileage ?? 0).toLocaleString()} ${t('common.units.km')}`}
              />
              <DetailCard
                icon="mdi:gas-station"
                label={t('vehicles.card.fuel')}
                value={v.fuel_type?.name ? v.fuel_type.name[0].toUpperCase() + v.fuel_type.name.slice(1) : ''}
              />
              <DetailCard
                icon="mdi:car-shift-pattern"
                label={t('vehicles.card.transmission')}
                value={mapTransmissionTypeToSpanish(v.transmission)}
              />
              <DetailCard
                icon="mdi:palette"
                label={t('vehicles.card.color')}
                value={v.color?.name ? v.color.name[0].toUpperCase() + v.color.name.slice(1) : ''}
              />
            </div>

            {!!v?.features?.length && (
              <>
                <Divider className="dark:border-dark-border" />
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                    {t('vehicles.details.features')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {v.features.map((feature, i) => (
                      <Chip
                        key={`${feature}-${i}`}
                        variant="flat"
                        className="bg-gray-100 dark:bg-dark-card border-none rounded-md text-gray-700 dark:text-gray-300"
                        startContent={<Icon icon="mdi:check-circle-outline" className="text-base opacity-70" />}
                      >
                        {feature}
                      </Chip>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!!v.description && (
              <>
                <Divider className="dark:border-dark-border" />
                <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-gray-100 dark:border-gray-800 p-4">
                  <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {t('vehicles.details.description')}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Modal imágenes */}
      <VehicleImagesModal
        isOpen={isOpen}
        onClose={onClose}
        currentImage={currentModalImage || images[0] || ''}
        images={images}
        onImageChange={setCurrentModalImage}
      />
    </div>
  );
}
