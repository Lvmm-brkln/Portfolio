import type { PortfolioImage } from "@/content/portfolio";
import { FixedHeightPhoto } from "@/components/FixedHeightPhoto";

export function SeriesMediaGrid({
  images,
  rowSizes,
  mobileOrder,
  mobileHideIndices,
  modalImages,
  prioritize,
}: {
  images: PortfolioImage[];
  rowSizes?: number[];
  mobileOrder?: number[];
  mobileHideIndices?: number[];
  modalImages?: PortfolioImage[];
  prioritize?: boolean;
}) {
  const modalList = modalImages ?? images;

  const indexByKey = new Map(modalList.map((img, i) => [`${img.src}|${img.alt}`, i]));
  const mobileImages = (() => {
    const original = images.map((img, i) => ({ img, oldIndex: i + 1 }));

    const hideSet = new Set<number>((mobileHideIndices ?? []).filter((n) => Number.isFinite(n)));
    const visible = original.filter(({ oldIndex }) => !hideSet.has(oldIndex));

    if (!mobileOrder || mobileOrder.length === 0) return visible.map((v) => v.img);

    // Strict mobile order: `mobileOrder` is expressed in old 1-based indices.
    const ordered = mobileOrder
      .map((oldIndex) => visible.find((v) => v.oldIndex === oldIndex)?.img)
      .filter((img): img is PortfolioImage => Boolean(img));

    // If order list is incomplete, append remaining visible images (safety).
    if (ordered.length === visible.length) return ordered;

    const used = new Set(ordered.map((img) => img.src));
    const remaining = visible.map((v) => v.img).filter((img) => !used.has(img.src));
    return [...ordered, ...remaining];
  })();

  const rows = (() => {
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

    if (count === 5) return [images.slice(0, 3), images.slice(3, 5)];
    if (count === 6) return [images.slice(0, 3), images.slice(3, 6)];
    if (count === 4) return [images.slice(0, 2), images.slice(2, 4)];
    if (count === 3) return [images.slice(0, 3)];
    if (count === 2) return [images.slice(0, 2)];

    // Fallback: chunk by 3 (final row may have 1-2 items)
    const built: PortfolioImage[][] = [];
    for (let i = 0; i < count; i += 3) built.push(images.slice(i, i + 3));
    return built;
  })();

  const heightClamp = "clamp(150px, 25vw, 540px)";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:hidden">
        {mobileImages.map((image, idx) => (
          <div key={`m-${image.src}`} className="flex w-full justify-center">
            <FixedHeightPhoto
              image={image}
              heightClamp="clamp(180px, 58vw, 440px)"
              modalImages={modalList}
              eager={Boolean(idx < 2 && prioritize)}
              modalIndex={indexByKey.get(`${image.src}|${image.alt}`) ?? 0}
            />
          </div>
        ))}
      </div>

      <div className="hidden space-y-4 sm:block sm:space-y-6">
      {rows.map((row, rowIdx) => {
        const joined =
          row.map((img) => img.src).filter((src) => Boolean(src)).join("|");
        const rowKey = joined || `row-${rowIdx}-${row.length}`;

        return (
          <div key={rowKey} className="flex w-full justify-center">
            <div className="group/row flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:gap-[18px]">
              {row.map((image, imgIdx) => (
                <FixedHeightPhoto
                  key={`${image.src || "x"}|${image.alt || "x"}|${rowIdx}|${imgIdx}`}
                  image={image}
                  heightClamp={heightClamp}
                  modalImages={modalList}
                  eager={Boolean(rowIdx === 0 && prioritize)}
                  modalIndex={
                    indexByKey.get(`${image.src}|${image.alt}`) ?? 0
                  }
                />
              ))}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

