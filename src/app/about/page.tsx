import { PageEnter } from "@/components/PageEnter";
import { site } from "@/content/site";

export default function AboutPage() {
  return (
    <PageEnter>
      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-20">
          <header className="max-w-3xl">
            <h1 className="font-serif text-5xl tracking-tight sm:text-6xl">
              About
            </h1>
            <p className="mt-5 text-sm leading-7 text-foreground/70">
              {site.about}
            </p>
          </header>
        </section>
      </main>
    </PageEnter>
  );
}

