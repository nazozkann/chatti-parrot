"use client";

import { FormEvent, useCallback, useState } from "react";

type PronounKey = "ich" | "du" | "erSieEs" | "wir" | "ihr" | "sieSie";

type PronounStep = {
  key: PronounKey;
  label: string;
  helper: string;
};

type VerbEntry = {
  infinitive: string;
  english: string;
  turkish: string;
  note?: string;
  forms: Record<PronounKey, string>;
};

const PRONOUN_STEPS: PronounStep[] = [
  { key: "ich", label: "ich", helper: "I" },
  { key: "du", label: "du", helper: "you (singular)" },
  { key: "erSieEs", label: "er / sie / es", helper: "he / she / it" },
  { key: "wir", label: "wir", helper: "we" },
  { key: "ihr", label: "ihr", helper: "you (plural)" },
  { key: "sieSie", label: "sie / Sie", helper: "they / you (formal)" },
];

const VERB_POOL: VerbEntry[] = [
  {
    infinitive: "spielen",
    english: "to play",
    turkish: "oynamak",
    forms: {
      ich: "ich spiele",
      du: "du spielst",
      erSieEs: "er spielt",
      wir: "wir spielen",
      ihr: "ihr spielt",
      sieSie: "sie spielen",
    },
  },
  {
    infinitive: "arbeiten",
    english: "to work",
    turkish: "çalışmak",
    forms: {
      ich: "ich arbeite",
      du: "du arbeitest",
      erSieEs: "er arbeitet",
      wir: "wir arbeiten",
      ihr: "ihr arbeitet",
      sieSie: "sie arbeiten",
    },
  },
  {
    infinitive: "wohnen",
    english: "to live",
    turkish: "ikamet etmek",
    forms: {
      ich: "ich wohne",
      du: "du wohnst",
      erSieEs: "er wohnt",
      wir: "wir wohnen",
      ihr: "ihr wohnt",
      sieSie: "sie wohnen",
    },
  },
  {
    infinitive: "essen",
    english: "to eat",
    turkish: "yemek",
    note: "Irregular: du/er uses 'isst'.",
    forms: {
      ich: "ich esse",
      du: "du isst",
      erSieEs: "er isst",
      wir: "wir essen",
      ihr: "ihr esst",
      sieSie: "sie essen",
    },
  },
  {
    infinitive: "lesen",
    english: "to read",
    turkish: "okumak",
    note: "Irregular: du/er changes e → ie.",
    forms: {
      ich: "ich lese",
      du: "du liest",
      erSieEs: "er liest",
      wir: "wir lesen",
      ihr: "ihr lest",
      sieSie: "sie lesen",
    },
  },
  {
    infinitive: "sprechen",
    english: "to speak",
    turkish: "konuşmak",
    note: "Irregular: du/er becomes sprich-.",
    forms: {
      ich: "ich spreche",
      du: "du sprichst",
      erSieEs: "er spricht",
      wir: "wir sprechen",
      ihr: "ihr sprecht",
      sieSie: "sie sprechen",
    },
  },
];

function normaliseAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/ß/g, "ss")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ");
}

function pickRandomVerb(exclude?: string): VerbEntry {
  const pool = exclude
    ? VERB_POOL.filter((verb) => verb.infinitive !== exclude)
    : VERB_POOL;
  const source = pool.length > 0 ? pool : VERB_POOL;
  const index = Math.floor(Math.random() * source.length);
  return source[index];
}

function useVerbCycle(): {
  verb: VerbEntry;
  nextVerb: () => void;
} {
  const [verb, setVerb] = useState<VerbEntry>(() => pickRandomVerb());

  const nextVerb = useCallback(() => {
    setVerb((current) => pickRandomVerb(current?.infinitive));
  }, []);

  return { verb, nextVerb };
}

export default function VerbKonjugationExercise() {
  const { verb, nextVerb } = useVerbCycle();
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const currentStep = PRONOUN_STEPS[stepIndex];
  const expected = verb.forms[currentStep.key];
  const isLastStep = stepIndex === PRONOUN_STEPS.length - 1;

  function resetProgress(newVerb = false) {
    setStepIndex(0);
    setAnswer("");
    setStatus("idle");
    setMessage(null);
    if (newVerb) {
      nextVerb();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!expected) {
      return;
    }

    const guess = normaliseAnswer(answer);
    const solution = normaliseAnswer(expected);

    if (!guess) {
      setStatus("incorrect");
      setMessage("Type the full conjugated form, e.g. 'du spielst'.");
      return;
    }

    if (guess === solution) {
      setStatus("correct");
      setMessage(`Correct: ${expected}`);
    } else {
      setStatus("incorrect");
      setMessage("Not quite. Check the ending for this pronoun.");
    }
  }

  function handleAdvance() {
    if (status !== "correct") {
      return;
    }

    if (isLastStep) {
      resetProgress(true);
    } else {
      setStepIndex((index) => index + 1);
      setAnswer("");
      setStatus("idle");
      setMessage(null);
    }
  }

  function handleSkipVerb() {
    resetProgress(true);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-[var(--color-fg)]">
            Random verb practice
          </h3>
          <p className="text-sm text-[var(--color-muted)]">
            Conjugate <strong className="font-semibold text-[var(--color-fg)]">{verb.infinitive}</strong> ({verb.english} · {verb.turkish}).
            {verb.note ? ` ${verb.note}` : ""}
          </p>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {PRONOUN_STEPS.map((step, index) => {
              const state =
                index < stepIndex
                  ? "completed"
                  : index === stepIndex
                  ? "current"
                  : "upcoming";
              const baseClass =
                "rounded-full border px-3 py-1 transition";
              const variant =
                state === "completed"
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : state === "current"
                  ? "border-[var(--color-fg)] text-[var(--color-fg)]"
                  : "border-[var(--color-line)] text-[var(--color-muted)]";
              return (
                <span key={step.key} className={`${baseClass} ${variant}`}>
                  {step.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Pronoun {stepIndex + 1} / {PRONOUN_STEPS.length}
            </p>
            <h4 className="text-xl font-semibold text-[var(--color-fg)]">
              {currentStep.label}
            </h4>
            <p className="text-sm text-[var(--color-muted)]">
              {currentStep.helper}
            </p>
          </div>

          <label className="flex flex-col gap-2 text-sm text-[var(--color-muted)]">
            Type the full conjugated form
            <input
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                if (status !== "idle") {
                  setStatus("idle");
                  setMessage(null);
                }
              }}
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-base text-[var(--color-fg)] focus:border-[var(--color-accent)] focus:outline-none"
              placeholder="e.g. ich spiele"
              autoComplete="off"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-[var(--color-bg)] transition hover:bg-[var(--color-accent-soft)]"
            >
              Check answer
            </button>
            <button
              type="button"
              onClick={handleSkipVerb}
              className="rounded-full border border-[var(--color-line)] px-5 py-2 text-sm font-semibold text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Skip verb
            </button>
            {status === "correct" ? (
              <button
                type="button"
                onClick={handleAdvance}
                className="rounded-full bg-[var(--color-fg)] px-5 py-2 text-sm font-semibold text-[var(--color-bg)] transition hover:bg-[var(--color-accent)]"
              >
                {isLastStep ? "Next verb" : "Next pronoun"}
              </button>
            ) : null}
          </div>

          {message ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                status === "correct"
                  ? "border-[var(--color-accent)] bg-[var(--color-surface)] text-[var(--color-fg)]"
                  : "border-red-500 bg-red-500/10 text-red-600"
              }`}
            >
              {message}
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
