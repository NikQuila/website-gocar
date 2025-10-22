'use client';

import { Card, CardBody, Skeleton, Divider, Button } from '@heroui/react';

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
        px-4 md:px-6
      "
    >
      {/* IZQUIERDA: Galería (sticky en real; aquí solo estructura) */}
      <div className="space-y-4 min-w-0">
        <Card className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
          <CardBody className="p-0">
            <div className="relative w-full overflow-hidden rounded-[22px]">
              {/* Marco con aspect-ratio como en el componente real */}
              <div className="relative aspect-[4/3] md:aspect-[16/11] 2xl:aspect-[16/10] max-h-[540px]">
                <Skeleton className="absolute inset-0 rounded-[22px] dark:bg-dark-card">
                  <div className="w-full h-full bg-default-300 dark:bg-dark-border rounded-[22px]" />
                </Skeleton>
              </div>
              <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5 dark:ring-white/10 rounded-[22px]" />
            </div>
          </CardBody>
        </Card>

        {/* Thumbs (capacidad típica 4) */}
        <div className="flex items-center gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="rounded-xl dark:bg-dark-card">
              <div className="w-[120px] h-[84px] rounded-xl bg-default-300 dark:bg-dark-border" />
            </Skeleton>
          ))}
          <Skeleton className="rounded-xl dark:bg-dark-card">
            <div className="w-[120px] h-[84px] rounded-xl bg-default-200 dark:bg-dark-border" />
          </Skeleton>
        </div>
      </div>

      {/* DERECHA: Panel info (sticky en real) */}
      <div className="min-w-0">
        <Card className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-[0_8px_28px_rgba(0,0,0,0.08)]">
          {/* Header */}
          <div className="p-5 md:p-6 border-b border-gray-200/70 dark:border-gray-700/60">
            <div className="flex items-start justify-between gap-3 min-w-0">
              <div className="min-w-0 w-full">
                {/* Título multilínea */}
                <div className="space-y-2">
                  <Skeleton className="rounded-lg dark:bg-dark-card">
                    <div className="h-7 w-11/12 bg-default-300 dark:bg-dark-border rounded-lg" />
                  </Skeleton>
                  <Skeleton className="rounded-lg dark:bg-dark-card">
                    <div className="h-7 w-8/12 bg-default-300 dark:bg-dark-border rounded-lg" />
                  </Skeleton>
                </div>

                {/* Chips año/desc */}
                <div className="mt-3 flex gap-2">
                  <Skeleton className="rounded-full dark:bg-dark-card">
                    <div className="h-7 w-20 rounded-full bg-default-200 dark:bg-dark-border" />
                  </Skeleton>
                  <Skeleton className="rounded-md dark:bg-dark-card">
                    <div className="h-7 w-24 rounded-md bg-default-200 dark:bg-dark-border" />
                  </Skeleton>
                </div>
              </div>

              {/* Botón compartir (icono circular) */}
              <Skeleton className="rounded-full shrink-0 dark:bg-dark-card">
                <div className="h-12 w-12 rounded-full bg-default-200 dark:bg-dark-border" />
              </Skeleton>
            </div>
          </div>

          {/* Body */}
          <CardBody className="p-5 md:p-6 space-y-6">
            {/* Precio (una sola línea + tachado opcional) */}
            <div className="space-y-2">
              <Skeleton className="rounded-lg dark:bg-dark-card">
                <div className="h-10 w-2/3 rounded-lg bg-default-300 dark:bg-dark-border" />
              </Skeleton>
              <Skeleton className="rounded-lg dark:bg-dark-card">
                <div className="h-4 w-1/3 rounded-lg bg-default-200 dark:bg-dark-border" />
              </Skeleton>
            </div>

            {/* CTAs (Guardar + Contactar) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Skeleton className="rounded-lg flex-1 dark:bg-dark-card">
                <div className="h-12 w-full rounded-lg bg-default-300 dark:bg-dark-border" />
              </Skeleton>
              <Skeleton className="rounded-lg flex-1 dark:bg-dark-card">
                <div className="h-12 w-full rounded-lg bg-default-300 dark:bg-dark-border" />
              </Skeleton>
            </div>

            <Divider className="dark:border-dark-border" />

            {/* Specs: 4 por fila en desktop, compactas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
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

            {/* Descripción */}
            <div>
              <Skeleton className="rounded-lg mb-3 dark:bg-dark-card">
                <div className="h-6 w-40 rounded-lg bg-default-300 dark:bg-dark-border" />
              </Skeleton>
              <Skeleton className="rounded-2xl dark:bg-dark-card">
                <div className="h-28 w-full rounded-2xl bg-default-200 dark:bg-dark-border" />
              </Skeleton>
            </div>

            {/* Features */}
            <div>
              <Skeleton className="rounded-lg mb-3 dark:bg-dark-card">
                <div className="h-6 w-48 rounded-lg bg-default-300 dark:bg-dark-border" />
              </Skeleton>
              <div className="flex flex-wrap gap-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="rounded-md dark:bg-dark-card">
                    <div className="h-7 w-24 rounded-md bg-default-200 dark:bg-dark-border" />
                  </Skeleton>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
