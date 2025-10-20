import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalContent, Button } from '@heroui/react';

/* ---------------------------- Media Query Hook --------------------------- */
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
};

interface ModalSlideFilterProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

/* ------------------------------ Motion config --------------------------- */
const motionVariants = {
  enter: { x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit: { x: -520, transition: { duration: 0.34, ease: 'easeOut' } },
};

/* ---------------------------- ClassNames (memo) -------------------------- */
const modalClassNames = {
  base: 'justify-start m-0 p-0 h-dvh max-h-full w-[86vw] max-w-[320px] z-[9999]',
  wrapper: 'items-start justify-start !w-[86vw] max-w-[320px]',
  body: 'p-0',
  closeButton:
    'z-50 top-3 right-3 left-auto m-0 text-xl dark:bg-dark-card/80 w-8 h-8 shadow-sm flex items-center justify-center dark:border-dark-border',
} as const;

const ModalSlideFilter = React.memo(
  ({ children, isOpen, onClose }: ModalSlideFilterProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const isMd = useMediaQuery('(min-width: 768px)');
    useEffect(() => setIsMounted(true), []);
    if (!isMounted) return null;

    // Desktop = panel deslizante fijo (no modal)
    const desktopClassName = `h-screen bg-white dark:bg-dark-card shadow-md transition-all duration-300 ${
      isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'
    } overflow-hidden`;

    if (isMd) {
      return (
        <div className={desktopClassName}>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">{children}</div>
            <div className="sticky bottom-0 w-full p-3 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
              <div className="flex gap-2">
                <Button size="md" className="flex-1 rounded-lg" variant="flat" onClick={onClose}>
                  Cerrar
                </Button>
                <Button size="md" color="primary" className="flex-1 rounded-lg" onClick={onClose}>
                  Aplicar filtros
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Mobile = modal con slide-from-left
    return (
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        classNames={{
          ...modalClassNames,
          body: 'p-0 flex flex-col h-full',
        }}
        motionProps={{ variants: motionVariants }}
        radius="none"
        scrollBehavior="inside"
        placement="left"
      >
        <ModalContent>
          <ModalBody>
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto">{children}</div>
              <div className="sticky bottom-0 w-full p-4 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
                <Button color="primary" className="w-full" size="lg" onClick={onClose}>
                  Aplicar filtros
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);

ModalSlideFilter.displayName = 'ModalSlideFilter';
export default ModalSlideFilter;
