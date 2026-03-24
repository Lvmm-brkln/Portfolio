"use client";

import { useEffect, useRef, useState } from "react";

import type { PortfolioImage, WorkSeries } from "@/content/portfolio";
import { SeriesBlock } from "@/components/SeriesBlock";

export function LazySeriesStack({
  series,
  modalImages,
  initialCount = 2,
  step = 2,
  className,
}: {
  series: WorkSeries[];
  modalImages: PortfolioImage[];
  initialCount?: number;
  step?: number;
  className?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(Math.max(initialCount, 1), series.length)
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (visibleCount >= series.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (!isVisible) return;
        setVisibleCount((prev) => Math.min(prev + step, series.length));
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [series.length, step, visibleCount]);

  return (
    <div className={className}>
      {series.slice(0, visibleCount).map((item, idx) => (
        <SeriesBlock
          key={item.id}
          series={item}
          isFirst={idx === 0}
          modalImages={modalImages}
          prioritize={idx < 2}
        />
      ))}

      {visibleCount < series.length ? (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className="h-10 w-full opacity-0"
        />
      ) : null}
    </div>
  );
}
