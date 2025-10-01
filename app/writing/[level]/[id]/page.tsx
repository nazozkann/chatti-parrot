import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getWritingTopic,
  getWritingTopicParams,
  type WritingLevel,
} from "@/app/lib/data/writing-topics";
import { WritingWorkspace } from "@/app/writing/_components/WritingWorkspace";

function resolveLevel(levelParam: string): WritingLevel | null {
  const candidate = levelParam.toUpperCase();
  if (["A1", "A2", "B1", "B2"].includes(candidate)) {
    return candidate as WritingLevel;
  }
  return null;
}

export function generateStaticParams() {
  return getWritingTopicParams().map(({ level, id }) => ({
    level: level.toLowerCase(),
    id,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { level: string; id: string };
}): Metadata {
  const level = resolveLevel(params.level);
  if (!level) {
    return { title: "Writing görevi" };
  }

  const topic = getWritingTopic(level, params.id);
  if (!topic) {
    return { title: "Writing görevi" };
  }

  return {
    title: `${topic.title} · Writing ${level}`,
    description: topic.summary,
  };
}

export default function WritingTopicPage({
  params,
}: {
  params: { level: string; id: string };
}) {
  const level = resolveLevel(params.level);
  if (!level) {
    notFound();
  }

  const topic = getWritingTopic(level, params.id);
  if (!topic) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <header className="space-y-4 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <Link
          href="/writing"
          className="inline-flex w-fit items-center text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] underline"
        >
          ← Writing sayfasına dön
        </Link>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-[var(--color-muted)]">
            <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 font-semibold text-[var(--color-accent)]">
              Level {level}
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-[var(--font-display)] text-[var(--color-fg)]">
              {topic.title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
              {topic.summary}
            </p>
          </div>
        </div>
      </header>

      <WritingWorkspace prompt={topic.prompt} guidance={topic.guidance} />
    </div>
  );
}
