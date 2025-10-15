import Link from "next/link";
import { notFound } from "next/navigation";

import { findUnitBySlug } from "../../course-data";
import { findSectionContent } from "../../section-content";
import VocabularyMilestone from "./VocabularyMilestone";

type SectionPageProps = {
  params: {
    unit: string;
    section: string;
  };
};

export default function TimelineSectionPage({ params }: SectionPageProps) {
  const match = findUnitBySlug(params.unit);

  if (!match) {
    notFound();
  }

  const section = findSectionContent(params.unit, params.section);

  if (!section) {
    notFound();
  }

  const { unit } = match;

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
        <Link
          href={`/timeline/${unit.slug}`}
          className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-1 transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          {unit.code}
        </Link>
        <span className="text-[var(--color-line)]">/</span>
        <span className="uppercase tracking-wide text-[var(--color-accent)]">
          {section.title}
        </span>
      </nav>

      <section className="space-y-6">
        {section.milestones.map((milestone) => {
          if (milestone.type === "vocabulary") {
            return (
              <VocabularyMilestone
                key={milestone.id}
                unitSlug={unit.slug}
                sectionSlug={section.slug}
                sectionId={section.id}
                milestone={milestone}
              />
            );
          }

          return (
            <article
              key={milestone.id}
              className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-sm text-[var(--color-muted)] shadow-sm"
            >
              {milestone.title} için henüz bir içerik tanımlı değil.
            </article>
          );
        })}
      </section>
    </div>
  );
}
