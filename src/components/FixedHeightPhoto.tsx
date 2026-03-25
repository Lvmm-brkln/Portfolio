"use client";

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { PortfolioImage } from "@/content/portfolio";
import { useImageModal } from "@/components/ImageModalProvider";
import { galleryHoverRegistry } from "@/components/galleryHoverRegistry";

export function FixedHeightPhoto({
  image,
  heightClamp,
  modalImages,
  modalIndex,
  eager,
}: {
  image: PortfolioImage;
  heightClamp?: string;
  modalImages?: PortfolioImage[];
  modalIndex?: number;
  /** Above-the-fold tiles: eager + high fetch priority. */
  eager?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const clampValue = heightClamp ?? "clamp(220px, 30vw, 520px)";
  const { openModal } = useImageModal();
  const [isPortraitOrSquare, setIsPortraitOrSquare] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scale = useMotionValue(1);
  const liftZ = useMotionValue(0);
  const isMobileTemplateRef = useRef(false);
  const headerHeightRef = useRef(0);
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);
  const dimOpacity = useMotionValue(1);
  const brightness = useMotionValue(1);
  const contrast = useMotionValue(1);
  const shadowAlpha = useMotionValue(0);
  const itemIdRef = useRef(`${image.src}|${image.alt}`);
  // One-shot reveal: never use native `loading="lazy"` here — browsers may re-run the lazy
  // pipeline when nodes move in/out of the viewport on fast scroll. Once `src` mounts, it
  // stays mounted for the lifetime of this component.
  const [srcInDom, setSrcInDom] = useState(() => Boolean(eager));
  // Zoom hover (desktop): ajuster l'intensité sans toucher au mobile.
  const hoverScale = 1.35;
  const isBabyVibes = image.src.toLowerCase().includes("baby_vibes");

  const spring = { type: "spring", stiffness: 340, damping: 28, mass: 0.34 } as const;

  const filter = useMotionTemplate`brightness(${brightness}) contrast(${contrast}) drop-shadow(0 18px 42px rgba(0,0,0,${shadowAlpha}))`;

  useEffect(() => {
    if (eager) setSrcInDom(true);
  }, [eager]);

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

  useLayoutEffect(() => {
    if (srcInDom) return;
    const node = rootRef.current;
    if (!node) return;

    const marginY = Math.min(640, Math.round(window.innerHeight * 0.65));
    const rootMargin = `${marginY}px 0px ${marginY}px 0px`;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target === node) {
            setSrcInDom(true);
            io.disconnect();
            return;
          }
        }
      },
      { root: null, rootMargin, threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [srcInDom]);

  useEffect(() => {
    const computeHeaderHeight = () => {
      const headerEl = document.querySelector("header");
      headerHeightRef.current =
        headerEl instanceof HTMLElement ? headerEl.offsetHeight : 0;
    };

    computeHeaderHeight();
    window.addEventListener("resize", computeHeaderHeight);
    return () => window.removeEventListener("resize", computeHeaderHeight);
  }, []);

  useEffect(() => {
    const id = `${image.src}|${image.alt}`;
    const dimTransition = { duration: 0.18, ease: [0.2, 0.7, 0.2, 1] as const };

    galleryHoverRegistry.register(id, {
      activate: ({ shiftX, shiftY }) => {
        liftZ.set(26);
        if (reduceMotion) {
          motionX.set(shiftX);
          motionY.set(shiftY);
          scale.set(1);
          brightness.set(1.06);
          contrast.set(1.05);
          shadowAlpha.set(0.28);
          return;
        }

        const effectiveHoverScale = isBabyVibes ? 1.42 : hoverScale;
        animate(brightness, 1.06, spring);
        animate(contrast, 1.05, spring);
        animate(shadowAlpha, 0.28, spring);
        animate(scale, effectiveHoverScale, spring);
        animate(motionX, shiftX, spring);
        animate(motionY, shiftY, spring);
      },
      deactivate: () => {
        liftZ.set(0);
        if (reduceMotion) {
          motionX.set(0);
          motionY.set(0);
          scale.set(1);
          brightness.set(1);
          contrast.set(1);
          shadowAlpha.set(0);
          return;
        }

        animate(motionX, 0, spring);
        animate(motionY, 0, spring);
        animate(scale, 1, spring);
        animate(brightness, 1, spring);
        animate(contrast, 1, spring);
        animate(shadowAlpha, 0, spring);
      },
      setDimOpacity: (opacity) => {
        animate(dimOpacity, opacity, dimTransition);
      },
    });

    return () => {
      galleryHoverRegistry.unregister(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image.src, image.alt, reduceMotion]);

  const updateCenterShift = (target: EventTarget | null) => {
    if (reduceMotion || isMobileTemplateRef.current) return { shiftX: 0, shiftY: 0 };
    const el = target as HTMLDivElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const headerHeight = headerHeightRef.current;
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
    const effectiveHoverScale = isBabyVibes ? 2 : hoverScale;
    const extraX = (rect.width * (effectiveHoverScale - 1)) / 2;
    const extraY = (rect.height * (effectiveHoverScale - 1)) / 2;

    const minShiftX = viewportPadX - rect.left + extraX;
    const maxShiftX = window.innerWidth - viewportPadX - rect.right - extraX;
    const minShiftY = viewportPadTop - rect.top + extraY;
    const maxShiftY = window.innerHeight - viewportPadBottom - rect.bottom - extraY;

    const shiftX = Math.max(minShiftX, Math.min(maxShiftX, baseShiftX));
    let shiftY = Math.max(minShiftY, Math.min(maxShiftY, baseShiftY));
    if (isBabyVibes) {
      shiftY = Math.max(minShiftY, Math.min(maxShiftY, shiftY - 12));
    }
    return { shiftX, shiftY };

  };

  const handlePointerEnter = (target: EventTarget | null) => {
    if (isMobileTemplateRef.current) return;
    const { shiftX, shiftY } = updateCenterShift(target) ?? {
      shiftX: 0,
      shiftY: 0,
    };

    galleryHoverRegistry.setActive(itemIdRef.current, { shiftX, shiftY });
  };

  const handlePointerLeave = () => {
    if (isMobileTemplateRef.current) return;
    galleryHoverRegistry.clearActiveIfMatches(itemIdRef.current);
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

  const shouldApplyPortraitBoost = isPortraitOrSquare;

  return (
    <motion.div
      ref={rootRef}
      initial={false}
      style={{
        willChange: reduceMotion ? undefined : "transform",
        height: clampValue,
        opacity: dimOpacity,
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
      {srcInDom ? (
        <motion.img
          src={image.src}
          alt={image.alt}
          style={{
            height: "100%",
            width: "auto",
            objectFit: undefined,
            display: "block",
            filter,
          }}
          className={[
            shouldApplyPortraitBoost ? "portrait-mobile-boost-img" : "",
          ].join(" ")}
          loading="eager"
          fetchPriority={eager ? "high" : "auto"}
          draggable={false}
          onLoad={handleImageLoad}
        />
      ) : (
        <div
          className="h-full shrink-0 bg-foreground/[0.04]"
          style={{ aspectRatio: "4 / 3" }}
          aria-hidden
        />
      )}
    </motion.div>
  );
}

