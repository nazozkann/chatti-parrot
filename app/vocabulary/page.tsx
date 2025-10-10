import Link from "next/link";

import { Sidebar } from "@/app/components/Sidebar";
import { getWordGroupsWithCounts } from "@/app/lib/data/word-groups";

const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

type LevelValue = (typeof levelOrder)[number];

function sortByLevel(a: LevelValue | string, b: LevelValue | string) {
  const ia = levelOrder.indexOf(a as LevelValue);
  const ib = levelOrder.indexOf(b as LevelValue);
  if (ia === -1 && ib === -1) return 0;
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}

export default async function VocabularyPage() {
  const groups = await getWordGroupsWithCounts();

  const sortedGroups = [...groups].sort((a, b) => {
    const levelCompare = sortByLevel(a.level, b.level);
    if (levelCompare !== 0) return levelCompare;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen grid md:grid-cols-[80px_1fr] lg:grid-cols-[16rem_1fr] bg-[var(--color-bg)] text-[var(--color-fg)]">
      <Sidebar />
      <main className="p-6 md:p-10 space-y-10">
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
            Vocabulary Paths
          </p>
          <h1 className="text-3xl font-[var(--font-display)]">Explore Word Collections</h1>
          <p className="max-w-3xl text-sm text-[var(--color-muted)] leading-relaxed">
            Build your fluency with curated vocabulary decks organised by CEFR level. Each
            collection groups essential words, translations, and real-life example sentences so
            you can review, memorise, and practise in context. Pick a deck to dive into and keep
            your streak glowing.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sortedGroups.length === 0 && (
            <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)]">
              No vocabulary groups available yet. Check back soon!
            </div>
          )}

          {sortedGroups.map((group) => (
            <Link
              key={group.id}
              href={`/vocabulary/${group.slug}`}
              className="group flex h-full flex-col gap-4 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 transition hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/10"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  {group.level}
                </span>
                <span className="text-xs text-[var(--color-muted)]">
                  {group.wordCount} word{group.wordCount === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-[var(--color-fg)]">{group.name}</h2>
                <p className="text-sm text-[var(--color-muted)] line-clamp-3">
                  {group.description ?? "Practice everyday phrases and boost your conversational confidence."}
                </p>
              </div>

              <div className="mt-auto flex items-center gap-2 text-sm font-medium text-[var(--color-accent)]">
                View deck
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
