import Link from "next/link";

import { getListeningScenarios } from "@/app/lib/data/listening-scenarios";

export default function ListeningHomePage() {
  const scenarios = getListeningScenarios();

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="space-y-4">
          <span className="inline-flex w-fit items-center rounded-full bg-[var(--color-bg)] px-4 py-1 text-xs uppercase tracking-wide text-[var(--color-accent)]">
            Listening Lab
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-[var(--font-display)] text-[var(--color-fg)]">
              Dinleme Atölyesi
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
              Seviyene uygun senaryolardan birini seç ve konuşmayı adım adım dinleyerek kelimeleri pekiştir.
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-fg)]">Senaryolar</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((scenario) => (
            <article
              key={scenario.id}
              className="flex h-full flex-col justify-between rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm transition hover:border-[var(--color-accent)] hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 font-semibold text-[var(--color-accent)]">
                    Level {scenario.level}
                  </span>
                  <span className="rounded-full bg-[var(--color-bg)] px-3 py-1">
                    {scenario.theme}
                  </span>
                  <span className="rounded-full bg-[var(--color-bg)] px-3 py-1">
                    {scenario.estimatedTime}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-[var(--color-fg)]">
                    {scenario.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                    {scenario.description}
                  </p>
                </div>
                {scenario.focus.length > 0 && (
                  <ul className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                    {scenario.focus.map((item) => (
                      <li key={item} className="rounded-full bg-[var(--color-bg)] px-3 py-1">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="pt-6">
                <Link
                  href={`/listening/${scenario.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Senaryoya Git →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
