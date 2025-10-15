import Link from "next/link";
import clsx from "clsx";

import PenguinAnimation from "@/app/components/animations/PenguinAnimation";
import { COURSE_PATH } from "./course-data";

const TIMELINE_ENTRIES = COURSE_PATH.flatMap((level) =>
  level.units.map((unit, unitIndex) => ({
    level,
    unit,
    unitIndex,
  }))
);

export default function TimelinePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center rounded-full bg-[var(--color-bg)] px-4 py-1 text-xs uppercase tracking-wide text-[var(--color-accent)]">
              Öğrenme Yolculuğu
            </span>
            <div className="space-y-3">
              <h1 className="text-3xl font-[var(--font-display)] text-[var(--color-fg)]">
                Almanca Timeline
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
                Seçtiğin animasyon bize eşlik ederken, Duolingo tarzında
                ilerleyen modüler ünitelerle A1&apos;den B2 seviyesine kadar yol
                haritanı burada takip edebilirsin.
              </p>
            </div>
          </div>
          <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#ffb347] via-[#ff7f50] to-[#ff5b25] md:w-64">
            <PenguinAnimation className="h-52 w-52 translate-y-4" />
          </div>
        </div>
      </section>

      <section className="relative mx-auto flex max-w-5xl flex-col gap-10">
        <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 -translate-x-1/2 border-l border-dashed border-[var(--color-line)]" />
        <ol className="flex flex-col gap-12">
          {TIMELINE_ENTRIES.map(({ level, unit, unitIndex }, index) => {
            const isLeft = index % 2 === 0;
            return (
              <li
                key={unit.code}
                className="relative grid gap-8 md:grid-cols-[1fr_auto_1fr] md:items-center"
              >
                <div
                  className={clsx(
                    "flex justify-start",
                    isLeft ? "md:order-1 md:justify-start" : "md:order-3 md:justify-end"
                  )}
                >
                  <Link
                    href={`/timeline/${unit.slug}`}
                    className="group block w-full max-w-md rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm transition hover:border-[var(--color-accent)]/60 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                          {level.level} · Modul {unitIndex + 1}
                        </span>
                        <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                          {level.label}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-[var(--color-fg)]">
                        {unit.code} · {unit.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                        {unit.summary}
                      </p>
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                        <span>{unit.topics.length} konu</span>
                        <span className="transition group-hover:translate-x-1">
                          Ayrıntılara git →
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="relative hidden h-full w-12 items-center justify-center md:flex md:order-2">
                  {unitIndex === 0 ? (
                    <span className="absolute -top-10 whitespace-nowrap rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] shadow-sm">
                      {level.level} · {level.label}
                    </span>
                  ) : null}
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[var(--color-accent)] text-sm font-semibold text-white shadow-xl">
                    {unit.code}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
