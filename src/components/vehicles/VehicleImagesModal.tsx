'use client';

import { Modal, ModalContent, ModalBody, Button, Image as NUIImage } from '@heroui/react';
import { Icon } from '@iconify/react';
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VehicleImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string;
  images: string[];
  onImageChange: (image: string) => void;
}

export default function VehicleImagesModal({
  isOpen,
  onClose,
  currentImage,
  images,
  onImageChange,
}: VehicleImagesModalProps) {
  if (!images?.length) images = currentImage ? [currentImage] : [];

  // ===== índice / hover
  const clamp = (i: number) => (i + images.length) % images.length;
  const [idx, setIdx] = useState(() => Math.max(0, images.indexOf(currentImage)));
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const displayIdx = hoverIdx ?? idx;
  const displaySrc = images[displayIdx] ?? '';

  useEffect(() => {
    const i = images.indexOf(currentImage);
    if (i >= 0 && i !== idx) {
      setIdx(i);
      setHoverIdx(null);
      setIsZoomActive(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImage, images]);

  // ===== responsive flag (mobile = sin dock)
  const [isSmall, setIsSmall] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 1024px)').matches;
  });
  useEffect(() => {
    const onResize = () => {
      setIsSmall(
        window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 1024px)').matches
      );
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ===== zoom en marco redondeado
  const [isZoomActive, setIsZoomActive] = useState(false);
  useEffect(() => { if (!isOpen) setIsZoomActive(false); }, [isOpen]);
  useEffect(() => { setIsZoomActive(false); }, [displaySrc]);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const zoomFactor = isSmall ? 3 : 2.8;
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const updateOriginFromPoint = (clientX: number, clientY: number) => {
    const el = overlayRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * 100;
    const y = ((clientY - r.top) / r.height) * 100;
    setOrigin({ x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) });
  };

  const openZoom = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e && 'clientX' in e) updateOriginFromPoint(e.clientX, e.clientY);
    setIsZoomActive(true);
  };
  const closeZoom = () => setIsZoomActive(false);
  const onOverlayMouseMove = (e: React.MouseEvent) => { if (isZoomActive) updateOriginFromPoint(e.clientX, e.clientY); };
  const onOverlayTouchMove = (e: React.TouchEvent) => { if (isZoomActive && e.touches[0]) updateOriginFromPoint(e.touches[0].clientX, e.touches[0].clientY); };

  // ===== teclado + swipe (sin zoom)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const swipeStartXRef = useRef<number | null>(null);
  const viewerTouchStart = (e: React.TouchEvent) => { if (!isZoomActive) swipeStartXRef.current = e.touches[0].clientX; };
  const viewerTouchEnd = (e: React.TouchEvent) => {
    if (isZoomActive || swipeStartXRef.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartXRef.current;
    if (Math.abs(dx) > 40) (dx > 0 ? goPrev() : goNext());
    swipeStartXRef.current = null;
  };

  // ===== carrusel / dock
  const rowRef = useRef<HTMLDivElement | null>(null);
  const BASE_W = 112, BASE_H = 72, BASE_GAP = 10, INTENSITY = 0.75, SIGMA = 140;
  const [scales, setScales] = useState<number[]>(() => images.map(() => 1));
  const targetsRef = useRef<number[]>(images.map(() => 1));
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSmall) {
      const ones = images.map(() => 1);
      setScales(ones);
      targetsRef.current = ones;
    }
  }, [isSmall, images.length]);

  const centerActiveThumbMobile = useCallback((index: number) => {
    if (!isSmall) return;
    const scroller = rowRef.current; if (!scroller) return;
    const btn = scroller.querySelector<HTMLButtonElement>(`button[data-thumb-idx="${index}"]`);
    if (!btn) return;
    const scrollerWidth = scroller.clientWidth;
    const btnWidth = btn.clientWidth;
    const btnLeft = btn.offsetLeft;
    const target = Math.max(0, btnLeft - (scrollerWidth - btnWidth) / 2);
    scroller.scrollTo({ left: target, behavior: 'smooth' });
  }, [isSmall]);

  useEffect(() => { if (isOpen) centerActiveThumbMobile(idx); }, [isOpen, idx, centerActiveThumbMobile]);

  const tick = () => {
    rafRef.current = null;
    const next = scales.map((v, i) => v + (targetsRef.current[i] - v) * 0.18);
    let changed = false;
    for (let i = 0; i < next.length; i++) if (Math.abs(next[i] - scales[i]) > 0.001) { changed = true; break; }
    if (changed) { setScales(next); rafRef.current = requestAnimationFrame(tick); }
    else { setScales(targetsRef.current.slice()); }
  };
  const req = () => { if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick); };
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const onDockMove = (e: React.MouseEvent) => {
    if (isSmall) return;
    const el = rowRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const btns = Array.from(el.querySelectorAll<HTMLButtonElement>('button[data-thumb="1"]'));
    if (!btns.length) return;
    const centers = btns.map(b => { const r = b.getBoundingClientRect(); return (r.left - rect.left) + r.width / 2; });
    targetsRef.current = centers.map(c => {
      const d = Math.abs(c - x);
      const g = Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
      return Math.min(1 + INTENSITY, 1 + INTENSITY * g);
    });
    if (!isZoomActive) {
      let best = 0, bestD = Infinity;
      centers.forEach((c, i) => { const dd = Math.abs(c - x); if (dd < bestD) { bestD = dd; best = i; } });
      setHoverIdx(best);
    }
    req();
  };

  const onDockLeave = () => {
    if (!isSmall && hoverIdx != null) changeIdx(hoverIdx, true); // fija última en hover
    setHoverIdx(null);
    targetsRef.current = images.map(() => 1);
    req();
  };

  // ===== change idx (y seguir carrusel en mobile)
  const changeIdx = useCallback((i: number, notify = true) => {
    const ni = clamp(i);
    setIdx(ni);
    setHoverIdx(null);
    setIsZoomActive(false);
    if (notify) onImageChange(images[ni]);
    centerActiveThumbMobile(ni);
  }, [images, onImageChange, centerActiveThumbMobile]);

  const goPrev = useCallback(() => changeIdx(idx - 1), [idx, changeIdx]);
  const goNext = useCallback(() => changeIdx(idx + 1), [idx, changeIdx]);

  // ===== estilos controles
  const ctrlBtnDesktop =
    "isolate w-10 h-10 md:w-11 md:h-11 p-0 rounded-full text-white bg-transparent md:hover:bg-black/50 md:backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60";
  const ctrlBtnSmall =
    "isolate w-12 h-12 p-0 rounded-full text-white bg-black/70 hover:bg-black/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      size="full"
      backdrop="blur"
      isDismissable
      hideCloseButton
      classNames={{
        closeButton: 'hidden',
        backdrop: 'backdrop-blur-md bg-black/70',
        base: 'bg-transparent shadow-none',
        body: 'p-0',
      }}
      onClose={onClose}
    >
      <ModalContent>
        {/* min-h-0: el viewer no empuja los filtros */}
        <ModalBody className="h-screen flex flex-col min-h-0">
          {/* ===== VIEWER: imagen natural, limitada al alto disponible ===== */}
          <div
            className="relative flex-1 min-h-0 overflow-hidden flex items-center justify-center"
            onTouchStart={viewerTouchStart}
            onTouchEnd={viewerTouchEnd}
          >
            {/* ====== BOTONES FUERA DE LA IMAGEN (sobre el viewer) ====== */}
            {!isZoomActive && (
              <>
                {/* Cerrar arriba-derecha del viewer */}
                <Button
                  isIconOnly
                  aria-label="Cerrar"
                  className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-50 ${isSmall ? ctrlBtnSmall : ctrlBtnDesktop}`}
                  variant="flat"
                  onPress={onClose}
                >
                  <Icon icon="mdi:close" className="text-2xl md:text-2xl" />
                </Button>

                {/* Flechas laterales (solo desktop) */}
                {!isSmall && images.length > 1 && (
                  <>
                    <Button
                      isIconOnly
                      aria-label="Anterior"
                      className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-40 ${ctrlBtnDesktop}`}
                      variant="flat"
                      onPress={goPrev}
                    >
                      <Icon icon="mdi:chevron-left" className="text-xl md:text-2xl" />
                    </Button>
                    <Button
                      isIconOnly
                      aria-label="Siguiente"
                      className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 ${ctrlBtnDesktop}`}
                      variant="flat"
                      onPress={goNext}
                    >
                      <Icon icon="mdi:chevron-right" className="text-xl md:text-2xl" />
                    </Button>
                  </>
                )}
              </>
            )}

            {/* padding lateral en mobile */}
            <div className="w-full h-full flex items-center justify-center px-5 sm:px-8">
              {/* Marco redondeado que solo limita por el espacio (no empuja nada) */}
              <div className="relative max-w-[min(92vw,1100px)] max-h-full rounded-2xl overflow-hidden">
                {/* IMAGEN NORMAL: tamaño natural, centrada, y limitada por el espacio */}
                {!isZoomActive && (
                  <div onClick={openZoom} className="flex items-center justify-center">
                    <img
                      src={displaySrc}
                      alt="Vehicle"
                      className="block max-w-full max-h-[80vh] sm:max-h-[85vh] w-auto h-auto object-contain cursor-zoom-in rounded-2xl"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controles inferiores SOLO MOBILE (debajo del viewer, sobre filtros) */}
          {isSmall && images.length > 1 && !isZoomActive && (
            <div className="w-full flex-none flex items-center justify-center gap-5 py-2">
              <Button isIconOnly aria-label="Anterior" className={ctrlBtnSmall} variant="flat" onPress={goPrev}>
                <Icon icon="mdi:chevron-left" className="text-2xl" />
              </Button>
              <Button isIconOnly aria-label="Siguiente" className={ctrlBtnSmall} variant="flat" onPress={goNext}>
                <Icon icon="mdi:chevron-right" className="text-2xl" />
              </Button>
            </div>
          )}

          {/* ===== ZOOM EN MARCO LIMITADO Y REDONDEADO ===== */}
          {isZoomActive && (
            <div
              ref={overlayRef}
              className="fixed inset-0 z-50 bg-black/90 overflow-hidden"
              onMouseMove={onOverlayMouseMove}
              onTouchMove={onOverlayTouchMove}
              onClick={closeZoom}
            >
              <div className="w-screen h-screen flex items-center justify-center p-3">
                {/* Marco de zoom */}
                <div className="relative w-[min(95vw,1100px)] h-[min(85vh,780px)] rounded-2xl overflow-hidden bg-black">
                  <button
                    aria-label="Salir del zoom"
                    className={`absolute top-3 right-3 z-50 ${isSmall ? ctrlBtnSmall : ctrlBtnDesktop}`}
                    onClick={(e) => { e.stopPropagation(); closeZoom(); }}
                  >
                    <Icon icon="mdi:close" className="text-2xl md:text-2xl" />
                  </button>

                  <img
                    src={displaySrc}
                    alt="Zoomed vehicle"
                    draggable={false}
                    onClick={(e) => { e.stopPropagation(); closeZoom(); }}
                    style={{
                      transformOrigin: `${origin.x}% ${origin.y}%`,
                      transform: `scale(${zoomFactor})`,
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                    className="select-none cursor-zoom-out object-contain w-auto h-auto mx-auto my-auto"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===== Barra de filtros / dock ===== */}
          {images.length > 1 && (
            <ThumbnailsBar
              isSmall={isSmall}
              rowRef={rowRef}
              images={images}
              idx={idx}
              setHoverIdx={setHoverIdx}
              isZoomActive={isZoomActive}
              scales={scales}
              setScales={setScales}
              targetsRef={targetsRef}
              onDockMove={onDockMove}
              onDockLeave={onDockLeave}
              changeIdx={(i: number) => changeIdx(i, true)}
              BASE_W={BASE_W}
              BASE_H={BASE_H}
              BASE_GAP={BASE_GAP}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

/** ===== Barra de miniaturas ===== */
function ThumbnailsBar({
  isSmall,
  rowRef,
  images,
  idx,
  setHoverIdx,
  isZoomActive,
  scales,
  setScales,
  targetsRef,
  onDockMove,
  onDockLeave,
  changeIdx,
  BASE_W,
  BASE_H,
  BASE_GAP,
}: {
  isSmall: boolean;
  rowRef: React.MutableRefObject<HTMLDivElement | null>;
  images: string[];
  idx: number;
  setHoverIdx: (n: number | null) => void;
  isZoomActive: boolean;
  scales: number[];
  setScales: (v: number[]) => void;
  targetsRef: React.MutableRefObject<number[]>;
  onDockMove: (e: React.MouseEvent) => void;
  onDockLeave: () => void;
  changeIdx: (i: number) => void;
  BASE_W: number;
  BASE_H: number;
  BASE_GAP: number;
}) {
  return (
    <div className="w-full flex-none bg-black/10 backdrop-blur-md py-3 sm:py-4 select-none">
      <div
        ref={rowRef}
        className={`
          flex items-end mx-auto max-w-screen-lg
          pr-4 sm:px-4
          overflow-x-auto ${isSmall ? '' : 'md:overflow-x-visible'}
          ${isSmall ? 'justify-start' : 'md:justify-center'}
          snap-x snap-mandatory
        `}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          paddingLeft: 16,
          scrollPaddingLeft: 16,
        }}
        onMouseMove={isSmall ? undefined : onDockMove}
        onMouseLeave={isSmall ? undefined : onDockLeave}
      >
        {isSmall && <div className="shrink-0" style={{ width: 16 }} />}

        {images.map((img, i) => {
          const s = isSmall ? 1 : (scales[i] ?? 1);
          const lift = (s - 1) * 20;
          const extraW = ((s - 1) * BASE_W) / 2;
          const marginX = BASE_GAP / 2 + Math.max(0, extraW);
          const active = i === idx;

          return (
            <button
              key={img + i}
              data-thumb="1"
              data-thumb-idx={i}
              aria-label={`Miniatura ${i + 1}`}
              onClick={() => changeIdx(i)}
              className={`
                relative rounded-xl overflow-hidden flex-shrink-0 snap-start
                ${active ? 'ring-2 ring-white' : 'ring-1 ring-white/25 hover:ring-white/60'}
              `}
              style={{
                width: BASE_W,
                height: BASE_H,
                transform: `translateY(${-lift}px) scale(${s})`,
                transformOrigin: 'center bottom',
                transition: 'transform 120ms cubic-bezier(.22,1,.36,1), box-shadow 120ms, filter 120ms',
                willChange: 'transform',
                zIndex: Math.round(s * 100),
                filter: active ? 'none' : 'brightness(0.96)',
                boxShadow: active ? '0 8px 26px rgba(0,0,0,.35)' : '0 3px 12px rgba(0,0,0,.28)',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 14,
                marginLeft: marginX,
                marginRight: marginX,
              }}
              onMouseEnter={() => { if (!isSmall && !isZoomActive) setHoverIdx(i); }}
              onMouseLeave={() => { if (!isSmall && !isZoomActive) setHoverIdx(null); }}
            >
              <NUIImage alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" src={img} />
              <span
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 40%, transparent)',
                  mixBlendMode: 'screen',
                }}
              />
            </button>
          );
        })}

        {isSmall && <div className="shrink-0" style={{ width: 12 }} />}
      </div>
    </div>
  );
}
