"use client";

import Image from "next/image";

import type { PortfolioImage } from "@/content/portfolio";

export function WorkPhoto({
  image,
}: {
  image: PortfolioImage;
}) {
  return (
    <div className="relative h-full w-full">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        // Pas de crop: conserve le format original.
        className="object-contain"
        unoptimized
      />
    </div>
  );
}

