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
  const preloadedSrcRef = useRef<Set<string>>(new Set());
  const [slidePx] = useState(() => {
    if (typeof window === "undefined") return 1200;
    return Math.round(window.innerWidth * 0.95);
  });

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

        // Preload a small neighborhood around the initial index.
        // No decode() here: this must never block JS.
        const radius = 3;
        for (let offset = -radius; offset <= radius; offset++) {
          const idx = clampIndex(clampedIndex + offset, len);
          const src = images[idx]?.src;
          if (!src) continue;
          if (preloadedSrcRef.current.has(src)) continue;
          preloadedSrcRef.current.add(src);

          const img = new window.Image();
          img.src = src;
        }

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
    []
  );

  const goPrev = useCallback(() => {
    setState((s) => ({
      ...s,
      direction: -1,
      prevIndex: s.index,
      index: (() => {
        const nextIndex = clampIndex(s.index - 1, s.images.length);

        // Preload around the next index to make rapid clicks feel instant.
        const radius = 3;
        const len = s.images.length;
        for (let offset = -radius; offset <= radius; offset++) {
          const idx = clampIndex(nextIndex + offset, len);
          const src = s.images[idx]?.src;
          if (!src) continue;
          if (preloadedSrcRef.current.has(src)) continue;
          preloadedSrcRef.current.add(src);

          const img = new window.Image();
          img.src = src;
        }

        return nextIndex;
      })(),
      transitionKey: s.transitionKey + 1,
    }));
  }, []);

  const goNext = useCallback(() => {
    setState((s) => ({
      ...s,
      direction: 1,
      prevIndex: s.index,
      index: (() => {
        const nextIndex = clampIndex(s.index + 1, s.images.length);

        // Preload around the next index to make rapid clicks feel instant.
        const radius = 3;
        const len = s.images.length;
        for (let offset = -radius; offset <= radius; offset++) {
          const idx = clampIndex(nextIndex + offset, len);
          const src = s.images[idx]?.src;
          if (!src) continue;
          if (preloadedSrcRef.current.has(src)) continue;
          preloadedSrcRef.current.add(src);

          const img = new window.Image();
          img.src = src;
        }

        return nextIndex;
      })(),
      transitionKey: s.transitionKey + 1,
    }));
  }, []);

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

  const prev =
    state.prevIndex != null ? state.images[state.prevIndex] : undefined;
  const modalHeight =
    "min(85dvh, calc(100dvh - 6rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)))";

  // Defensive fallbacks for React keys / accessibility.
  // (Key warnings in dev were showing `key: ''`, so we never want empty strings.)
  const currSrc = current?.src || "img";
  const currAlt = current?.alt || "image";
  const prevSrc = prev?.src || "img";
  const prevAlt = prev?.alt || "image";

  return (
    <ImageModalContext.Provider value={api}>
      {children}

      <AnimatePresence mode="sync">
        {state.open && current ? (
          <>
            <motion.div
              className="fixed inset-0 z-[100] bg-black/65"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => api.closeModal()}
              transition={{
                duration: 0.2,
                ease: [0.2, 0.7, 0.2, 1],
              }}
            />

            <motion.div
              className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center overflow-hidden"
              initial={{
                opacity: 0,
                scale: 0.99,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.99,
              }}
              transition={{
                // Must be >= child prev/curr exit duration (0.35s),
                // otherwise the parent unmounts and cuts the image exit.
                duration: 0.38,
                ease: [0.2, 0.7, 0.2, 1],
              }}
            >
              <button
                type="button"
                aria-label="Close modal"
                className="pointer-events-auto absolute right-4 top-4 z-20 rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/15 sm:right-6 sm:top-6"
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
                className="pointer-events-auto absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/15 sm:left-6 sm:p-3.5"
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
                className="pointer-events-auto absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/15 sm:right-6 sm:p-3.5"
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
              {/* Wipe / shutter reveal (very subtle, no blur/filter) */}
              <div className="pointer-events-none absolute left-1/2 top-0 z-[3] h-full w-[44%] -translate-x-1/2 overflow-hidden">
                <motion.div
                  key={`wipe-${state.transitionKey}`}
                  aria-hidden="true"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{
                    opacity: [0, 0.06, 0],
                    scaleX: [0, 1, 0],
                  }}
                  exit={{ opacity: 0, scaleX: 0 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.2, 0.7, 0.2, 1],
                  }}
                  style={{
                    height: "100%",
                    width: "100%",
                    transformOrigin:
                      state.direction > 0 ? "right center" : "left center",
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(210,235,255,0.95) 50%, rgba(255,255,255,0) 100%)",
                  }}
                />
              </div>

              <AnimatePresence mode="sync">
                {prev && state.prevIndex !== state.index ? (
                  <motion.div
                    key={`prev-${state.transitionKey}-${prevSrc}`}
                    className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"
                    style={{ willChange: "transform, opacity" }}
                    initial={{ opacity: 1, x: 0, scale: 1 }}
                    animate={{
                      opacity: 0,
                      x: -state.direction * slidePx,
                      scale: 0.995,
                    }}
                    exit={{
                      opacity: 0,
                      x: -state.direction * slidePx,
                      scale: 0.995,
                    }}
                    transition={{
                      duration: 0.35,
                      ease: [0.2, 0.7, 0.2, 1],
                    }}
                  >
                    <motion.img
                      key={`prev-img-${state.transitionKey}-${prevSrc}`}
                      src={prev.src}
                      alt={prevAlt}
                      draggable={false}
                      style={{
                        display: "block",
                        width: "auto",
                        height: modalHeight,
                        maxWidth: "94vw",
                        objectFit: "contain",
                        filter: "none",
                        opacity: 1,
                        transform: "scale(1)",
                      }}
                    />
                  </motion.div>
                ) : null}

                <motion.div
                  key={`curr-${state.transitionKey}-${currSrc}`}
                  className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"
                  style={{ willChange: "transform, opacity" }}
                  initial={{
                    opacity: 0,
                    x: state.direction > 0 ? slidePx : -slidePx,
                    scale: 1.01,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x: -state.direction * slidePx,
                    scale: 0.995,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.2, 0.7, 0.2, 1],
                  }}
                >
                  <motion.img
                    key={`curr-img-${state.transitionKey}-${currSrc}`}
                    src={current.src}
                    alt={currAlt}
                    draggable={false}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.08}
                    onDragEnd={handleDragEnd}
                    className="pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: "block",
                      width: "auto",
                      height: modalHeight,
                      maxWidth: "94vw",
                      objectFit: "contain",
                      filter: "none",
                      opacity: 1,
                      transform: "scale(1)",
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </ImageModalContext.Provider>
  );
}

