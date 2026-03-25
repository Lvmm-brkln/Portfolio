import { PageEnter } from "@/components/PageEnter";
import { SeriesBlock } from "@/components/SeriesBlock";
import OrderedImagePreloader from "@/components/OrderedImagePreloader";
import { getAiSeries } from "@/server/aiSeries";

export default async function AiVisualsPage() {
  const aiSeries = await getAiSeries();
  const modalImages = aiSeries.flatMap((s) => s.images);
  const topSources = aiSeries
    .slice(0, 2)
    .flatMap((s) => s.images)
    .map((i) => i.src);

  return (
    <PageEnter>
      <main className="flex-1">
        <OrderedImagePreloader sources={topSources} />
        <section className="w-full pb-20 pt-9 sm:pt-10">
          <header className="mx-auto max-w-6xl px-4 sm:px-6">
            <h1 className="font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
              AI Visuals
            </h1>
            <p className="mt-2.5 max-w-3xl text-sm leading-7 text-foreground/70 sm:mt-3 sm:text-base">
              A selection of generated images shaped through prompting, iteration,
              and visual judgment.
            </p>
          </header>

          <div className="gallery-scope mx-auto mt-8 max-w-6xl space-y-12 px-4 sm:mt-9 sm:px-6">
            {aiSeries.map((series, index) => (
              <SeriesBlock
                key={series.id}
                series={series}
                isFirst={index === 0}
                modalImages={modalImages}
                prioritize={index < 2}
                firstLead="relaxed"
              />
            ))}
          </div>
        </section>
      </main>
    </PageEnter>
  );
}

