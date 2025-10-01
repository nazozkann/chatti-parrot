import Link from "next/link";

import { getReadingCatalog } from "@/app/lib/data/reading-stories";

export default function ReadingHomePage() {
  const catalog = getReadingCatalog();

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="inline-flex w-fit items-center rounded-full bg-[var(--color-bg)] px-4 py-1 text-xs uppercase tracking-wide text-[var(--color-accent)]">
              Reading Lab
            </span>
            <h1 className="text-3xl font-[var(--font-display)]">Short Stories By Level</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
              Discover bite-sized stories tailored to your CEFR level. Each scene uses
              familiar vocabulary from our flashcards and reveals both English and Turkish
              hints when you hover highlighted words.
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-8">
        {catalog.map(({ level, stories }) => {
          const hasStories = stories.length > 0;
          return (
            <div key={level} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-[var(--font-display)]">Level {level}</h2>
                <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  {hasStories
                    ? `${stories.length} ${stories.length === 1 ? "story" : "stories"}`
                    : "Coming soon"}
                </span>
              </div>

              {hasStories ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {stories.map((story) => (
                    <Link
                      key={story.id}
                      href={`/reading/${story.level.toLowerCase()}/${story.slug}`}
                      className="group flex h-full flex-col justify-between rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 transition hover:border-[var(--color-accent)] hover:shadow-lg"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                          <span>{story.level}</span>
                          <span className="h-1 w-1 rounded-full bg-[var(--color-muted)]" />
                          <span>{story.theme}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">
                          {story.title}
                        </h3>
                        <p className="text-sm text-[var(--color-muted)] line-clamp-4">
                          {story.summary}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-between text-xs text-[var(--color-muted)]">
                        <span>{story.estimatedTime}</span>
                        <span className="flex flex-wrap gap-2">
                          {story.focus.map((item) => (
                            <span
                              key={item}
                              className="rounded-full bg-[var(--color-bg)] px-3 py-1 uppercase tracking-wide"
                            >
                              {item}
                            </span>
                          ))}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="rounded-3xl border border-dashed border-[var(--color-line)] bg-[var(--color-bg)] p-6 text-sm text-[var(--color-muted)]">
                  Stories for this level are on the way. New chapters arrive each sprint.
                </p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
