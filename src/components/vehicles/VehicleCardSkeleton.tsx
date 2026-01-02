'use client';

import { Card, CardBody, CardFooter, Skeleton } from '@heroui/react';

const VehicleCardSkeleton = () => {
  return (
    <Card
      className="h-full flex flex-col overflow-hidden rounded-2xl
        bg-white dark:bg-[#0B0B0F]
        border border-black/10 dark:border-transparent
        shadow-sm"
    >
      {/* Imagen con aspect ratio 16/9 */}
      <Skeleton className="w-full aspect-[16/9] rounded-none dark:bg-dark-border">
        <div className="w-full aspect-[16/9] bg-default-300 dark:bg-dark-border" />
      </Skeleton>

      {/* Contenido */}
      <CardBody className="flex-1 px-5 pt-4 pb-2">
        {/* Título */}
        <Skeleton className="w-3/4 rounded-lg dark:bg-dark-border">
          <div className="h-7 rounded-lg bg-default-300 dark:bg-dark-border" />
        </Skeleton>

        {/* Subtítulo (marca + año) */}
        <Skeleton className="w-1/2 rounded-lg mt-1.5 dark:bg-dark-border">
          <div className="h-5 rounded-lg bg-default-200 dark:bg-dark-border" />
        </Skeleton>

        {/* Grid de specs 2x2 */}
        <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="rounded-lg dark:bg-dark-border">
              <div className="h-5 rounded-lg bg-default-200 dark:bg-dark-border" />
            </Skeleton>
          ))}
        </div>

        {/* Features chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="rounded-full dark:bg-dark-border">
              <div className="h-5 w-16 rounded-full bg-default-200 dark:bg-dark-border" />
            </Skeleton>
          ))}
        </div>
      </CardBody>

      {/* Footer con precio */}
      <CardFooter className="px-5 pb-5 pt-3">
        <Skeleton className="w-2/5 rounded-lg dark:bg-dark-border">
          <div className="h-8 rounded-lg bg-default-300 dark:bg-dark-border" />
        </Skeleton>
      </CardFooter>
    </Card>
  );
};

export default VehicleCardSkeleton;
