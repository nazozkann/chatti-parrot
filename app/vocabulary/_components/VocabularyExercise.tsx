"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCcw } from "lucide-react";

import type { WordEntry } from "@/app/lib/data/word-groups";

const SPECIAL_CHARACTERS = ["ä", "ö", "ü", "ß"] as const;
const ARTICLES = [
  "der",
  "die",
  "das",
  "den",
  "dem",
  "des",
  "ein",
  "eine",
  "einen",
  "einem",
  "einer",
  "eines",
];

type ExerciseState = {
  word: WordEntry;
};

type FeedbackTone = "neutral" | "correct" | "almost" | "incorrect";

type FeedbackReason = "article" | "minor" | null;

type FeedbackState = {
  tone: FeedbackTone;
  reason: FeedbackReason;
};

const VARIANT_MAP: Record<string, string[]> = {
  ä: ["ä", "ae", "a", "e"],
  ö: ["ö", "oe", "o"],
  ü: ["ü", "ue", "u"],
  ß: ["ß", "ss", "s"],
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripNumberPrefix(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return trimmed;
  }

  const digitMatch = trimmed.match(/^\d+/);
  if (!digitMatch) {
    return trimmed;
  }

  const prefixLength = digitMatch[0].length;
  const nextChar = trimmed.charAt(prefixLength);

  if (nextChar && !/[\s.\-–—:()]/.test(nextChar)) {
    return trimmed;
  }

  let offset = prefixLength;
  while (offset < trimmed.length && /[\s.\-–—:()]/.test(trimmed[offset])) {
    offset += 1;
  }

  const remainder = trimmed.slice(offset).trim();
  return remainder.length > 0 ? remainder : trimmed;
}

function splitArticle(value: string): { article: string | null; rest: string } {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { article: null, rest: "" };
  }

  const lower = trimmed.toLowerCase();
  for (const article of ARTICLES) {
    if (lower.startsWith(`${article} `)) {
      const rest = trimmed.slice(article.length).trimStart();
      return { article, rest };
    }
  }

  return { article: null, rest: trimmed };
}

function buildVariantPattern(value: string): RegExp {
  const lowered = value.toLowerCase();
  let pattern = "";

  for (const char of lowered) {
    if (Object.prototype.hasOwnProperty.call(VARIANT_MAP, char)) {
      const variants = VARIANT_MAP[char];
      pattern += `(?:${variants.join("|")})`;
    } else {
      pattern += escapeRegExp(char);
    }
  }

  return new RegExp(`^${pattern}$`);
}

function stripDiacritics(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/ß/g, "ss");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const dp = Array.from({ length: a.length + 1 }, (_, i) => i);

  for (let j = 1; j <= b.length; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const temp = dp[i];
      if (a[i - 1] === b[j - 1]) {
        dp[i] = prev;
      } else {
        dp[i] = Math.min(prev, dp[i - 1], dp[i]) + 1;
      }
      prev = temp;
    }
  }

  return dp[a.length];
}

function normalize(value: string): string {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\p{P}\p{N}\s]/gu, "");
}

function pickExercise(
  words: WordEntry[],
  previousId?: string
): ExerciseState | null {
  const eligible = words.filter((entry) => {
    const hasTranslation =
      Boolean(entry.en?.trim()) || Boolean(entry.tr?.trim());
    return entry.de.trim().length > 0 && hasTranslation;
  });

  if (eligible.length === 0) {
    return null;
  }

  const pool = eligible.filter((entry) => entry.id !== previousId);
  const candidates = pool.length > 0 ? pool : eligible;

  const word = candidates[Math.floor(Math.random() * candidates.length)];

  return { word };
}

export function VocabularyExercise({ words }: { words: WordEntry[] }) {
  const [exercise, setExercise] = useState<ExerciseState | null>(() =>
    pickExercise(words)
  );
  const [guess, setGuess] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>({
    tone: "neutral",
    reason: null,
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const loadNextExercise = useCallback(
    (currentId?: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      const next = pickExercise(words, currentId);
      setExercise(next);
      setGuess("");
      setHintCount(0);
      setFeedback({ tone: "neutral", reason: null });
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    [words]
  );

  useEffect(() => {
    loadNextExercise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.length]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const answerRaw = exercise?.word.de?.trim() ?? "";
  const answerWord = stripNumberPrefix(answerRaw);
  const answerLength = answerWord.length;

  const correctionContent = useMemo(() => {
    if (feedback.tone !== "almost" || answerWord.length === 0) {
      return null;
    }

    if (feedback.reason === "article") {
      const { article, rest } = splitArticle(answerWord);
      if (!article) {
        return answerWord;
      }

      return (
        <span className="text-[var(--color-accent-soft)]">
          <span className="underline decoration-current underline-offset-4">
            {article}
          </span>
          {rest ? ` ${rest}` : ""}
        </span>
      );
    }

    const guessValue = guess.trim();
    const expectedChars = Array.from(answerWord);
    const guessChars = Array.from(guessValue);
    const limit = Math.min(expectedChars.length, guessChars.length);
    let mismatchIndex = -1;

    for (let index = 0; index < limit; index++) {
      if (
        expectedChars[index].toLowerCase() !==
        (guessChars[index] ?? "").toLowerCase()
      ) {
        mismatchIndex = index;
        break;
      }
    }

    if (mismatchIndex === -1 && expectedChars.length !== guessChars.length) {
      mismatchIndex = Math.min(limit, Math.max(expectedChars.length - 1, 0));
    }

    if (mismatchIndex < 0 || mismatchIndex >= expectedChars.length) {
      return answerWord;
    }

    const before = answerWord.slice(0, mismatchIndex);
    const highlightChar = expectedChars[mismatchIndex] ?? "";
    const after = answerWord.slice(mismatchIndex + 1);

    return (
      <span className="text-[var(--color-accent-soft)]">
        {before}
        <span className="underline decoration-current underline-offset-4">
          {highlightChar}
        </span>
        {after}
      </span>
    );
  }, [answerWord, feedback.reason, feedback.tone, guess]);

  if (!exercise) {
    return null;
  }

  const revealHint = () => {
    if (answerLength === 0) {
      return;
    }
    setHintCount((current) => {
      const nextValue = Math.min(current + 1, answerLength);
      const nextGuess = answerWord.slice(0, nextValue);
      setGuess(nextGuess);
      return nextValue;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const expectedRaw = answerWord;
    const guessRaw = guess.trim();

    const expectedNormalized = normalize(expectedRaw);
    const providedNormalized = normalize(guessRaw);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (expectedNormalized === providedNormalized) {
      setFeedback({ tone: "correct", reason: null });
      timeoutRef.current = setTimeout(() => {
        loadNextExercise(exercise.word.id);
      }, 1000);
    } else {
      const expectedLower = expectedRaw.toLowerCase();
      const guessLower = guessRaw.toLowerCase();
      const collapsedExpected = expectedLower.replace(/\s+/g, "");
      const collapsedGuess = guessLower.replace(/\s+/g, "");

      const spacingMismatch =
        expectedLower !== guessLower &&
        collapsedExpected === collapsedGuess &&
        guessLower.includes(" ");

      const expectedParts = splitArticle(expectedRaw);
      const guessParts = splitArticle(guessRaw);
      const expectedRestNormalized = normalize(expectedParts.rest);
      const guessRestSource = guessParts.article ? guessParts.rest : guessRaw;
      const guessRestNormalized = normalize(guessRestSource);
      const articleMismatch = Boolean(
        expectedParts.article &&
          expectedRestNormalized.length > 0 &&
          expectedRestNormalized === guessRestNormalized &&
          expectedParts.article !== (guessParts.article ?? "")
      );

      const accentExpected = stripDiacritics(collapsedExpected);
      const accentGuess = stripDiacritics(collapsedGuess);
      const distance = levenshtein(accentExpected, accentGuess);

      const variantPattern = buildVariantPattern(collapsedExpected);
      const matchesVariants = variantPattern.test(collapsedGuess);

      const almostCorrect =
        spacingMismatch ||
        articleMismatch ||
        distance === 1 ||
        (matchesVariants && accentExpected === accentGuess);

      if (almostCorrect) {
        setFeedback({ tone: "almost", reason: articleMismatch ? "article" : "minor" });
      } else {
        setFeedback({ tone: "incorrect", reason: null });
        setGuess(answerWord);
        setHintCount(answerLength);
        requestAnimationFrame(() => {
          const input = inputRef.current;
          if (input) {
            input.focus();
            input.setSelectionRange(answerLength, answerLength);
          }
        });
      }
    }
  };

  const isHintAvailable = hintCount < answerLength;
  const englishHint = exercise.word.en?.trim() ?? "";
  const turkishHint = exercise.word.tr?.trim() ?? "";
  const circleClassName =
    feedback.tone === "correct"
      ? "h-6 w-6 rounded-full border border-emerald-500 bg-emerald-500 transition-colors"
      : feedback.tone === "incorrect"
        ? "h-6 w-6 rounded-full border border-red-500 bg-red-500 transition-colors"
        : feedback.tone === "almost"
          ? "h-6 w-6 rounded-full border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)] transition-colors"
          : "h-6 w-6 rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] transition-colors";

  const label = (value: string) => value.toLocaleUpperCase("en-US");
  const insertCharacter = (character: string) => {
    const input = inputRef.current;
    if (!input) {
      setGuess((current) => current + character);
      return;
    }

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const value = input.value;
    const nextValue = value.slice(0, start) + character + value.slice(end);

    setGuess(nextValue);

    requestAnimationFrame(() => {
      input.focus();
      const nextPosition = start + character.length;
      input.setSelectionRange(nextPosition, nextPosition);
    });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-[var(--font-display)] text-[var(--color-fg)]">
            Exercise
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Use the English and Turkish meanings below to type the correct
            German word.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadNextExercise(exercise.word.id)}
          aria-label="Next exercise"
          className="self-start rounded-full border border-[var(--color-line)] p-2 text-[var(--color-fg)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:self-auto"
        >
          <RefreshCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4">
        <p className="text-xs tracking-wide text-[var(--color-muted)]">
          {label("Hints")}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 text-sm text-[var(--color-muted)] md:grid-cols-2">
          <div>
            <p className="text-xs tracking-wide">{label("English")}</p>
            <p className="mt-1 text-lg font-medium text-[var(--color-fg)]">
              {englishHint || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs tracking-wide">{label("Turkish")}</p>
            <p className="mt-1 text-lg font-medium text-[var(--color-fg)]">
              {turkishHint || "—"}
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
          <div className="flex-1 space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              placeholder="Type the German word"
              className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none"
            />
            <div className="flex flex-wrap gap-2">
              {SPECIAL_CHARACTERS.map((character) => (
                <button
                  key={character}
                  type="button"
                  onClick={() => insertCharacter(character)}
                  className="rounded-full border border-[var(--color-line)] px-3 py-1 text-sm text-[var(--color-fg)] transition hover:border-[var(--color-accent)]"
                >
                  {character}
                </button>
              ))}
            </div>
            {correctionContent && (
              <div className="text-sm font-medium text-[var(--color-fg)]">
                {correctionContent}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div aria-hidden="true" className={circleClassName} />
            <button
              type="button"
              onClick={revealHint}
              disabled={!isHintAvailable}
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm transition hover:border-[var(--color-accent)] disabled:opacity-50"
            >
              Hint
            </button>
            <button
              type="submit"
              className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm text-[var(--color-bg)] transition hover:bg-[var(--color-accent-soft)]"
            >
              Check
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
