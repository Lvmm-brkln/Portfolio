import type { PortfolioImage, WorkSeries } from "@/content/portfolio";
import { SeriesMediaGrid } from "@/components/SeriesMediaGrid";

export function SeriesBlock({
  series,
  isFirst,
  modalImages,
  prioritize,
  /** Tighter top lead before the first row of images (Photography). Relaxed = AI Visuals. */
  firstLead = "relaxed",
}: {
  series: WorkSeries;
  isFirst?: boolean;
  modalImages?: PortfolioImage[];
  prioritize?: boolean;
  firstLead?: "tight" | "relaxed";
}) {
  const firstLeadClass =
    firstLead === "tight"
      ? "h-6 sm:h-8"
      : "h-10 sm:h-12";

  return (
    <section className="space-y-7">
      {isFirst ? (
        <div aria-hidden="true" className={firstLeadClass} />
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
        mobileOrder={series.mobileOrder}
        mobileHideIndices={series.mobileHideIndices}
        modalImages={modalImages}
        prioritize={prioritize}
      />
    </section>
  );
}

