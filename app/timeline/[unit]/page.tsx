import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";

import PenguinAnimation from "@/app/components/animations/PenguinAnimation";
import { findUnitBySlug } from "../course-data";
import { findSectionByTopicIndex } from "../section-content";

type TimelineUnitPageProps = {
  params: {
    unit: string;
  };
};

export default function TimelineUnitPage({ params }: TimelineUnitPageProps) {
  const match = findUnitBySlug(params.unit);

  if (!match) {
    notFound();
  }

  const { level, unit } = match;

  return (
    <div className="space-y-10">
      <nav className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
        <Link
          href="/timeline"
          className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-1 transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          ← Timeline&apos;a dön
        </Link>
        <span className="text-[var(--color-line)]">/</span>
        <span className="uppercase tracking-wide text-[var(--color-accent)]">
          {unit.code}
        </span>
      </nav>

      <header className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <span className="inline-flex w-fit items-center rounded-full bg-[var(--color-bg)] px-4 py-1 text-xs uppercase tracking-wide text-[var(--color-accent)]">
              {level.level} Seviyesi
            </span>
            <div className="space-y-3">
              <h1 className="text-3xl font-[var(--font-display)] text-[var(--color-fg)]">
                {unit.code} · {unit.title}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
                {unit.summary}
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden flex h-36 w-full items-center justify-center rounded-3xl bg-gradient-to-br from-[#ffb347] via-[#ff7f50] to-[#ff5b25] md:w-64">
            <PenguinAnimation className="h-52 w-52 translate-y-4" />
          </div>
        </div>
      </header>

      <section className="space-y-8 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-[var(--font-display)] text-[var(--color-fg)]">
              Konu Kataloğu
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              {unit.topics.length} konu başlığı seni bekliyor. Hazır
              hissettiğinde sıradaki üniteye geçebilirsin.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-[var(--color-bg)] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
            {unit.topics.length} Konu
          </span>
        </header>

        <section className="relative mx-auto flex max-w-4xl flex-col gap-10">
          <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 -translate-x-1/2 border-l border-dashed border-[var(--color-line)]" />
          <ol className="flex flex-col gap-12">
            {unit.topics.map((topic, index) => {
              const isLeft = index % 2 === 0;
              const sectionLabel =
                index % 2 === 0 ? `${index + 1} Bölüm` : `Bölüm ${index + 1}`;
              const sectionMeta = findSectionByTopicIndex(unit.slug, index);

              const card = (
                <div className="w-full max-w-md rounded-3xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 text-sm text-[var(--color-fg)] shadow-sm transition hover:border-[var(--color-accent)]/60 hover:shadow-lg">
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                      {sectionLabel}
                    </span>
                    <p className="leading-relaxed text-[var(--color-muted)]">
                      {topic}
                    </p>
                    {sectionMeta ? (
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]/70">
                        Bölümü Aç →
                      </span>
                    ) : null}
                  </div>
                </div>
              );

              return (
                <li
                  key={topic}
                  className="relative grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-8"
                >
                  <div
                    className={clsx(
                      "flex justify-center",
                      isLeft
                        ? "md:order-1 md:col-start-1 md:justify-end"
                        : "md:order-3 md:col-start-3 md:justify-start"
                    )}
                  >
                    {sectionMeta ? (
                      <Link
                        href={`/timeline/${unit.slug}/${sectionMeta.slug}`}
                        className="w-full max-w-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                      >
                        {card}
                      </Link>
                    ) : (
                      card
                    )}
                  </div>

                  <div className="relative hidden h-full w-12 items-center justify-center md:flex md:order-2 md:col-start-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[var(--color-accent)] text-sm font-semibold uppercase text-white shadow-xl">
                      {index + 1}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-center md:hidden">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[var(--color-accent)] text-sm font-semibold uppercase text-white shadow-xl">
                      {index + 1}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </section>
    </div>
  );
}
