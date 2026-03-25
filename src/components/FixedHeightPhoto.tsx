"use client";

/* eslint-disable @next/next/no-img-element */

import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import type { PortfolioImage } from "@/content/portfolio";
import { useImageModal } from "@/components/ImageModalProvider";

export function FixedHeightPhoto({
  image,
  heightClamp,
  modalImages,
  modalIndex,
  eager,
}: {
  image: PortfolioImage;
  // Hauteur responsive conservant une même hauteur pour toutes les images d'une série.
  heightClamp?: string; // CSS clamp(), ex: "clamp(220px, 30vw, 520px)"
  modalImages?: PortfolioImage[];
  modalIndex?: number;
  eager?: boolean;
}) {
  const hoverEventName = "gallery-hover-change";
  const reduceMotion = useReducedMotion();
  const clampValue = heightClamp ?? "clamp(220px, 30vw, 520px)";
  const { openModal } = useImageModal();
  const [isPortraitOrSquare, setIsPortraitOrSquare] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scale = useMotionValue(1);
  const liftZ = useMotionValue(0);
  const isMobileTemplateRef = useRef(false);
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemIdRef = useRef(`${image.src}|${image.alt}`);
  const hoverScale = 1.2;
  const isBabyVibes = image.src.toLowerCase().includes("baby_vibes");

  const spring = { type: "spring", stiffness: 340, damping: 28, mass: 0.34 } as const;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => {
      isMobileTemplateRef.current = mq.matches;
    };

    update();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }

    // Safari fallback (older browsers)
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  useEffect(() => {
    const onHoverChange = (event: Event) => {
      const custom = event as CustomEvent<{ id: string | null }>;
      const nextId = custom.detail?.id ?? null;
      if (nextId && nextId !== itemIdRef.current) {
        if (settleTimerRef.current) {
          clearTimeout(settleTimerRef.current);
          settleTimerRef.current = null;
        }
        liftZ.set(0);
        scale.set(1);
        motionX.set(0);
        motionY.set(0);
      }
    };

    window.addEventListener(hoverEventName, onHoverChange as EventListener);

    return () => {
      window.removeEventListener(hoverEventName, onHoverChange as EventListener);
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCenterShift = (target: EventTarget | null) => {
    if (reduceMotion || isMobileTemplateRef.current) return { shiftX: 0, shiftY: 0 };
    const el = target as HTMLDivElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const headerEl = document.querySelector("header");
    const headerHeight = headerEl instanceof HTMLElement ? headerEl.offsetHeight : 0;
    const viewportPadX = 22;
    const viewportPadTop = headerHeight + 18;
    const viewportPadBottom = 18;
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const dx = viewportCenterX - cardCenterX;
    const dy = viewportCenterY - cardCenterY;

    // Base cinematic drift towards viewport center.
    const baseShiftX = dx * 0.28;
    const baseShiftY = dy * 0.12;

    // Guardrail: keep the scaled image fully inside viewport with a small margin.
    const extraX = (rect.width * (hoverScale - 1)) / 2;
    const extraY = (rect.height * (hoverScale - 1)) / 2;

    const minShiftX = viewportPadX - rect.left + extraX;
    const maxShiftX = window.innerWidth - viewportPadX - rect.right - extraX;
    const minShiftY = viewportPadTop - rect.top + extraY;
    const maxShiftY = window.innerHeight - viewportPadBottom - rect.bottom - extraY;

    const shiftX = Math.max(minShiftX, Math.min(maxShiftX, baseShiftX));
    const shiftY = Math.max(minShiftY, Math.min(maxShiftY, baseShiftY));
    return { shiftX, shiftY };

  };

  const handlePointerEnter = (target: EventTarget | null) => {
    if (isMobileTemplateRef.current) return;
    window.dispatchEvent(
      new CustomEvent<{ id: string | null }>(hoverEventName, {
        detail: { id: itemIdRef.current },
      })
    );
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    liftZ.set(26);
    const { shiftX, shiftY } = updateCenterShift(target) ?? { shiftX: 0, shiftY: 0 };
    if (reduceMotion) {
      motionX.set(shiftX);
      motionY.set(shiftY);
      scale.set(1);
      return;
    }
    animate(scale, hoverScale, spring);
    animate(motionX, shiftX, spring);
    animate(motionY, shiftY, spring);
  };

  const handlePointerLeave = () => {
    if (isMobileTemplateRef.current) return;
    window.dispatchEvent(
      new CustomEvent<{ id: string | null }>(hoverEventName, {
        detail: { id: null },
      })
    );
    if (reduceMotion) {
      motionX.set(0);
      motionY.set(0);
      scale.set(1);
    } else {
      animate(motionX, 0, spring);
      animate(motionY, 0, spring);
      animate(scale, 1, spring);
    }
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
    }
    settleTimerRef.current = setTimeout(() => {
      liftZ.set(0);
      settleTimerRef.current = null;
    }, 340);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    const w = el.naturalWidth;
    const h = el.naturalHeight;
    if (!w || !h) return;
    const ratio = w / h;

    // Give portraits/squares slightly more visual weight in the feed.
    if (ratio <= 0.95) {
      setIsPortraitOrSquare(true);
      return;
    }
    if (ratio <= 1.12) {
      setIsPortraitOrSquare(true);
      return;
    }
    setIsPortraitOrSquare(false);
  };

  const imageTransform = (() => {
    if (isBabyVibes) return "scale(1.2) translateY(-12px)";
    return undefined;
  })();

  const shouldApplyHoverFx = true;
  const shouldApplyPortraitBoost = isPortraitOrSquare;

  return (
    <motion.div
      ref={rootRef}
      initial={false}
      style={{
        willChange: reduceMotion ? undefined : "transform",
        height: clampValue,
        x: motionX,
        y: motionY,
        scale,
        zIndex: liftZ,
      }}
      className={[
        "group/photo gallery-item",
        "flex-none",
        "shrink-0",
        "relative",
        shouldApplyPortraitBoost ? "portrait-mobile-boost" : "",
        "cursor-zoom-in",
        shouldApplyHoverFx
          ? "transition-[opacity,transform,filter] duration-300 ease-out hover:!opacity-100"
          : "",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/50 focus-visible:ring-offset-2",
      ].join(" ")}
      role="button"
      tabIndex={0}
      aria-label={image.alt}
      onPointerEnter={(e) => handlePointerEnter(e.currentTarget)}
      onPointerLeave={() => handlePointerLeave()}
      onBlur={() => handlePointerLeave()}
      onClick={() => {
        if (!modalImages || modalIndex == null) return;
        openModal(modalImages, modalIndex);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!modalImages || modalIndex == null) return;
          openModal(modalImages, modalIndex);
        }
      }}
    >
      <img
        src={image.src}
        alt={image.alt}
        // Même hauteur pour toutes, formats conservés.
        style={{
          height: "100%",
          width: "auto",
          objectFit: undefined,
          display: "block",
          transform: imageTransform,
          transformOrigin: "center center",
        }}
        className={[
          shouldApplyHoverFx
            ? "transition-[filter,transform] duration-300 ease-out group-hover/photo:brightness-[1.06] group-hover/photo:contrast-[1.05] group-hover/photo:drop-shadow-[0_18px_42px_rgba(0,0,0,0.28)]"
            : "",
          shouldApplyPortraitBoost ? "portrait-mobile-boost-img" : "",
        ].join(" ")}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        draggable={false}
        onLoad={handleImageLoad}
      />
    </motion.div>
  );
}

