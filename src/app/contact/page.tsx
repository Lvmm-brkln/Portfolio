import { PageEnter } from "@/components/PageEnter";
import { site } from "@/content/site";

export default function ContactPage() {
  return (
    <PageEnter>
      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-20">
          <header className="max-w-3xl">
            <h1 className="font-serif text-5xl tracking-tight sm:text-6xl">
              Contact
            </h1>
            <p className="mt-4 text-sm leading-7 text-foreground/70">
              For commissions, collaborations, or licensing inquiries.
            </p>
          </header>

          <div className="mt-14 max-w-2xl">
            <dl className="space-y-6">
              <div className="border-t border-black/5 pt-6">
                <dt className="text-xs font-medium uppercase tracking-wide text-foreground/45">
                  Email
                </dt>
                <dd className="mt-2 text-sm leading-7">
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="font-medium text-foreground transition-colors hover:text-foreground/80"
                  >
                    {site.contact.email}
                  </a>
                </dd>
              </div>

              <div className="border-t border-black/5 pt-6">
                <dt className="text-xs font-medium uppercase tracking-wide text-foreground/45">
                  Instagram
                </dt>
                <dd className="mt-2 text-sm leading-7">
                  <a
                    href={site.contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground transition-colors hover:text-foreground/80"
                  >
                    @{site.contact.instagramHandle}
                  </a>
                </dd>
              </div>

              <div className="border-t border-black/5 pt-6">
                <dt className="text-xs font-medium uppercase tracking-wide text-foreground/45">
                  Resume / PDF
                </dt>
                <dd className="mt-2 text-sm leading-7">
                  <a
                    href={site.contact.resumeUrl}
                    className="font-medium text-foreground transition-colors hover:text-foreground/80"
                  >
                    Download resume
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <section className="mt-12 max-w-4xl border-y border-black/10 py-6">
            <h2 className="font-serif text-2xl tracking-tight">Role fit: Image Tutor</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {site.xaiFit.map((item) => (
                <p key={item} className="text-sm leading-7 text-foreground/72">
                  {item}
                </p>
              ))}
            </div>
          </section>
        </section>
      </main>
    </PageEnter>
  );
}

