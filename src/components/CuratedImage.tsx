"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import type { PortfolioImage } from "@/content/portfolio";

export function CuratedImage({
  image,
  className,
  fixedHeightClassName,
}: {
  image: PortfolioImage;
  className?: string;
  fixedHeightClassName?: string;
}) {
  const reduceMotion = useReducedMotion();
  const hoverMotionProps = reduceMotion
    ? {}
    : { whileHover: { scale: 1.012 } };

  return (
    <motion.div
      {...hoverMotionProps}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={[
        "relative w-full overflow-hidden",
        className ?? "",
        fixedHeightClassName ?? "",
        // Pas de fond visible : on veut que l'image remplisse la cellule.
      ].join(" ")}
      style={
        fixedHeightClassName
          ? undefined
          : { aspectRatio: image.aspectRatio ?? "4 / 5" }
      }
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
        // Même hauteur pour toutes les images, et remplissage sans "cadres".
        // Le recadrage est uniquement ce qui est nécessaire pour remplir la cellule.
        className="object-cover"
        unoptimized
      />
    </motion.div>
  );
}

