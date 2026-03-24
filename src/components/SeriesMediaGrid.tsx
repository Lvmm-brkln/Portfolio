import type { PortfolioImage } from "@/content/portfolio";
import { FixedHeightPhoto } from "@/components/FixedHeightPhoto";

export function SeriesMediaGrid({
  images,
  rowSizes,
  mobileOrder,
  modalImages,
  prioritize,
}: {
  images: PortfolioImage[];
  rowSizes?: number[];
  mobileOrder?: number[];
  modalImages?: PortfolioImage[];
  prioritize?: boolean;
}) {
  const modalList = modalImages ?? images;

  const indexByKey = new Map(modalList.map((img, i) => [`${img.src}|${img.alt}`, i]));
  const mobileImages = (() => {
    if (!mobileOrder || mobileOrder.length === 0) return images;
    const oneBased = mobileOrder
      .map((n) => images[n - 1])
      .filter((img): img is PortfolioImage => Boolean(img));
    if (oneBased.length === images.length) return oneBased;
    const used = new Set(oneBased.map((img) => img.src));
    return [...oneBased, ...images.filter((img) => !used.has(img.src))];
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
        const key = row.map((img) => img.src).join("|");

        return (
          <div key={key} className="flex w-full justify-center">
            <div className="group/row flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:gap-[18px]">
              {row.map((image) => (
                <FixedHeightPhoto
                  key={image.src + image.alt}
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

