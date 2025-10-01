import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getListeningScenarioById,
  getListeningScenarioParams,
} from "@/app/lib/data/listening-scenarios";
import { ListeningSession } from "@/app/listening/_components/ListeningSession";

export function generateStaticParams() {
  return getListeningScenarioParams();
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const scenario = getListeningScenarioById(params.id);
  if (!scenario) {
    return {
      title: "Listening Senaryosu",
    };
  }

  return {
    title: `${scenario.title} · Listening`,
    description: scenario.description,
  };
}

export default function ListeningScenarioPage({ params }: { params: { id: string } }) {
  const scenario = getListeningScenarioById(params.id);

  if (!scenario) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="space-y-3">
          <Link
            href="/listening"
            className="inline-flex w-fit items-center text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] underline"
          >
            ← Listening sayfasına dön
          </Link>
          <div className="space-y-2">
            <span className="inline-flex w-fit items-center rounded-full bg-[var(--color-bg)] px-4 py-1 text-xs uppercase tracking-wide text-[var(--color-accent)]">
              Level {scenario.level}
            </span>
            <h1 className="text-3xl font-[var(--font-display)] text-[var(--color-fg)]">
              {scenario.title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
              {scenario.description}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 text-xs uppercase tracking-wide text-[var(--color-muted)]">
          <span className="rounded-full bg-[var(--color-bg)] px-3 py-1">
            Tema: {scenario.theme}
          </span>
          <span className="rounded-full bg-[var(--color-bg)] px-3 py-1">
            Tahmini süre: {scenario.estimatedTime}
          </span>
          {scenario.focus.length > 0 && (
            <span className="flex flex-wrap justify-end gap-2 text-[10px] uppercase tracking-wide">
              {scenario.focus.map((item) => (
                <span key={item} className="rounded-full bg-[var(--color-bg)] px-2 py-1">
                  {item}
                </span>
              ))}
            </span>
          )}
        </div>
      </header>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-fg)]">Dinleme</h2>
        <ListeningSession scenario={scenario} />
      </section>
    </div>
  );
}
