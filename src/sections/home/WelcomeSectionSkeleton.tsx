'use client';

import { Skeleton } from '@heroui/react';

const WelcomeSectionSkeleton = () => {
  return (
    <div className='bg-white dark:bg-dark-bg transition-colors'>
      <div className='relative isolate overflow-hidden'>
        <div className='mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8'>
          {/* Hero content - Centered */}
          <div className='text-center'>
            {/* Título principal */}
            <Skeleton className='h-[60px] sm:h-[72px] max-w-3xl mx-auto rounded-lg dark:bg-dark-border'>
              <div className='h-[60px] sm:h-[72px] rounded-lg bg-default-300 dark:bg-dark-border' />
            </Skeleton>

            {/* Descripción */}
            <Skeleton className='mt-6 h-8 max-w-2xl mx-auto rounded-lg dark:bg-dark-border'>
              <div className='h-8 rounded-lg bg-default-200 dark:bg-dark-border' />
            </Skeleton>

            {/* Buscador - igual que el Input real */}
            <div className='mt-10 max-w-3xl mx-auto'>
              <Skeleton className='h-14 w-full rounded-lg dark:bg-dark-border'>
                <div className='h-14 w-full rounded-lg bg-slate-100 dark:bg-[#0B0B0F]' />
              </Skeleton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSectionSkeleton;
