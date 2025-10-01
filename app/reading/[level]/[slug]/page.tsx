import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HoverWord } from "@/app/reading/_components/HoverWord";
import { INTERNAL_DICTIONARY } from "@/app/lib/data/internal-dictionary";
import {
  getReadingLevels,
  getReadingStory,
  getReadingStoryParams,
  type ReadingLevel,
  type StoryBlock,
  type StoryFragment,
} from "@/app/lib/data/reading-stories";
import Link from "next/link";

type ReadingStoryPageProps = {
  params: {
    level: string;
    slug: string;
  };
};

function resolveLevel(levelParam: string): ReadingLevel | null {
  const upperCandidate = levelParam.toUpperCase();
  const availableLevels = getReadingLevels();
  return availableLevels.includes(upperCandidate as ReadingLevel)
    ? (upperCandidate as ReadingLevel)
    : null;
}

function getStoryFromParams(levelParam: string, slug: string) {
  const level = resolveLevel(levelParam);
  if (!level) return null;
  return getReadingStory(level, slug) ?? null;
}

export function generateStaticParams() {
  return getReadingStoryParams().map(({ level, slug }) => ({
    level: level.toLowerCase(),
    slug,
  }));
}

export function generateMetadata({ params }: ReadingStoryPageProps): Metadata {
  const story = getStoryFromParams(params.level, params.slug);
  if (!story) {
    return {
      title: "Reading story",
    };
  }

  return {
    title: `${story.title} · Level ${story.level}`,
    description: story.summary,
  };
}

function getStaticTranslation(word: string) {
  const entry = INTERNAL_DICTIONARY.get(word.trim().toLowerCase());
  if (!entry) return null;
  return {
    english: entry.english,
    turkish: entry.turkish,
  };
}

function renderTextWithHover(content: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let nodeIndex = 0;
  const wordRegex = /\p{L}[\p{L}\-'’]*\p{L}|\p{L}/gu;

  for (const match of content.matchAll(wordRegex)) {
    const matchText = match[0];
    const matchIndex = match.index ?? 0;

    if (cursor < matchIndex) {
      const segment = content.slice(cursor, matchIndex);
      nodes.push(
        <Fragment key={`segment-${keyBase}-${nodeIndex++}`}>{segment}</Fragment>
      );
    }

    const staticTranslation = getStaticTranslation(matchText);

    nodes.push(
      <HoverWord
        key={`hover-${keyBase}-${nodeIndex++}`}
        word={matchText}
        english={staticTranslation?.english}
        turkish={staticTranslation?.turkish}
      />
    );

    cursor = matchIndex + matchText.length;
  }

  if (cursor < content.length) {
    const segment = content.slice(cursor);
    nodes.push(
      <Fragment key={`segment-${keyBase}-${nodeIndex++}`}>{segment}</Fragment>
    );
  }

  if (nodes.length === 0) {
    nodes.push(
      <Fragment key={`segment-${keyBase}-${nodeIndex++}`}>{content}</Fragment>
    );
  }

  return nodes;
}

function renderFragments(fragments: StoryFragment[], parentKey: string) {
  const nodes: ReactNode[] = [];

  fragments.forEach((fragment, index) => {
    const fragmentKey = `${parentKey}-${index}`;
    if (fragment.type === "text") {
      nodes.push(...renderTextWithHover(fragment.content, fragmentKey));
    } else {
      nodes.push(
        <HoverWord
          key={`vocab-${fragmentKey}-${fragment.content}`}
          word={fragment.content}
          english={fragment.english}
          turkish={fragment.turkish}
        />
      );
    }
  });

  return nodes;
}

function renderBlock(block: StoryBlock, index: number) {
  if (block.kind === "paragraph") {
    return (
      <p
        key={`paragraph-${index}`}
        className="text-base leading-7 text-[var(--color-fg)]"
      >
        {renderFragments(block.fragments, `paragraph-${index}`)}
      </p>
    );
  }

  if (block.kind === "dialogue") {
    return (
      <div
        key={`dialogue-${index}`}
        className="flex gap-3 rounded-2xl bg-[var(--color-bg)]/50 p-4 text-base text-[var(--color-fg)]"
      >
        <span className="min-w-[72px] text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          {block.speaker}
        </span>
        <span className="text-base leading-7">
          {renderFragments(block.fragments, `dialogue-${index}`)}
        </span>
      </div>
    );
  }

  return (
    <div
      key={`scene-break-${index}`}
      className="flex items-center gap-4 py-4 text-xs uppercase tracking-wide text-[var(--color-muted)]"
    >
      <span className="h-px flex-1 bg-[var(--color-line)]" />
      {block.label ? <span>{block.label}</span> : null}
      <span className="h-px flex-1 bg-[var(--color-line)]" />
    </div>
  );
}

export default function ReadingStoryPage({ params }: ReadingStoryPageProps) {
  const story = getStoryFromParams(params.level, params.slug);

  if (!story) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-[var(--color-muted)]">
            <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 font-semibold text-[var(--color-accent)]">
              Level {story.level}
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-[var(--color-muted)] md:block" />
            <span>{story.theme}</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-[var(--font-display)] text-[var(--color-fg)]">
              {story.title}
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--color-muted)]">
              {story.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-bg)] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
              {story.estimatedTime}
            </span>
            <span className="inline-flex flex-wrap gap-2 rounded-xl bg-[var(--color-bg)] px-4 py-2">
              {story.focus.map((item) => (
                <span key={item} className="text-xs uppercase tracking-wide">
                  {item}
                </span>
              ))}
            </span>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-fg)]">
            Key vocabulary
          </h2>
          <Link
            href="/reading"
            className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)] hover:underline"
          >
            Back to stories
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {story.keyVocabulary.map((item) => (
            <div
              key={item.word}
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5"
            >
              <p className="text-base font-semibold text-[var(--color-fg)]">
                {item.word}
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                English: {item.english}
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                Turkish: {item.turkish}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-fg)]">Story</h2>
        <article className="space-y-4 rounded-3xl border border-[var(--color-line)]  p-8">
          {story.content.map((block, index) => renderBlock(block, index))}
        </article>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-fg)]">
          Check your understanding
        </h2>
        <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-[var(--color-muted)]">
          {story.comprehensionPrompts.map((prompt, index) => (
            <li key={`prompt-${index}`}>{prompt}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
