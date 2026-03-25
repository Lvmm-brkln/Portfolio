"use client";

import { useEffect, useMemo } from "react";

export function OrderedImagePreloader({
  sources,
  concurrency = 2,
}: {
  sources: string[];
  concurrency?: number;
}) {
  const orderedUniqueSources = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];

    for (const src of sources) {
      if (!src) continue;
      if (seen.has(src)) continue;
      seen.add(src);
      out.push(src);
    }

    return out;
  }, [sources]);

  useEffect(() => {
    if (orderedUniqueSources.length === 0) return;

    let cancelled = false;
    const queue = orderedUniqueSources.slice();
    let active = 0;

    const start = () => {
      if (cancelled) return;

      while (!cancelled && active < concurrency && queue.length > 0) {
        const src = queue.shift();
        if (!src) continue;

        active += 1;

        const img = new window.Image();
        // We explicitly do NOT call decode() to avoid CPU stalls.
        img.decoding = "async";

        const finalize = () => {
          active -= 1;
          // Keep launching next tasks as soon as slots free up.
          start();
        };

        img.onload = finalize;
        img.onerror = finalize;
        img.src = src;
      }
    };

    if (typeof window !== "undefined") {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(start, { timeout: 1200 });
      } else {
        window.setTimeout(start, 0);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [orderedUniqueSources, concurrency]);

  return null;
}

// Keep a default export as well, because Next's RSC/static analysis is stricter
// when importing client components from async server components.
export default OrderedImagePreloader;

