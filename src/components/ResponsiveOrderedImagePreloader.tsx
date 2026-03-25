"use client";

import { useEffect, useMemo, useState } from "react";

import { OrderedImagePreloader } from "@/components/OrderedImagePreloader";

export function ResponsiveOrderedImagePreloader({
  desktopSources,
  mobileSources,
  concurrency = 2,
}: {
  desktopSources: string[];
  mobileSources: string[];
  concurrency?: number;
}) {
  const [layout, setLayout] = useState<"mobile" | "desktop" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setLayout(mq.matches ? "mobile" : "desktop");

    update();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }

    // Safari fallback.
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  const selectedSources = useMemo(() => {
    if (layout === "mobile") return mobileSources;
    if (layout === "desktop") return desktopSources;
    return [];
  }, [layout, desktopSources, mobileSources]);

  if (!layout) return null;

  return (
    <OrderedImagePreloader
      sources={selectedSources}
      concurrency={concurrency}
    />
  );
}

