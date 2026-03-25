import { PageEnter } from "@/components/PageEnter";

export default function ContactPage() {
  const email = "jeremiedegueltzl@gmail.com";

  return (
    <PageEnter>
      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-20">
          <header>
            <h1 className="font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
              Contact
            </h1>

            <div className="mt-5 max-w-xl sm:mt-6">
              <p className="text-[13px] leading-7 text-foreground/52 sm:text-sm sm:leading-7">
                For inquiries and selected projects, please write to:
              </p>
              <p className="mt-6 sm:mt-7">
                <a
                  href={`mailto:${email}`}
                  className="inline-block break-all font-serif text-2xl leading-snug tracking-[-0.02em] text-foreground transition-colors hover:text-foreground/75 sm:break-normal sm:text-[1.625rem] sm:leading-snug md:text-3xl"
                >
                  {email}
                </a>
              </p>
            </div>
          </header>
        </section>
      </main>
    </PageEnter>
  );
}
