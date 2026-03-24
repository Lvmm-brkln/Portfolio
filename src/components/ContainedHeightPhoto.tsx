"use client";

/* eslint-disable @next/next/no-img-element */

import { motion, useReducedMotion } from "framer-motion";

import type { PortfolioImage } from "@/content/portfolio";

export function ContainedHeightPhoto({
  image,
  heightClamp,
}: {
  image: PortfolioImage;
  // Hauteur responsive commune (aucun recadrage, formats conservés).
  heightClamp: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={false}
      whileHover={
        reduceMotion ? undefined : { scale: 1.01, transition: { duration: 0.2 } }
      }
      style={{
        height: heightClamp,
        willChange: reduceMotion ? undefined : "transform",
      }}
      className="relative w-full flex-none"
    >
      <img
        src={image.src}
        alt={image.alt}
        draggable={false}
        loading="lazy"
        decoding="async"
        style={{
          height: "100%",
          width: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />
    </motion.div>
  );
}

