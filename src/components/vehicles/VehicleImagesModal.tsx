// src/components/vehicles/VehicleImagesModal.tsx
'use client';

import { Modal, ModalContent, ModalBody, Button } from '@heroui/react';
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

  // ===== responsive flag
  const [isSmall, setIsSmall] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(max-width: 768px)').matches
    );
  });
  useEffect(() => {
    const onResize = () => {
      setIsSmall(
        window.matchMedia('(pointer: coarse)').matches ||
          window.matchMedia('(max-width: 768px)').matches
      );
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ===== zoom
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

  // ===== teclado + swipe
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

  // ===== dock
  const rowRef = useRef<HTMLDivElement | null>(null);
  const BASE_W = 112, BASE_H = 72, BASE_GAP = 10;
  const INTENSITY = 0.42;
  const SIGMA = 140;
  const MAX_LIFT = 18;              // altura que se “eleva” el dock
  const HEADROOM = MAX_LIFT + 14;   // “cielo” para que no se corte

  // springs magnify
  const [scales, setScales] = useState<number[]>(() => images.map(() => 1));
  const targetsRef = useRef<number[]>(images.map(() => 1));
  const velsRef = useRef<number[]>(images.map(() => 0));
  const rafRef = useRef<number | null>(null);
  const hoveringRef = useRef<boolean>(false);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(tick);
  }, []);
  const stopLoopIfSettled = useCallback(() => {
    const s = scales, t = targetsRef.current, v = velsRef.current;
    for (let i = 0; i < s.length; i++) {
      if (Math.abs(s[i] - t[i]) > 0.001 || Math.abs(v[i]) > 0.001) {
        startLoop();
        return;
      }
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [scales, startLoop]);

  useEffect(() => {
    setScales(images.map(() => 1));
    targetsRef.current = images.map(() => 1);
    velsRef.current = images.map(() => 0);
  }, [images.length]);

  const tick = () => {
    rafRef.current = null;
    const k = 0.18;
    const damping = 0.72;
    const next: number[] = [];
    const vnext: number[] = [];

    for (let i = 0; i < scales.length; i++) {
      const x = scales[i];
      const xt = targetsRef.current[i];
      const v = velsRef.current[i];
      const a = (xt - x) * k;
      const newV = (v + a) * damping;
      const newX = x + newV;
      next[i] = newX;
      vnext[i] = newV;
    }

    velsRef.current = vnext;
    setScales(next);

    if (hoveringRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      stopLoopIfSettled();
    }
  };

  // visibilidad activa
  const ensureActiveThumbVisible = useCallback((index: number, center = false) => {
    const scroller = rowRef.current; if (!scroller) return;
    const btn = scroller.querySelector<HTMLButtonElement>(`button[data-thumb-idx="${index}"]`);
    if (!btn) return;

    const padding = 16;
    const viewLeft = scroller.scrollLeft;
    const viewRight = viewLeft + scroller.clientWidth;
    const btnLeft = btn.offsetLeft;
    const btnRight = btnLeft + btn.clientWidth;

    let target = viewLeft;

    if (center || isSmall) {
      const mid = btnLeft - (scroller.clientWidth - btn.clientWidth) / 2;
      target = Math.max(0, mid - padding);
    } else {
      if (btnLeft < viewLeft + padding) target = Math.max(0, btnLeft - padding);
      else if (btnRight > viewRight - padding) target = Math.max(0, btnRight - scroller.clientWidth + padding);
      else return;
    }
    scroller.scrollTo({ left: target, behavior: 'smooth' });
  }, [isSmall]);

  useEffect(() => {
    if (!isOpen) return;
    ensureActiveThumbVisible(idx, isSmall);
  }, [isOpen, idx, isSmall, ensureActiveThumbVisible]);

  // hover magnify + selección
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
    hoveringRef.current = true;
    startLoop();

    if (!isZoomActive) {
      let best = 0, bestD = Infinity;
      centers.forEach((c, i) => { const dd = Math.abs(c - x); if (dd < bestD) { bestD = dd; best = i; } });
      setHoverIdx(best);
    }
  };

  const onDockEnter = () => {
    if (isSmall) return;
    hoveringRef.current = true;
    startLoop();
  };

  const onDockLeave = () => {
    if (isSmall) return;
    hoveringRef.current = false;
    targetsRef.current = images.map(() => 1);
    startLoop(); // vuelve suave a 1
    setHoverIdx(null);
  };

  // selección por HOVER (fija arriba sin click)
  const hoverSelect = useCallback((i: number) => {
    const ni = clamp(i);
    setIdx(ni);
    setIsZoomActive(false);
    onImageChange(images[ni]);
    ensureActiveThumbVisible(ni, isSmall);
  }, [images, onImageChange, ensureActiveThumbVisible, isSmall]);

  // navegación
  const changeIdx = useCallback((i: number, notify = true, centerDock?: boolean) => {
    const ni = clamp(i);
    setIdx(ni);
    setHoverIdx(null);
    setIsZoomActive(false);
    if (notify) onImageChange(images[ni]);
    const shouldCenter = centerDock ?? isSmall;
    ensureActiveThumbVisible(ni, shouldCenter);
  }, [images, onImageChange, ensureActiveThumbVisible, isSmall]);

  const goPrev = useCallback(() => changeIdx(idx - 1, true, !isSmall ? true : undefined), [idx, changeIdx, isSmall]);
  const goNext = useCallback(() => changeIdx(idx + 1, true, !isSmall ? true : undefined), [idx, changeIdx, isSmall]);

  // ===== controles
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
        <ModalBody className="h-screen flex flex-col min-h-0">
          {/* ===== VIEWER ===== */}
          <div
            className="relative flex-1 min-h-0 overflow-hidden flex items-center justify-center"
            onTouchStart={viewerTouchStart}
            onTouchEnd={viewerTouchEnd}
          >
            {!isZoomActive && (
              <>
                <Button
                  isIconOnly
                  aria-label="Cerrar"
                  className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-50 ${isSmall ? ctrlBtnSmall : ctrlBtnDesktop}`}
                  variant="flat"
                  onPress={onClose}
                >
                  <Icon icon="mdi:close" className="text-2xl md:text-2xl" />
                </Button>

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

            <div className="w-full h-full flex items-center justify-center px-5 sm:px-8">
              <div className="relative max-w-[min(92vw,1100px)] max-h-full rounded-2xl overflow-hidden">
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

          {/* ===== ZOOM ===== */}
          {isZoomActive && (
            <div
              ref={overlayRef}
              className="fixed inset-0 z-50 bg-black/90 overflow-hidden"
              onMouseMove={onOverlayMouseMove}
              onTouchMove={onOverlayTouchMove}
              onClick={closeZoom}
            >
              <div className="w-screen h-screen flex items-center justify-center p-3">
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

          {/* ===== DOCK: capa visual + scroller con headroom (no recorta) ===== */}
          {images.length > 1 && (
            <ThumbnailsBar
              isSmall={isSmall}
              rowRef={rowRef}
              images={images}
              idx={idx}
              setHoverIdx={setHoverIdx}
              isZoomActive={isZoomActive}
              scales={scales}
              targetsRef={targetsRef}
              onDockMove={onDockMove}
              onDockEnter={onDockEnter}
              onDockLeave={onDockLeave}
              changeIdx={(i: number) => changeIdx(i, true)}
              hoverSelect={hoverSelect}
              ensureActiveThumbVisible={ensureActiveThumbVisible}
              BASE_W={BASE_W}
              BASE_H={BASE_H}
              BASE_GAP={BASE_GAP}
              MAX_LIFT={MAX_LIFT}
              HEADROOM={HEADROOM}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

/** ===== Barra de miniaturas (magnify + drag + hover-to-select, sin recortes) ===== */
function ThumbnailsBar({
  isSmall,
  rowRef,
  images,
  idx,
  setHoverIdx,
  isZoomActive,
  scales,
  targetsRef,
  onDockMove,
  onDockEnter,
  onDockLeave,
  changeIdx,
  hoverSelect,
  ensureActiveThumbVisible,
  BASE_W,
  BASE_H,
  BASE_GAP,
  MAX_LIFT,
  HEADROOM,
}: {
  isSmall: boolean;
  rowRef: React.MutableRefObject<HTMLDivElement | null>;
  images: string[];
  idx: number;
  setHoverIdx: (n: number | null) => void;
  isZoomActive: boolean;
  scales: number[];
  targetsRef: React.MutableRefObject<number[]>;
  onDockMove: (e: React.MouseEvent) => void;
  onDockEnter: () => void;
  onDockLeave: () => void;
  changeIdx: (i: number) => void;
  hoverSelect: (i: number) => void;
  ensureActiveThumbVisible: (index: number, center?: boolean) => void;
  BASE_W: number;
  BASE_H: number;
  BASE_GAP: number;
  MAX_LIFT: number;
  HEADROOM: number;
}) {
  useEffect(() => {
    if (!isSmall && rowRef.current) {
      rowRef.current.scrollLeft = 0;
    }
  }, [isSmall, images.length]);

  // === NEW: centrar dock si el contenido no requiere scroll horizontal
  const [isCentered, setIsCentered] = useState(false);
  useEffect(() => {
    const scroller = rowRef.current;
    if (!scroller) return;

    const compute = () => {
      const count = images.length;
      // Ancho base sin magnificación: cada item ocupa BASE_W + BASE_GAP (márgenes left/right suman BASE_GAP en total)
      const totalBase = count * (BASE_W + BASE_GAP);
      const available = scroller.clientWidth;
      setIsCentered(totalBase <= available);
    };

    compute();
    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // Recalcular si cambian cantidad de imágenes o tamaños base
  }, [images.length, BASE_W, BASE_GAP, rowRef, isSmall]);

  // drag + rueda vertical→horizontal
  const dragState = useRef<{ dragging: boolean; startX: number; startScroll: number }>({
    dragging: false, startX: 0, startScroll: 0,
  });
  const onMouseDown = (e: React.MouseEvent) => {
    const scroller = rowRef.current; if (!scroller) return;
    dragState.current.dragging = true;
    dragState.current.startX = e.clientX;
    dragState.current.startScroll = scroller.scrollLeft;
    scroller.style.cursor = 'grabbing';
  };
  const onMouseMove = (e: React.MouseEvent) => {
    const scroller = rowRef.current; if (!scroller || !dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    scroller.scrollLeft = dragState.current.startScroll - dx;
  };
  const endDrag = () => {
    const scroller = rowRef.current; if (!scroller) return;
    dragState.current.dragging = false;
    scroller.style.cursor = 'grab';
  };
  const onWheel = (e: React.WheelEvent) => {
    const scroller = rowRef.current; if (!scroller) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      scroller.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="relative w-full flex-none select-none">
      {/* Capa visual decorativa (no afecta scroll, ni recortes) */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-0"
        style={{
          height: BASE_H + HEADROOM,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.12))',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      />

      {/* Scroller real con “headroom” arriba para que el lift/scale nunca se corte */}
      <div className="relative z-10 px-4">
        <div
          ref={rowRef}
          className={`relative flex items-end ${isCentered ? 'justify-center' : 'justify-start'} snap-x snap-mandatory`}
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            height: BASE_H + HEADROOM,
            paddingTop: HEADROOM,
            paddingLeft: isCentered ? 0 : 16,
            scrollPaddingLeft: isCentered ? 0 : 16,
            paddingBottom: 14,
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x',
            cursor: 'grab',
            userSelect: 'none',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onMouseEnter={isSmall ? undefined : onDockEnter}
          onMouseMove={isSmall ? undefined : onDockMove}
          onMouseLeave={() => { endDrag(); isSmall ? undefined : onDockLeave(); }}
          onMouseDown={onMouseDown}
          onMouseUp={endDrag}
          onMouseOut={(e) => { if ((e.relatedTarget as HTMLElement | null)?.closest('[data-thumb="1"]')) return; endDrag(); }}
          onWheel={onWheel}
        >
          {isSmall && !isCentered && <div className="shrink-0" style={{ width: 16 }} />}

          {images.map((img, i) => {
            const s = isSmall ? 1 : (scales[i] ?? 1);
            const lift = Math.min(MAX_LIFT, (s - 1) * MAX_LIFT);
            const extraW = ((s - 1) * BASE_W) / 2;
            const marginX = BASE_GAP / 2 + Math.max(0, extraW);
            const active = i === idx;

            return (
              <button
                key={img + i}
                data-thumb="1"
                data-thumb-idx={i}
                aria-label={`Miniatura ${i + 1}`}
                onClick={() => { changeIdx(i); ensureActiveThumbVisible(i, isSmall); }}
                className="relative rounded-xl overflow-hidden flex-shrink-0 snap-start"
                style={{
                  width: BASE_W,
                  height: BASE_H,
                  transform: `translateY(${-lift}px) scale(${s})`,
                  transformOrigin: 'center bottom',
                  willChange: 'transform',
                  zIndex: Math.round(s * 100),
                  filter: active ? 'none' : 'brightness(0.96)',
                  boxShadow: active
                    ? '0 8px 26px rgba(0,0,0,.36), 0 0 0 0.5px rgba(255,255,255,.35)'
                    : '0 3px 12px rgba(0,0,0,.28)',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 14,
                  marginLeft: marginX,
                  marginRight: marginX,
                }}
                onMouseEnter={() => {
                  if (!isSmall && !isZoomActive) {
                    setHoverIdx(i);
                    hoverSelect(i); // fija arriba sin click
                  }
                }}
                onMouseLeave={() => { if (!isSmall && !isZoomActive) setHoverIdx(null); }}
              >
                <img
                  alt={`Miniatura ${i + 1}`}
                  src={img}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: 'center center' }}
                  draggable={false}
                />
                <span
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 40%, transparent)',
                    mixBlendMode: 'screen',
                  }}
                />
              </button>
            );
          })}

          {isSmall && !isCentered && <div className="shrink-0" style={{ width: 12 }} />}
        </div>
      </div>
    </div>
  );
}
