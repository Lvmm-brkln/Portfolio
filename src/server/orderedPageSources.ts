import type { PortfolioImage, WorkSeries } from "@/content/portfolio";

type OrderedSources = {
  desktopSources: string[];
  mobileSources: string[];
};

function chunkDesktopRowSizes(images: PortfolioImage[], rowSizes?: number[]) {
  const count = images.length;

  if (rowSizes && rowSizes.length > 0) {
    const built: PortfolioImage[][] = [];
    let cursor = 0;
    for (const size of rowSizes) {
      built.push(images.slice(cursor, cursor + size));
      cursor += size;
    }
    if (cursor < images.length) built.push(images.slice(cursor));
    return built;
  }

  // Fallback mirrors `SeriesMediaGrid` behavior.
  if (count === 5) return [images.slice(0, 3), images.slice(3, 5)];
  if (count === 6) return [images.slice(0, 3), images.slice(3, 6)];
  if (count === 4) return [images.slice(0, 2), images.slice(2, 4)];
  if (count === 3) return [images.slice(0, 3)];
  if (count === 2) return [images.slice(0, 2)];

  const built: PortfolioImage[][] = [];
  for (let i = 0; i < count; i += 3) built.push(images.slice(i, i + 3));
  return built;
}

function getMobileImagesForSeries(series: WorkSeries): PortfolioImage[] {
  const original = series.images.map((img, i) => ({ img, oldIndex: i + 1 }));
  const hideSet = new Set<number>(
    (series.mobileHideIndices ?? []).filter((n) => Number.isFinite(n))
  );
  const visible = original.filter(({ oldIndex }) => !hideSet.has(oldIndex));

  const mobileOrder = series.mobileOrder ?? [];
  if (!mobileOrder || mobileOrder.length === 0) {
    return visible.map((v) => v.img);
  }

  // Strict mobile order: `mobileOrder` is expressed in old 1-based indices.
  const ordered = mobileOrder
    .map((oldIndex) => visible.find((v) => v.oldIndex === oldIndex)?.img)
    .filter((img): img is PortfolioImage => Boolean(img));

  // If order list is incomplete, append remaining visible images (safety).
  if (ordered.length === visible.length) return ordered;

  const used = new Set(ordered.map((img) => img.src));
  const remaining = visible
    .map((v) => v.img)
    .filter((img) => !used.has(img.src));
  return [...ordered, ...remaining];
}

function flattenDesktopSources(series: WorkSeries[]): string[] {
  const out: string[] = [];

  for (const s of series) {
    const rows = chunkDesktopRowSizes(s.images, s.rowSizes);
    for (const row of rows) {
      for (const img of row) out.push(img.src);
    }
  }

  return out;
}

function flattenMobileSources(series: WorkSeries[]): string[] {
  const out: string[] = [];
  for (const s of series) {
    const mobileImages = getMobileImagesForSeries(s);
    for (const img of mobileImages) out.push(img.src);
  }
  return out;
}

export function getOrderedPageSources(series: WorkSeries[]): OrderedSources {
  return {
    desktopSources: flattenDesktopSources(series),
    mobileSources: flattenMobileSources(series),
  };
}

