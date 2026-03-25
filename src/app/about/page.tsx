import { PageEnter } from "@/components/PageEnter";
import { site } from "@/content/site";

export default function AboutPage() {
  const paragraphs = site.about
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const first = paragraphs[0] || "";
  const firstChar = first.slice(0, 1);
  const firstRest = first.slice(1);
  const rest = paragraphs.slice(1);

  return (
    <PageEnter>
      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16 sm:pt-20">
          <header className="mx-auto max-w-5xl">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-foreground/55">
                  About
                </p>
                <h1 className="mt-4 font-serif text-6xl leading-[0.92] tracking-tight sm:text-7xl">
                  About
                </h1>
              </div>
              <p className="hidden max-w-[22rem] text-sm leading-7 text-foreground/60 sm:block">
                Photography. Post-production.
                <br />
                Web prototyping. AI-assisted workflows.
              </p>
            </div>

            <div className="mt-10 h-px w-full bg-foreground/10" />
          </header>

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-12 gap-y-10 lg:mt-14 lg:gap-x-16">
            <aside className="col-span-12 lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <div className="space-y-8">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-foreground/55">
                      Based
                    </p>
                    <p className="mt-2 text-sm leading-7 text-foreground/70">
                      France
                    </p>
                  </div>

                  <div className="h-px w-10 bg-foreground/15" />

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-foreground/55">
                      Focus
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-foreground/70">
                      <li>Composition & hierarchy</li>
                      <li>Lighting logic</li>
                      <li>Color discipline</li>
                      <li>Image selection</li>
                      <li>Post-production consistency</li>
                    </ul>
                  </div>
                </div>
              </div>
            </aside>

            <article className="col-span-12 lg:col-span-8">
              <div className="max-w-3xl">
                {first ? (
                  <p className="text-[16px] leading-8 text-foreground/75 sm:text-[17px] sm:leading-8">
                    <span className="float-left mr-3 mt-[0.18em] font-serif text-[58px] leading-[0.78] tracking-tight text-foreground/90 sm:text-[66px]">
                      {firstChar}
                    </span>
                    <span className="tracking-[-0.004em]">{firstRest}</span>
                  </p>
                ) : null}

                <div className="mt-8 space-y-7 text-[15px] leading-8 text-foreground/72 sm:text-[16px] sm:leading-8">
                  {rest.map((p) => (
                    <p key={p} className="tracking-[-0.004em]">
                      {p}
                    </p>
                  ))}
                </div>

                <div className="mt-14 h-px w-full bg-foreground/10" />

                <p className="mt-8 text-sm leading-7 text-foreground/60">
                  I care about images that feel deliberate: clear composition,
                  believable light, controlled color, and the kind of polish
                  that still holds under scrutiny.
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>
    </PageEnter>
  );
}

