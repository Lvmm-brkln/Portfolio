"use client";

import { motion, useReducedMotion } from "framer-motion";

import { selectedImages } from "@/content/portfolio";
import { CuratedImage } from "@/components/CuratedImage";

export function SelectedGrid() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {selectedImages.map((image) => (
          <CuratedImage key={image.src + image.alt} image={image} />
        ))}
      </div>
    </motion.div>
  );
}

