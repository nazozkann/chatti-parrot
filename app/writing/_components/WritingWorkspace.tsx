"use client";

import { useState } from "react";

export type WritingWorkspaceProps = {
  prompt: string;
  guidance?: string[];
};

export function WritingWorkspace({ prompt, guidance }: WritingWorkspaceProps) {
  const [text, setText] = useState("");

  const wordCount = text.trim()
    ? text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0;

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--color-fg)]">Yazmaya başla</h2>
        <p className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4 text-sm leading-relaxed text-[var(--color-muted)]">
          {prompt}
        </p>
      </div>

      {guidance && guidance.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            İpuçları
          </h3>
          <ul className="space-y-2 text-sm leading-relaxed text-[var(--color-muted)]">
            {guidance.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)]/40 p-3"
              >
                <span className="mt-[5px] h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <label htmlFor="writing-text" className="text-sm font-medium text-[var(--color-fg)]">
          Metnini yaz
        </label>
        <textarea
          id="writing-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Buraya Almanca cümlelerini yazmaya başla..."
          className="min-h-[220px] w-full resize-y rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-fg)] shadow-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
        />
        <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
          <span>{wordCount} kelime</span>
          <span>AI kontrolü yakında</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-2 text-sm font-semibold text-white opacity-60"
        >
          Check with AI
        </button>
      </div>
    </section>
  );
}
