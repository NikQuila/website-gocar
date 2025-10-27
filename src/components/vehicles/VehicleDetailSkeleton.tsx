'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardBody, Skeleton, Divider } from '@heroui/react';
import { Icon } from '@iconify/react';

/** === Miniaturas: calc como ThumbRow + fallback SSR para evitar pop-in === */
function SkeletonThumbRow({
  gap = 12,
  aspect = 10 / 7,
  minThumb = 92,
  maxThumb = 148,
  maxCols = 6,
  fallbackCountMobile = 3,  // simula <4 en móvil (no estira)
  fallbackCountDesktop = 6, // simula >=4 en md+ (habrá +N)
}: {
  gap?: number;
  aspect?: number;
  minThumb?: number;
  maxThumb?: number;
  maxCols?: number;
  fallbackCountMobile?: number;
  fallbackCountDesktop?: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Fallback inmediato (SSR/primer paint) para evitar “aparece de golpe”
  const FALLBACK_W = 104; // dentro del rango (92..148)
  const FALLBACK_H = Math.round(FALLBACK_W / aspect);

  const [layout, setLayout] = useState<{
    cols: number;
    thumbW: number;
    thumbH: number;
    show: number;
    plus: boolean;
    ready: boolean; // si ya calculamos con ResizeObserver
  }>({
    cols: 3,
    thumbW: FALLBACK_W,
    thumbH: FALLBACK_H,
    show: fallbackCountMobile,
    plus: false,
    ready: false,
  });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const compute = () => {
      const W = el.clientWidth || 0;
      if (!W) return;

      const isMd = W >= 768;
      const count = isMd ? fallbackCountDesktop : fallbackCountMobile;

      // Rama <4: NO llenar el ancho (igual a ThumbRow)
      if (count > 0 && count < 4) {
        const thumbW = Math.min(maxThumb, Math.max(minThumb, Math.floor(W / 4 - gap)));
        const thumbH = Math.round(thumbW / aspect);
        setLayout({ cols: count, thumbW, thumbH, show: count, plus: false, ready: true });
        return;
      }

      // Fluido (>=4)
      let bestCols = 1;
      for (let cols = 1; cols <= maxCols; cols++) {
        const totalGap = gap * (cols - 1);
        const w = (W - totalGap) / cols;
        if (w >= minThumb && w <= maxThumb) bestCols = cols;
      }
      if (bestCols === 1) {
        for (let cols = 1; cols <= maxCols; cols++) {
          const totalGap = gap * (cols - 1);
          const w = (W - totalGap) / cols;
          if (w >= minThumb) { bestCols = cols; break; }
          if (cols === maxCols) bestCols = cols;
        }
      }

      const needsPlus = (isMd ? fallbackCountDesktop : fallbackCountMobile) > bestCols;
      const visible = needsPlus ? bestCols - 1 : Math.min((isMd ? fallbackCountDesktop : fallbackCountMobile), bestCols);

      const totalGapVisible = gap * (visible + (needsPlus ? 1 : 0) - 1);
      const tiles = visible + (needsPlus ? 1 : 0);
      const thumbW = (W - totalGapVisible) / tiles;
      const thumbH = Math.round(thumbW / aspect);

      setLayout({ cols: bestCols, thumbW, thumbH, show: visible, plus: needsPlus, ready: true });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [gap, aspect, minThumb, maxThumb, maxCols, fallbackCountMobile, fallbackCountDesktop]);

  // Estilo de fila (igual a ThumbRow)
  const rowStyle: React.CSSProperties =
    layout.cols < 4 ? { gap, justifyContent: 'flex-start' } : { gap };

  // Reservamos altura mínima para que no “salte” cuando se hidrate
  const reservedH = layout.ready ? layout.thumbH : FALLBACK_H;

  return (
    <div ref={wrapRef} className="w-full min-w-0">
      <div
        className="flex items-center md:pb-10 md:px-2"
        style={{ ...rowStyle, minHeight: reservedH }}
      >
        {Array.from({ length: layout.show }).map((_, i) => (
          <Skeleton key={i} className="rounded-xl dark:bg-dark-card">
            <div
              className="rounded-xl bg-default-300 dark:bg-dark-border"
              style={{ width: layout.thumbW, height: layout.thumbH, flex: '0 0 auto' }}
            />
          </Skeleton>
        ))}

        {layout.plus && (
          <Skeleton className="rounded-xl dark:bg-dark-card">
            <div
              className="rounded-xl bg-default-200 dark:bg-dark-border grid place-content-center"
              style={{ width: layout.thumbW, height: layout.thumbH, flex: '0 0 auto' }}
            >
              <div className="flex flex-col items-center gap-1 opacity-70">
                <Icon icon="mdi:image-multiple" className="text-2xl" />
                <div className="h-3 w-8 rounded bg-default-300 dark:bg-dark-border" />
              </div>
            </div>
          </Skeleton>
        )}
      </div>
    </div>
  );
}

export default function VehicleDetailSkeleton() {
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
      {/* IZQUIERDA: Galería */}
      <div className="space-y-4 min-w-0">
        <Card className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
          <CardBody className="p-0">
            <div className="relative w-full overflow-hidden rounded-[22px]">
              <div className="relative aspect-[4/3] md:aspect-[16/11] 2xl:aspect-[16/10]">
                <Skeleton className="absolute inset-0 rounded-[22px] dark:bg-dark-card">
                  <div className="h-full w-full bg-default-300 dark:bg-dark-border rounded-[22px]" />
                </Skeleton>
              </div>
              <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5 dark:ring-white/10 rounded-[22px]" />
            </div>
          </CardBody>
        </Card>

        {/* THUMBS: idéntico comportamiento a ThumbRow, sin “aparecer de golpe” */}
        <SkeletonThumbRow />
      </div>

      {/* DERECHA: Panel info */}
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
                <div className="space-y-2">
                  <Skeleton className="rounded-lg dark:bg-dark-card">
                    <div className="h-7 w-11/12 bg-default-300 dark:bg-dark-border rounded-lg" />
                  </Skeleton>
                  <Skeleton className="rounded-lg dark:bg-dark-card">
                    <div className="h-7 w-8/12 bg-default-300 dark:bg-dark-border rounded-lg" />
                  </Skeleton>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Skeleton className="rounded-full dark:bg-dark-card">
                    <div className="h-7 w-20 rounded-full bg-default-200 dark:bg-dark-border" />
                  </Skeleton>
                  <Skeleton className="rounded-md dark:bg-dark-card">
                    <div className="h-7 w-24 rounded-md bg-default-200 dark:bg-dark-border" />
                  </Skeleton>
                </div>
              </div>

              {/* Acciones: 2 iconos (share + like) como en el componente */}
              <div className="hidden sm:flex shrink-0 items-center gap-2">
                <Skeleton className="rounded-full dark:bg-dark-card">
                  <div className="h-12 w-12 rounded-full bg-default-200 dark:bg-dark-border" />
                </Skeleton>
                <Skeleton className="rounded-full dark:bg-dark-card">
                  <div className="h-12 w-12 rounded-full bg-default-200 dark:bg-dark-border" />
                </Skeleton>
              </div>

              {/* Mobile acciones grandes */}
              <div className="flex sm:hidden shrink-0 items-center gap-2">
                <Skeleton className="rounded-full dark:bg-dark-card">
                  <div className="h-12 w-12 rounded-full bg-default-200 dark:bg-dark-border" />
                </Skeleton>
                <Skeleton className="rounded-full dark:bg-dark-card">
                  <div className="h-12 w-12 rounded-full bg-default-200 dark:bg-dark-border" />
                </Skeleton>
              </div>
            </div>
          </div>

          {/* Body */}
          <CardBody className="p-4 md:p-6 space-y-6">
            {/* Precio */}
            <div className="space-y-2">
              <Skeleton className="rounded-lg dark:bg-dark-card">
                <div className="h-10 w-2/3 rounded-lg bg-default-300 dark:bg-dark-border" />
              </Skeleton>
              <Skeleton className="rounded-lg dark:bg-dark-card">
                <div className="h-4 w-1/3 rounded-lg bg-default-200 dark:bg-dark-border" />
              </Skeleton>
            </div>

            {/* CTA principal (una, como en el componente) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Skeleton className="rounded-lg flex-1 dark:bg-dark-card">
                <div className="h-12 w-full rounded-lg bg-default-300 dark:bg-dark-border" />
              </Skeleton>
            </div>

            <Divider className="dark:border-dark-border" />

            {/* Specs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-gray-800"
                >
                  <CardBody className="p-4 gap-2 items-center">
                    <Skeleton className="rounded-full dark:bg-dark-card">
                      <div className="h-6 w-6 rounded-full bg-default-300 dark:bg-dark-border" />
                    </Skeleton>
                    <Skeleton className="rounded-lg dark:bg-dark-card">
                      <div className="h-3 w-20 rounded-lg bg-default-200 dark:bg-dark-border" />
                    </Skeleton>
                    <Skeleton className="rounded-lg dark:bg-dark-card">
                      <div className="h-4 w-24 rounded-lg bg-default-300 dark:bg-dark-border" />
                    </Skeleton>
                  </CardBody>
                </Card>
              ))}
            </div>

            <Divider className="dark:border-dark-border" />

            {/* Features */}
            <div>
              <Skeleton className="rounded-lg mb-3 dark:bg-dark-card">
                <div className="h-6 w-48 rounded-lg bg-default-300 dark:bg-dark-border" />
              </Skeleton>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="rounded-md dark:bg-dark-card">
                    <div className="h-7 w-24 rounded-md bg-default-200 dark:bg-dark-border" />
                  </Skeleton>
                ))}
              </div>
            </div>

            <Divider className="dark:border-dark-border" />

            {/* Descripción */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 bg-white/60 dark:bg-white/5">
              <Skeleton className="rounded-lg mb-2 dark:bg-dark-card">
                <div className="h-6 w-56 rounded-lg bg-default-300 dark:bg-dark-border" />
              </Skeleton>
              <Skeleton className="rounded-2xl dark:bg-dark-card">
                <div className="h-24 w-full rounded-2xl bg-default-200 dark:bg-dark-border" />
              </Skeleton>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
