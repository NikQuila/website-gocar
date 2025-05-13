import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalContent } from '@heroui/react';
import { Button } from '@heroui/react';

// Custom hook for media query with optimized dependencies
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false); // Always start with false for SSR

  useEffect(() => {
    // Run the media query check only on the client side
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

interface ModalSlideFilterProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

// Memoize motion variants to prevent recreating on each render
const motionVariants = {
  enter: {
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    x: -500,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Memoize modal class names
const modalClassNames = {
  base: 'justify-start m-0 p-0 h-dvh max-h-full w-[280px] z-[9999]',
  wrapper: 'items-start justify-start !w-[280px]',
  body: 'p-0',
  closeButton:
    'z-50 top-4 right-4 left-auto m-0 text-xl dark:bg-dark-card/80 w-8 h-8 shadow-sm flex items-center justify-center dark:border-dark-border',
} as const;

const ModalSlideFilter = React.memo(
  ({ children, isOpen, onClose }: ModalSlideFilterProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const isMd = useMediaQuery('(min-width: 768px)');

    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Don't render anything until mounted to prevent hydration mismatch
    if (!isMounted) {
      return null;
    }

    // Memoize the desktop version class names
    const desktopClassName = `h-screen bg-white dark:bg-dark-card shadow-md transition-all duration-300 ${
      isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'
    } overflow-hidden`;

    if (isMd) {
      return <div className={desktopClassName}>{children}</div>;
    }

    return (
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        classNames={{
          ...modalClassNames,
          body: 'p-0 flex flex-col h-full',
        }}
        motionProps={{
          variants: motionVariants,
        }}
        radius='none'
        scrollBehavior='inside'
        placement='left'
      >
        <ModalContent>
          <ModalBody>
            <div className='flex flex-col h-full'>
              <div className='flex-1 overflow-y-auto'>{children}</div>
              <div className='sticky bottom-0 w-full p-4 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border'>
                <Button
                  color='primary'
                  className='w-full'
                  size='lg'
                  onClick={onClose}
                >
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);

// Add display name for debugging
ModalSlideFilter.displayName = 'ModalSlideFilter';

export default ModalSlideFilter;
