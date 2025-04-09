import { Skeleton } from '@heroui/react';

const WelcomeSectionSkeleton = () => {
  return (
    <div className='bg-white dark:bg-dark-bg transition-colors'>
      <div className='relative isolate overflow-hidden'>
        <div className='mx-auto max-w-7xl px-6 py-24 sm:pt-32 lg:px-8'>
          {/* Hero content skeleton - Centered */}
          <div className='text-center'>
            <Skeleton className='h-16 sm:h-20 max-w-3xl mx-auto rounded-lg dark:bg-dark-border'>
              <div className='h-16 sm:h-20 max-w-3xl mx-auto rounded-lg bg-default-300 dark:bg-dark-border'></div>
            </Skeleton>

            <Skeleton className='mt-6 h-8 max-w-2xl mx-auto rounded-lg dark:bg-dark-border'>
              <div className='h-8 max-w-2xl mx-auto rounded-lg bg-default-200 dark:bg-dark-border'></div>
            </Skeleton>

            <div className='mt-8 w-full'>
              <Skeleton className='h-14 max-w-4xl mx-auto rounded-lg dark:bg-dark-border'>
                <div className='h-14 max-w-4xl mx-auto rounded-lg bg-default-300 dark:bg-dark-border'></div>
              </Skeleton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSectionSkeleton;
