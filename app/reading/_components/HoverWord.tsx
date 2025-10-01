"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TranslationPayload = {
  english: string;
  turkish: string;
};

const translationCache = new Map<string, TranslationPayload>();

export type HoverWordProps = {
  word: string;
  english?: string;
  turkish?: string;
  className?: string;
};

function normaliseWordKey(value: string) {
  return value.trim().toLowerCase();
}

async function fetchTranslation(word: string) {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: word }),
  });

  if (!response.ok) {
    const { error } = (await response.json().catch(() => ({ error: "" }))) as {
      error?: string;
    };
    throw new Error(error || "Çeviri alınamadı.");
  }

  const payload = (await response.json()) as TranslationPayload;
  return {
    english: payload.english.trim(),
    turkish: payload.turkish.trim(),
  };
}

export function HoverWord({ word, english, turkish, className }: HoverWordProps) {
  const [values, setValues] = useState<TranslationPayload>({
    english: english?.trim() ?? "",
    turkish: turkish?.trim() ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(Boolean(english?.trim() || turkish?.trim()));
  const hasFetchedRef = useRef(false);

  const wordKey = useMemo(() => normaliseWordKey(word), [word]);

  useEffect(() => {
    setValues({
      english: english?.trim() ?? "",
      turkish: turkish?.trim() ?? "",
    });
    setFetched(Boolean(english?.trim() || turkish?.trim()));
    hasFetchedRef.current = false;
  }, [english, turkish, wordKey]);

  const ensureTranslation = useCallback(async () => {
    if (hasFetchedRef.current) return;
    if (values.english && values.turkish) return;

    hasFetchedRef.current = true;

    const cached = translationCache.get(wordKey);
    if (cached) {
      setValues(cached);
      setFetched(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchTranslation(word);
      translationCache.set(wordKey, result);
      setValues(result);
      setFetched(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Çeviri alınamadı.";
      setError(message);
      hasFetchedRef.current = false;
      setFetched(false);
    } finally {
      setLoading(false);
    }
  }, [values.english, values.turkish, word, wordKey]);

  const tooltipContent = useMemo(() => {
    if (loading) {
      return {
        en: "Çeviri yükleniyor…",
        tr: "Çeviri yükleniyor…",
      };
    }

    if (error) {
      return {
        en: error,
        tr: error,
      };
    }

    if (fetched && !values.english && !values.turkish) {
      return {
        en: "Çeviri eklenmedi.",
        tr: "Çeviri eklenmedi.",
      };
    }

    return {
      en: values.english || "Çeviri bekleniyor",
      tr: values.turkish || "Çeviri bekleniyor",
    };
  }, [error, fetched, loading, values.english, values.turkish]);

  const rootClassName = [
    "group/hoverword relative inline-flex cursor-help items-baseline",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={rootClassName}
      tabIndex={0}
      onMouseEnter={ensureTranslation}
      onFocus={ensureTranslation}
    >
      <span className="rounded-md bg-[var(--color-bg)] px-1 py-[2px] text-sm font-medium text-[var(--color-fg)] underline decoration-dotted decoration-[var(--color-accent)] underline-offset-4 transition group-hover/hoverword:bg-[var(--color-accent)]/10 group-focus-visible/hoverword:bg-[var(--color-accent)]/10">
        {word}
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden min-w-[12rem] -translate-x-1/2 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-left text-xs leading-relaxed text-[var(--color-muted)] shadow-xl group-hover/hoverword:flex group-focus-visible/hoverword:flex">
        <span className="flex w-full flex-col gap-2">
          <span className="flex items-baseline gap-2">
            <span className="w-6 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              EN
            </span>
            <span className="flex-1 text-sm text-[var(--color-fg)]">{tooltipContent.en}</span>
          </span>
          <span className="flex items-baseline gap-2">
            <span className="w-6 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              TR
            </span>
            <span className="flex-1 text-sm text-[var(--color-fg)]">{tooltipContent.tr}</span>
          </span>
        </span>
      </span>
    </span>
  );
}
