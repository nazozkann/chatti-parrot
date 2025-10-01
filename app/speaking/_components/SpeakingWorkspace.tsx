"use client";

import { useState } from "react";

export type SpeakingWorkspaceProps = {
  scenario: string;
  instructions: string;
  keyPhrases?: string[];
  guidance?: string[];
};

export function SpeakingWorkspace({
  scenario,
  instructions,
  keyPhrases,
  guidance,
}: SpeakingWorkspaceProps) {
  const [notes, setNotes] = useState("");
  const [isRecording] = useState(false);

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-fg)]">Senaryo</h2>
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">{scenario}</p>
        </div>
        <div className="space-y-4 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Görev
          </h3>
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">{instructions}</p>
          {keyPhrases && keyPhrases.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                Faydalı ifadeler
              </h4>
              <ul className="space-y-1 text-sm leading-relaxed text-[var(--color-muted)]">
                {keyPhrases.map((phrase) => (
                  <li key={phrase} className="rounded-xl bg-[var(--color-bg)] px-3 py-1">
                    {phrase}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {guidance && guidance.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Söylerken unutma
          </h3>
          <ul className="grid gap-3 md:grid-cols-2">
            {guidance.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-3xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)]/50 p-4 text-sm leading-relaxed text-[var(--color-muted)]"
              >
                <span className="mt-[6px] h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Konuşma pratiği
        </h3>
        <p className="text-xs text-[var(--color-muted)]">
          Ses kaydı özelliği yakında aktif olacak. Şimdilik cümlelerini yüksek sesle söyle ve gerekirse aşağıya kısa notlar bırak.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white opacity-60"
          >
            {isRecording ? "Kaydı durdur" : "Kaydı başlat (yakında)"}
          </button>
          <span className="text-xs text-[var(--color-muted)]">
            AI değerlendirmesi yakında
          </span>
        </div>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-4 min-h-[140px] w-full resize-y rounded-3xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4 text-sm text-[var(--color-fg)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
          placeholder="Notlarını veya söylemek istediğin cümleleri buraya yazabilirsin."
        />
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
