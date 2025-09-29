import Link from "next/link";

import { getGrammarLevelMap } from "@/app/lib/data/grammar-topics";

export default function GrammarHomePage() {
  const catalog = getGrammarLevelMap();

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="inline-flex w-fit items-center rounded-full bg-[var(--color-bg)] px-4 py-1 text-xs uppercase tracking-wide text-[var(--color-accent)]">
              Grammar Exercises
            </span>

            <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
              Discover grammar topics that match your level, understand the
              rules with visual summaries, and reinforce them with example
              sentences. Start by reviewing regular verb conjugations.
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-6">
        {catalog.map(({ level, topics }) => {
          const hasTopics = topics.length > 0;
          const topicCountLabel = hasTopics
            ? `${topics.length} ${topics.length === 1 ? "topic" : "topics"}`
            : "Coming soon";
          return (
            <div key={level} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-[var(--font-display)]">
                  Level {level}
                </h2>
                <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  {topicCountLabel}
                </span>
              </div>

              {hasTopics ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {topics.map((topic) => (
                    <Link
                      key={topic.slug}
                      href={`/grammar-exercises/${level.toLowerCase()}/${
                        topic.slug
                      }`}
                      className="group flex h-full flex-col justify-between rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 transition hover:border-[var(--color-accent)] hover:shadow-lg"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                          <span>{level}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-[var(--color-muted)]">
                          {topic.summary}
                        </p>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-[var(--color-muted)]">
                        {topic.focus.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-[var(--color-bg)] px-3 py-1"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="rounded-3xl border border-dashed border-[var(--color-line)] bg-[var(--color-bg)] p-6 text-sm text-[var(--color-muted)]">
                  Grammar lessons for this level are still in progress.
                </p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
