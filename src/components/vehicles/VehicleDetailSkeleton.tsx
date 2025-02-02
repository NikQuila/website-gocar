import { Card, CardBody, Skeleton, Divider } from '@heroui/react';

export default function VehicleDetailSkeleton() {
  return (
    <div className='grid gap-8 lg:grid-cols-2'>
      {/* Image Gallery Skeleton */}
      <div className='space-y-4'>
        <Skeleton className='rounded-lg'>
          <div className='h-[400px] w-full rounded-lg bg-default-300'></div>
        </Skeleton>

        <div className='grid grid-cols-4 gap-2'>
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className='rounded-lg'>
              <div className='h-24 w-full rounded-lg bg-default-300'></div>
            </Skeleton>
          ))}
        </div>

        <div className='flex justify-end'>
          <Skeleton className='rounded-full'>
            <div className='h-6 w-32 rounded-full bg-default-200'></div>
          </Skeleton>
        </div>
      </div>

      {/* Details Skeleton */}
      <div className='space-y-6'>
        <div>
          <Skeleton className='rounded-lg mb-2'>
            <div className='h-10 w-3/4 rounded-lg bg-default-300'></div>
          </Skeleton>
          <Skeleton className='rounded-lg'>
            <div className='h-8 w-1/3 rounded-lg bg-default-200'></div>
          </Skeleton>
        </div>

        <Divider />

        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          {[...Array(4)].map((_, index) => (
            <Card key={index} className='bg-gray-50'>
              <CardBody className='gap-2 p-3'>
                <Skeleton className='rounded-full'>
                  <div className='h-6 w-6 rounded-full bg-default-300'></div>
                </Skeleton>
                <Skeleton className='rounded-lg'>
                  <div className='h-4 w-16 rounded-lg bg-default-200'></div>
                </Skeleton>
                <Skeleton className='rounded-lg'>
                  <div className='h-4 w-20 rounded-lg bg-default-300'></div>
                </Skeleton>
              </CardBody>
            </Card>
          ))}
        </div>

        <Divider />

        <div>
          <Skeleton className='rounded-lg mb-3'>
            <div className='h-6 w-32 rounded-lg bg-default-300'></div>
          </Skeleton>
          <Skeleton className='rounded-lg'>
            <div className='h-24 w-full rounded-lg bg-default-200'></div>
          </Skeleton>
        </div>

        <div>
          <Skeleton className='rounded-lg mb-3'>
            <div className='h-6 w-40 rounded-lg bg-default-300'></div>
          </Skeleton>
          <div className='flex flex-wrap gap-2'>
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className='rounded-full'>
                <div className='h-6 w-24 rounded-full bg-default-200'></div>
              </Skeleton>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row'>
          <Skeleton className='rounded-lg flex-1'>
            <div className='h-12 w-full rounded-lg bg-default-300'></div>
          </Skeleton>
          <Skeleton className='rounded-lg flex-1'>
            <div className='h-12 w-full rounded-lg bg-default-300'></div>
          </Skeleton>
        </div>
      </div>
    </div>
  );
}
