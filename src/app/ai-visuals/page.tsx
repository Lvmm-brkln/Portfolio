import { PageEnter } from "@/components/PageEnter";
import { SeriesBlock } from "@/components/SeriesBlock";
import { getAiSeries } from "@/server/aiSeries";
import { getOrderedPageSources } from "@/server/orderedPageSources";
import { ResponsiveOrderedImagePreloader } from "@/components/ResponsiveOrderedImagePreloader";

export default async function AiVisualsPage() {
  const aiSeries = await getAiSeries();
  const modalImages = aiSeries.flatMap((s) => s.images);
  const { desktopSources, mobileSources } = getOrderedPageSources(aiSeries);

  return (
    <PageEnter>
      <main className="flex-1">
        <ResponsiveOrderedImagePreloader
          desktopSources={desktopSources}
          mobileSources={mobileSources}
        />
        <section className="w-full pb-20 pt-14 sm:pt-16">
          <header className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/55">
              Image Generation and Curation
            </p>
            <h1 className="mt-3 font-serif text-5xl tracking-tight sm:text-6xl">
              AI Visuals
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-foreground/72 sm:text-base">
              A curated set of prompt-led studies, compositions, and visual
              experiments.
            </p>
          </header>

          <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6">
            <div className="grid gap-4 md:grid-cols-3">
              <article className="border border-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-foreground/55">
                  Prompt intention
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground/72">
                  Subject, tone, camera logic, and palette constraints are fixed before
                  generation to avoid aesthetic drift.
                </p>
              </article>
              <article className="border border-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-foreground/55">
                  Iteration protocol
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground/72">
                  Variants are compared side-by-side and advanced only when composition,
                  light behavior, and style coherence improve measurably.
                </p>
              </article>
              <article className="border border-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-foreground/55">
                  Selection criteria
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground/72">
                  Final images pass curation when visual hierarchy is clear and technical
                  artifacts are absent under close inspection.
                </p>
              </article>
            </div>
          </section>

          <div className="gallery-scope mx-auto mt-12 max-w-6xl space-y-12 px-4 sm:mt-14 sm:px-6">
            {aiSeries.map((series, index) => (
              <SeriesBlock
                key={series.id}
                series={series}
                isFirst={index === 0}
                modalImages={modalImages}
                prioritize={index < 2}
              />
            ))}
          </div>
        </section>
      </main>
    </PageEnter>
  );
}

