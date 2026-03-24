import type { PortfolioImage, WorkSeries } from "@/content/portfolio";
import { SeriesMediaGrid } from "@/components/SeriesMediaGrid";

export function SeriesBlock({
  series,
  isFirst,
  modalImages,
}: {
  series: WorkSeries;
  isFirst?: boolean;
  modalImages?: PortfolioImage[];
}) {
  return (
    <section className="space-y-7">
      {isFirst ? (
        // Keep the original breathing room for the very first block.
        <div aria-hidden="true" className="h-[96px] sm:h-[106px]" />
      ) : (
        // Rebalance whitespace around inter-block divider.
        <div aria-hidden="true" className="space-y-0">
          <div className="h-[48px] sm:h-[53px]" />
          <div className="border-t border-black/8" />
          <div className="h-[48px] sm:h-[53px]" />
        </div>
      )}

      <SeriesMediaGrid
        images={series.images}
        rowSizes={series.rowSizes}
        modalImages={modalImages}
      />
    </section>
  );
}

