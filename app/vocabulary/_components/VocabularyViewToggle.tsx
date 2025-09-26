"use client";

import { useState } from "react";

import type { WordEntry } from "@/app/lib/data/word-groups";
import { PronounceButton } from "@/app/vocabulary/_components/PronounceButton";
import { VocabularyCards } from "@/app/vocabulary/_components/VocabularyCards";
import { VocabularyExercise } from "@/app/vocabulary/_components/VocabularyExercise";

type ViewMode = "cards" | "table";

export function VocabularyViewToggle({ words }: { words: WordEntry[] }) {
  const [mode, setMode] = useState<ViewMode>("cards");

  const pronounceValue = (raw: string) => {
    const trimmed = raw.trim();
    const sanitized = trimmed.replace(/^[^A-Za-zÄÖÜäöüß]+/u, "");
    return sanitized.length > 0 ? sanitized : trimmed;
  };

  const label = (value: string) => value.toLocaleUpperCase("en-US");

  const renderTableView = () => (
    <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-[var(--color-muted)] tracking-wide">
              <th className="border-b border-[var(--color-line)] px-6 py-4">
                {label("German")}
              </th>
              <th className="border-b border-[var(--color-line)] px-6 py-4">
                {label("English")}
              </th>
              <th className="border-b border-[var(--color-line)] px-6 py-4">
                {label("Turkish")}
              </th>
              <th className="border-b border-[var(--color-line)] px-6 py-4">
                {label("Example Sentence")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {words.map((word) => (
              <tr key={word.id} className="align-top">
                <td className="px-6 py-4 text-[var(--color-fg)]">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="break-words">{word.de}</span>
                    <PronounceButton word={pronounceValue(word.de)} />
                  </div>
                  {word.plural && (
                    <div className="mt-1 text-xs text-[var(--color-muted)]">
                      {label("Plural")}: {word.plural}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-[var(--color-muted)]">
                  {word.en ?? "—"}
                </td>
                <td className="px-6 py-4 text-[var(--color-muted)]">
                  {word.tr ?? "—"}
                </td>
                <td className="px-6 py-4 text-[var(--color-muted)]">
                  {word.examples.length > 0 ? (
                    <ul className="space-y-2">
                      {word.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
          <span>View mode</span>
          <div className="flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] p-1 text-xs">
            <button
              type="button"
              onClick={() => setMode("cards")}
              className={`rounded-full px-3 py-1 transition ${
                mode === "cards"
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              Cards
            </button>
            <button
              type="button"
              onClick={() => setMode("table")}
              className={`rounded-full px-3 py-1 transition ${
                mode === "table"
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              Table
            </button>
          </div>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          {words.length} word{words.length === 1 ? "" : "s"}
        </p>
      </div>

      <div>
        {mode === "cards" ? (
          <VocabularyCards words={words} />
        ) : (
          renderTableView()
        )}
      </div>

      <VocabularyExercise words={words} />
    </div>
  );
}
