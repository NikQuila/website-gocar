import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalContent } from '@heroui/react';

// Custom hook for media query with optimized dependencies
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => {
    // Initialize with the current match state if window is available
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    // Modern event listener approach
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Use modern addEventListener if available, fallback to addListener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [query]); // Remove matches from dependencies

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
  base: 'justify-start m-0 p-0 h-dvh max-h-full w-[300px] z-[50]',
  wrapper: 'items-start justify-start !w-[300px]',
  body: 'p-0',
  closeButton: 'z-50',
} as const;

const ModalSlideFilter = React.memo(
  ({ children, isOpen, onClose }: ModalSlideFilterProps) => {
    const isMd = useMediaQuery('(min-width: 768px)');

    // Memoize the desktop version class names
    const desktopClassName = `h-screen bg-white shadow-md transition-all duration-300 ${
      isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'
    } overflow-hidden`;

    if (isMd) {
      return <div className={desktopClassName}>{children}</div>;
    }

    return (
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        classNames={modalClassNames}
        motionProps={{
          variants: motionVariants,
        }}
        radius='none'
        scrollBehavior='inside'
      >
        <ModalContent>
          <ModalBody>{children}</ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);

// Add display name for debugging
ModalSlideFilter.displayName = 'ModalSlideFilter';

export default ModalSlideFilter;
