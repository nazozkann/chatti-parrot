import Link from "next/link";
import { notFound } from "next/navigation";

import { topicExercises } from "@/app/grammar-exercises/_topic-exercises";
import { getGrammarTopic } from "@/app/lib/data/grammar-topics";

export default function GrammarTopicPage({
  params,
}: {
  params: { level: string; slug: string };
}) {
  const topic = getGrammarTopic(params.level, params.slug);

  if (!topic) {
    notFound();
  }

  const backHref = "/grammar-exercises";
  const ExerciseComponent = topicExercises[topic.slug];

  return (
    <div className="space-y-10">
      <nav className="text-xs text-[var(--color-muted)]">
        <Link
          href={backHref}
          className="text-[var(--color-accent)] hover:text-[var(--color-accent-soft)]"
        >
          ← Back to grammar exercises
        </Link>
      </nav>

      <header className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-[var(--color-muted)]">
              <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-[var(--color-fg)]">
                Level {topic.level}
              </span>
              <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-[var(--color-fg)]">
                {topic.estimatedTime}
              </span>
            </div>
            <h1 className="text-3xl font-[var(--font-display)]">
              {topic.title}
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--color-muted)]">
              {topic.summary}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Learning goals
            </p>
            <ul className="mt-3 grid gap-2 text-sm text-[var(--color-fg)] md:grid-cols-2">
              {topic.learningGoals.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-[var(--font-display)]">
            Conjugation chart
          </h2>
          <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Pronoun ↔ Ending match
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {topic.conceptCards.map((card) => (
            <div
              key={`${card.label}-${card.suffix}`}
              className="relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--color-accent)]/10" />
              <div className="absolute -bottom-8 -left-10 h-24 w-24 rounded-full bg-[var(--color-accent)]/10" />
              <div className="relative space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
                    {card.label}
                  </span>
                  <span className="text-3xl font-bold text-[var(--color-accent)]">
                    {card.suffix}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-fg)]">
                  {card.description}
                </p>
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  Example:{" "}
                  <span className="text-[var(--color-fg)]">{card.example}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {topic.tables.map((table) => (
        <section key={table.title} className="space-y-4">
          <h2 className="text-2xl font-[var(--font-display)]">{table.title}</h2>
          {table.caption ? (
            <p className="text-sm text-[var(--color-muted)]">{table.caption}</p>
          ) : null}
          <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)]">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-[var(--color-surface)] text-[var(--color-muted)]">
                <tr>
                  {table.headers.map((header) => (
                    <th
                      key={header}
                      className="border-b border-[var(--color-line)] px-5 py-3 text-left font-medium uppercase tracking-wide"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)] text-[var(--color-fg)]">
                {table.rows.map((row, index) => (
                  <tr
                    key={`${table.title}-${index}`}
                    className="odd:bg-[var(--color-surface)]/40"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${table.title}-${index}-${cellIndex}`}
                        className="px-5 py-3"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="space-y-6">
        <h2 className="text-2xl font-[var(--font-display)]">
          Example sentences
        </h2>
        <div className="space-y-4">
          {topic.examples.map((block) => (
            <div
              key={block.heading}
              className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm"
            >
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[var(--color-fg)]">
                  {block.heading}
                </h3>
                {block.description ? (
                  <p className="text-sm text-[var(--color-muted)]">
                    {block.description}
                  </p>
                ) : null}
                <div className="space-y-3">
                  {block.sentences.map((sentence) => (
                    <div
                      key={sentence.de}
                      className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)]/70 p-4"
                    >
                      <p className="text-sm font-medium text-[var(--color-fg)]">
                        {sentence.de}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {sentence.tr}
                      </p>
                      {sentence.note ? (
                        <p className="mt-2 text-xs uppercase tracking-wide text-[var(--color-accent)]">
                          Note: {sentence.note}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {ExerciseComponent ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-[var(--font-display)]">Practice exercises</h2>
          <ExerciseComponent />
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-2xl font-[var(--font-display)]">Practice ideas</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {topic.practiceIdeas.map((idea) => (
            <div
              key={idea}
              className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-bg)] p-5 text-sm text-[var(--color-fg)] shadow-sm"
            >
              {idea}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
