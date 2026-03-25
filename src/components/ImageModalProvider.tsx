"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PanInfo } from "framer-motion";

import type { PortfolioImage } from "@/content/portfolio";

type ModalState = {
  open: boolean;
  images: PortfolioImage[];
  index: number;
  direction: 1 | -1;
  prevIndex: number | null;
  transitionKey: number;
};

type ImageModalApi = {
  openModal: (images: PortfolioImage[], startIndex: number) => void;
  closeModal: () => void;
};

const ImageModalContext = createContext<ImageModalApi | null>(null);

export function useImageModal() {
  const ctx = useContext(ImageModalContext);
  if (!ctx) {
    throw new Error("useImageModal must be used within ImageModalProvider");
  }
  return ctx;
}

function clampIndex(i: number, len: number) {
  if (len <= 0) return 0;
  return (i + len) % len;
}

export function ImageModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Decode cache to avoid CPU stalls when navigating quickly.
  // Keyed by src URL; values resolve once the image is decoded (or fail softly).
  const decodeCacheRef = useRef<Map<string, Promise<void>>>(new Map());

  const preloadAndDecode = useCallback((src?: string) => {
    if (!src) return;

    const existing = decodeCacheRef.current.get(src);
    if (existing) return;

    const img = new window.Image();
    img.decoding = "async";
    img.src = src;

    const p = img
      .decode()
      .catch(() => {
        // Fail-soft: decoding can reject for various reasons, but we don't want
        // to block UI. The browser will still paint the image when available.
      })
      .finally(() => {
        // Keep cache entry to prevent re-decoding churn.
      });

    decodeCacheRef.current.set(src, p);
  }, []);

  const [state, setState] = useState<ModalState>({
    open: false,
    images: [],
    index: 0,
    direction: 1,
    prevIndex: null,
    transitionKey: 0,
  });

  const api = useMemo<ImageModalApi>(
    () => ({
      openModal: (images, startIndex) => {
        const len = images.length;
        const clampedIndex = clampIndex(startIndex, len);
        const prevIdx = clampIndex(clampedIndex - 1, len);
        const nextIdx = clampIndex(clampedIndex + 1, len);

        // Start decoding before switching so the swap is instantaneous.
        preloadAndDecode(images[clampedIndex]?.src);
        preloadAndDecode(images[prevIdx]?.src);
        preloadAndDecode(images[nextIdx]?.src);

        setState({
          open: true,
          images,
          index: clampedIndex,
          direction: 1,
          prevIndex: null,
          transitionKey: 0,
        });
      },
      closeModal: () => {
        setState((s) => ({ ...s, open: false }));
      },
    }),
    [preloadAndDecode]
  );

  const goPrev = useCallback(() => {
    setState((s) => ({
      ...s,
      direction: -1,
      prevIndex: s.index,
      index: (() => {
        const nextIndex = clampIndex(s.index - 1, s.images.length);
        preloadAndDecode(s.images[nextIndex]?.src);
        return nextIndex;
      })(),
      transitionKey: s.transitionKey + 1,
    }));
  }, [preloadAndDecode]);

  const goNext = useCallback(() => {
    setState((s) => ({
      ...s,
      direction: 1,
      prevIndex: s.index,
      index: (() => {
        const nextIndex = clampIndex(s.index + 1, s.images.length);
        preloadAndDecode(s.images[nextIndex]?.src);
        return nextIndex;
      })(),
      transitionKey: s.transitionKey + 1,
    }));
  }, [preloadAndDecode]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const offsetX = info.offset.x;
      const velocityX = info.velocity.x;
      if (offsetX < -70 || velocityX < -420) {
        goNext();
        return;
      }
      if (offsetX > 70 || velocityX > 420) {
        goPrev();
      }
    },
    [goNext, goPrev]
  );

  useEffect(() => {
    if (!state.open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        api.closeModal();
        return;
      }

      if (e.key === "ArrowLeft") {
        goPrev();
      }

      if (e.key === "ArrowRight") {
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    // Prevent background scroll while modal is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [api, state.open, goPrev, goNext]);

  const current = state.images[state.index];

  // Preload adjacent images to keep navigation extremely smooth.
  useEffect(() => {
    if (!state.open) return;
    const len = state.images.length;
    if (len <= 1) return;

    const nextIdx = clampIndex(state.index + 1, len);
    const prevIdx = clampIndex(state.index - 1, len);
    preloadAndDecode(state.images[nextIdx]?.src);
    preloadAndDecode(state.images[prevIdx]?.src);
    // `state.images` n'est pas dans les deps : pour éviter des triggers inutiles
    // pendant la navigation (la navigation change surtout `state.index`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.open, state.index, preloadAndDecode]);

  const prev =
    state.prevIndex != null ? state.images[state.prevIndex] : undefined;
  const modalHeight =
    "min(85dvh, calc(100dvh - 6rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)))";
  const wipeStartX = state.direction > 0 ? "-36%" : "36%";
  const wipeEndX = state.direction > 0 ? "36%" : "-36%";

  return (
    <ImageModalContext.Provider value={api}>
      {children}

      <AnimatePresence mode="sync">
        {state.open && current ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => api.closeModal()}
          >
            <button
              type="button"
              aria-label="Close modal"
              className="pointer-events-auto absolute right-4 top-4 z-20 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white/15 sm:right-6 sm:top-6"
              style={{
                top: "max(1rem, env(safe-area-inset-top))",
                right: "max(1rem, env(safe-area-inset-right))",
              }}
              onClick={(e) => {
                e.stopPropagation();
                api.closeModal();
              }}
            >
              Close
            </button>

            <button
              type="button"
              aria-label="Previous image"
              className="pointer-events-auto absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur transition-colors hover:bg-white/15 sm:left-6 sm:p-3.5"
              style={{
                left: "max(0.5rem, env(safe-area-inset-left))",
              }}
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
            >
              ←
            </button>

            <button
              type="button"
              aria-label="Next image"
              className="pointer-events-auto absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur transition-colors hover:bg-white/15 sm:right-6 sm:p-3.5"
              style={{
                right: "max(0.5rem, env(safe-area-inset-right))",
              }}
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            >
              →
            </button>

            <div
              className="pointer-events-none relative flex h-full w-full items-center justify-center overflow-hidden"
              style={{
                perspective: 1200,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Directional cast shadow for depth/inertia */}
              <motion.div
                key={`cast-shadow-${state.transitionKey}`}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[72vh] w-[72vw] -translate-x-1/2 -translate-y-1/2 rounded-[999px]"
                initial={{
                  x: 0,
                  y: 14,
                  opacity: 0.34,
                  scale: 0.99,
                }}
                animate={{
                  x: state.direction > 0 ? -34 : 34,
                  y: 20,
                  opacity: 0.52,
                  scale: 1,
                }}
                transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
                style={{
                  background:
                    "radial-gradient(circle, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.26) 38%, rgba(0,0,0,0.00) 72%)",
                  filter: "blur(42px)",
                }}
              />

              {/* Lightweight wipe/shutter feedback (subtle to avoid any "milky veil"). */}
              <motion.div
                key={`wipe-${state.transitionKey}`}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-0 z-[3] h-full w-[44%] overflow-hidden -translate-x-1/2"
                initial={{
                  opacity: 0,
                  x: wipeStartX,
                }}
                animate={{
                  opacity: [0, 0.07, 0],
                  x: [wipeStartX, "0%", wipeEndX],
                }}
                transition={{ duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(210,235,255,0.95) 50%, rgba(255,255,255,0) 100%)",
                }}
              />

              {prev && state.prevIndex !== state.index ? (
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"
                >
                  <motion.img
                    key={`prev-${state.transitionKey}-${prev.src}`}
                    src={prev.src}
                    alt={prev.alt}
                    draggable={false}
                    decoding="async"
                    loading="eager"
                    fetchPriority="high"
                    style={{
                      display: "block",
                      width: "auto",
                      height: modalHeight,
                      maxWidth: "94vw",
                      objectFit: "contain",
                      filter: "drop-shadow(0 22px 70px rgba(0,0,0,0.55))",
                    }}
                    initial={{
                      opacity: 1,
                      scale: 1,
                      rotateY: 0,
                      rotateX: 0,
                    }}
                    animate={{
                      opacity: 0,
                      scale: 0.985,
                      rotateY: 0,
                      rotateX: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: [0.2, 0.7, 0.2, 1],
                    }}
                  />
                </div>
              ) : null}

              <div
                className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"
              >
                <motion.img
                  key={`curr-${state.transitionKey}-${current.src}`}
                  src={current.src}
                  alt={current.alt}
                  draggable={false}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.08}
                  onDragEnd={handleDragEnd}
                  className="pointer-events-auto"
                  decoding="async"
                  loading="eager"
                  fetchPriority="high"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "block",
                    width: "auto",
                    height: modalHeight,
                    maxWidth: "94vw",
                    objectFit: "contain",
                    filter:
                      "drop-shadow(0 20px 64px rgba(0,0,0,0.52)) drop-shadow(0 0 14px rgba(120,150,255,0.12))",
                  }}
                  initial={{
                    opacity: 0,
                    scale: 1.015,
                    rotateY: 0,
                    rotateX: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotateY: 0,
                    rotateX: 0,
                  }}
                  transition={{
                    duration: 0.22,
                    ease: [0.2, 0.7, 0.2, 1],
                  }}
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </ImageModalContext.Provider>
  );
}

