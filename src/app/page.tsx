import { PageEnter } from "@/components/PageEnter";
import { SeriesBlock } from "@/components/SeriesBlock";
import { site } from "@/content/site";
import { getWorkSeries } from "@/server/workSeries";

export default async function Home() {
  const workSeries = await getWorkSeries();
  const modalImages = workSeries.flatMap((s) => s.images);

  return (
    <PageEnter>
      <main className="flex-1">
        <section className="w-full pb-20 pt-14 sm:pt-16">
          <header className="mx-auto max-w-6xl px-6">
            <h1 className="font-serif text-5xl tracking-tight sm:text-6xl md:text-7xl">
              Photography
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-foreground/70 sm:text-base">
              {site.workPageIntro}
            </p>
          </header>

          <div className="gallery-scope mx-auto mt-14 max-w-6xl space-y-14 px-6">
            {workSeries.map((series, index) => (
              <SeriesBlock
                key={series.id}
                series={series}
                isFirst={index === 0}
                modalImages={modalImages}
              />
            ))}
          </div>
        </section>
      </main>
    </PageEnter>
  );
}
