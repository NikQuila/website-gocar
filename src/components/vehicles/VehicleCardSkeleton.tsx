'use client';

import { Card, Skeleton } from '@heroui/react';

const VehicleCardSkeleton = () => {
  return (
    <Card className='p-4 space-y-3' radius='lg'>
      <Skeleton className='rounded-lg'>
        <div className='h-[200px] rounded-lg bg-default-300'></div>
      </Skeleton>
      <div className='space-y-3'>
        <Skeleton className='w-3/5 rounded-lg'>
          <div className='h-6 w-3/5 rounded-lg bg-default-300'></div>
        </Skeleton>
        <Skeleton className='w-4/5 rounded-lg'>
          <div className='h-4 w-4/5 rounded-lg bg-default-200'></div>
        </Skeleton>
        <div className='flex gap-3'>
          <Skeleton className='w-1/3 rounded-lg'>
            <div className='h-8 w-full rounded-lg bg-default-300'></div>
          </Skeleton>
          <Skeleton className='w-1/3 rounded-lg'>
            <div className='h-8 w-full rounded-lg bg-default-300'></div>
          </Skeleton>
          <Skeleton className='w-1/3 rounded-lg'>
            <div className='h-8 w-full rounded-lg bg-default-300'></div>
          </Skeleton>
        </div>
      </div>
    </Card>
  );
};

export default VehicleCardSkeleton;
