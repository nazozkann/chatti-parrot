"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import type { WordEntry } from "@/app/lib/data/word-groups";
import { PronounceButton } from "@/app/vocabulary/_components/PronounceButton";
import { useKeyboardNavigation } from "@/app/vocabulary/_components/useKeyboardNavigation";

function sanitizeDisplay(text?: string) {
  if (!text) return "—";
  return text.trim().length > 0 ? text : "—";
}

function getPronounceValue(raw: string) {
  const trimmed = raw.trim();
  const sanitized = trimmed.replace(/^[^A-Za-zÄÖÜäöüß]+/u, "");
  return sanitized.length > 0 ? sanitized : trimmed;
}

const label = (value: string) => value.toLocaleUpperCase("en-US");

export function VocabularyCards({ words }: { words: WordEntry[] }) {
  const [index, setIndex] = useState(0);
  const count = words.length;

  const currentWord = useMemo(
    () => (count > 0 ? words[index] : null),
    [count, index, words]
  );

  const goPrev = () => setIndex((prev) => (prev - 1 + count) % count);
  const goNext = () => setIndex((prev) => (prev + 1) % count);

  useKeyboardNavigation(goPrev, goNext, count > 1);

  if (!currentWord) {
    return (
      <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)]">
        No words available in this deck yet.
      </div>
    );
  }

  const exampleSentences =
    currentWord.examples.length > 0 ? currentWord.examples : ["—"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
        <span>
          Card {index + 1} / {count}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={count <= 1}
            aria-label="Previous word"
            className="rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] p-2 text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={count <= 1}
            aria-label="Next word"
            className="rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] p-2 text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-40"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <article className="relative mx-auto flex w-full max-w-xl flex-col gap-4 rounded-3xl border border-[var(--color-line)] bg-[var(--color-bg)] p-8 shadow-lg shadow-[var(--color-accent)]/5">
        <header className="flex items-start gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-2xl font-semibold text-[var(--color-fg)]">
              <span>{currentWord.de}</span>
              <PronounceButton word={getPronounceValue(currentWord.de)} />
            </div>
            {currentWord.plural && (
              <p className="text-xs tracking-wide text-[var(--color-muted)]">
                {label("Plural")}: {currentWord.plural}
              </p>
            )}
          </div>
          {currentWord.artikel && (
            <span className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs tracking-wide text-[var(--color-muted)]">
              {label(currentWord.artikel)}
            </span>
          )}
        </header>

        <div className="grid grid-cols-1 gap-3 text-sm text-[var(--color-muted)]">
          <div>
            <p className="text-xs tracking-wide">{label("English")}</p>
            <p className="mt-1 text-base text-[var(--color-fg)]">
              {sanitizeDisplay(currentWord.en)}
            </p>
          </div>
          <div>
            <p className="text-xs tracking-wide">{label("Turkish")}</p>
            <p className="mt-1 text-base text-[var(--color-fg)]">
              {sanitizeDisplay(currentWord.tr)}
            </p>
          </div>
        </div>

        <div className="text-sm text-[var(--color-muted)]">
          <p className="text-xs tracking-wide">{label("Example Sentence")}</p>
          <ul className="mt-2 space-y-2 text-[var(--color-fg)]">
            {exampleSentences.map((sentence, idx) => (
              <li key={idx}>{sentence}</li>
            ))}
          </ul>
        </div>
      </article>
      <p className="text-xs text-center text-[var(--color-muted)]">
        Tip: Use ← and → arrow keys to switch cards quickly.
      </p>
    </div>
  );
}
