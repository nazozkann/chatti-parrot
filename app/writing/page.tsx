import Link from "next/link";

import {
  getWritingLevels,
  getWritingTopicsByLevel,
  type WritingLevel,
} from "@/app/lib/data/writing-topics";

function levelLabel(level: WritingLevel) {
  const labels: Record<WritingLevel, string> = {
    A1: "A1 · Başlangıç",
    A2: "A2 · Temel",
    B1: "B1 · Orta",
    B2: "B2 · Üst Orta",
  };
  return labels[level];
}

export default function WritingHomePage() {
  const levels = getWritingLevels();

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="space-y-4">
          <span className="inline-flex w-fit items-center rounded-full bg-[var(--color-bg)] px-4 py-1 text-xs uppercase tracking-wide text-[var(--color-accent)]">
            Writing Studio
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-[var(--font-display)] text-[var(--color-fg)]">
              Yazma pratikleriyle düşüncelerini Almanca ifade et
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
              Seviyene uygun konuyu seç, kısa yönergeleri takip ederek metnini yaz. Daha sonra metnini kaydedebilir veya AI kontrolüyle geliştirebilirsin (yakında!).
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-8">
        {levels.map((level) => {
          const topics = getWritingTopicsByLevel(level);
          if (topics.length === 0) return null;

          return (
            <div key={level} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[var(--color-fg)]">
                  {levelLabel(level)}
                </h2>
                <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  {topics.length} konu
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {topics.map((topic) => (
                  <article
                    key={topic.id}
                    className="flex h-full flex-col justify-between rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm transition hover:border-[var(--color-accent)] hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-[var(--color-fg)]">
                        {topic.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                        {topic.summary}
                      </p>
                    </div>
                    <div className="pt-6">
                      <Link
                        href={`/writing/${level.toLowerCase()}/${topic.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Konuya git →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
