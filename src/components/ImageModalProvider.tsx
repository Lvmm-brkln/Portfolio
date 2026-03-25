"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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
              {prev && state.prevIndex !== state.index ? (
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"
                >
                  <motion.img
                    key={`prev-${state.transitionKey}-${prev.src}`}
                    src={prev.src}
                    alt={prev.alt}
                    draggable={false}
                    style={{
                      display: "block",
                      width: "auto",
                      height: modalHeight,
                      maxWidth: "94vw",
                      objectFit: "contain",
                      filter: "drop-shadow(0 22px 70px rgba(0,0,0,0.55))",
                      opacity: 0,
                      transform: "scale(1)",
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
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "block",
                    width: "auto",
                    height: modalHeight,
                    maxWidth: "94vw",
                    objectFit: "contain",
                    filter:
                      "drop-shadow(0 20px 64px rgba(0,0,0,0.52)) drop-shadow(0 0 14px rgba(120,150,255,0.12))",
                    opacity: 1,
                    transform: "scale(1)",
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

