"use client";

import { useCallback, useMemo, useState } from "react";

type PronounValue =
  | "ich"
  | "du"
  | "er"
  | "sieFeminine"
  | "es"
  | "wir"
  | "ihr"
  | "siePlural"
  | "SieFormal";

type PronounOption = {
  value: PronounValue;
  label: string;
  meaning: string;
  text: string;
  lockedCase?: "upper";
};

type Prompt = {
  id: number;
  sentence: string;
  english: string;
  turkish: string;
  answers: PronounValue[];
  solution: string;
  explanation: string;
};

const PRONOUN_OPTIONS: PronounOption[] = [
  { value: "ich", label: "ich", meaning: "I", text: "ich" },
  { value: "du", label: "du", meaning: "you (singular)", text: "du" },
  { value: "er", label: "er", meaning: "he", text: "er" },
  { value: "sieFeminine", label: "sie (she)", meaning: "she", text: "sie" },
  { value: "es", label: "es", meaning: "it", text: "es" },
  { value: "wir", label: "wir", meaning: "we", text: "wir" },
  { value: "ihr", label: "ihr", meaning: "you (plural)", text: "ihr" },
  { value: "siePlural", label: "sie (they)", meaning: "they", text: "sie" },
  { value: "SieFormal", label: "Sie (formal)", meaning: "you (formal)", text: "Sie", lockedCase: "upper" },
];

const OPTION_MAP: Record<PronounValue, PronounOption> = PRONOUN_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option;
    return acc;
  },
  {} as Record<PronounValue, PronounOption>,
);

function formatLabelList(labels: string[]): string {
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, or ${labels[labels.length - 1]}`;
}

function buildReplacement(value: PronounValue, sample: string): string {
  const option = OPTION_MAP[value];
  if (!option) {
    return sample;
  }

  if (option.lockedCase === "upper") {
    return option.text;
  }

  const needsCapital = /^[A-ZÄÖÜ]/.test(sample);
  if (!needsCapital) {
    return option.text;
  }

  if (option.text.length === 0) {
    return sample;
  }

  return option.text[0].toUpperCase() + option.text.slice(1);
}

const PROMPT_POOL: Prompt[] = [
  {
    id: 1,
    sentence: "___ bin Anna. Ich komme aus Wien.",
    english: "I am Anna. I come from Vienna.",
    turkish: "Ben Anna'yım. Viyana'dan geliyorum.",
    answers: ["ich"],
    solution: "Ich",
    explanation: "Only ich matches the verb 'bin' for first person singular.",
  },
  {
    id: 2,
    sentence: "___ arbeitet heute im Büro, aber wir haben frei.",
    english: "He / She / It is working at the office today, but we have the day off.",
    turkish: "O bugün ofiste çalışıyor ama bizim izin günümüz.",
    answers: ["er", "sieFeminine", "es"],
    solution: "Er",
    explanation: "The ending -t fits er, sie (she), or es. Context decides who is working.",
  },
  {
    id: 3,
    sentence: "Kinder, ___ seid so laut!",
    english: "Kids, you are so loud!",
    turkish: "Çocuklar, çok gürültülüsünüz!",
    answers: ["ihr"],
    solution: "ihr",
    explanation: "Talking to a familiar group takes ihr.",
  },
  {
    id: 4,
    sentence: "Guten Tag, Frau Bauer. ___ brauchen einen Termin?",
    english: "Good day, Ms Bauer. Do you need an appointment?",
    turkish: "Günaydın Bayan Bauer. Randevuya mı ihtiyacınız var?",
    answers: ["SieFormal"],
    solution: "Sie",
    explanation: "We address Frau Bauer directly, so the formal Sie is required.",
  },
  {
    id: 5,
    sentence: "___ kommen aus Köln und wohnen jetzt in Leipzig.",
    english: "They / You (formal) come from Cologne and now live in Leipzig.",
    turkish: "Onlar ya da siz (resmî) Köln'den geliyor ve şimdi Leipzig'de yaşıyor.",
    answers: ["siePlural", "SieFormal"],
    solution: "Sie",
    explanation: "The -en ending works for sie (they) and formal Sie. Both are acceptable here.",
  },
  {
    id: 6,
    sentence: "Das ist Mia. ___ lernt gerade Deutsch.",
    english: "This is Mia. She is currently learning German.",
    turkish: "Bu Mia. O şu anda Almanca öğreniyor.",
    answers: ["sieFeminine"],
    solution: "Sie",
    explanation: "Mia is female, so we use sie (she).",
  },
  {
    id: 7,
    sentence: "___ nehmen den Bus zur Universität.",
    english: "We / They / You (formal) take the bus to the university.",
    turkish: "Biz, onlar ya da siz (resmî) üniversiteye otobüsle gidersiniz.",
    answers: ["wir", "siePlural", "SieFormal"],
    solution: "Wir",
    explanation:
      "The -en ending appears with wir, sie (they), and formal Sie. Choose any that fits your story.",
  },
  {
    id: 8,
    sentence: "Marie und Max, ___ habt eure Hausaufgaben vergessen.",
    english: "Marie and Max, you have forgotten your homework.",
    turkish: "Marie ve Max, ödevinizi unuttunuz.",
    answers: ["ihr"],
    solution: "ihr",
    explanation: "Addressing two friends together uses ihr.",
  },
  {
    id: 9,
    sentence: "Das ist mein Auto. ___ ist neu.",
    english: "This is my car. It is new.",
    turkish: "Bu benim arabam. O yeni.",
    answers: ["es"],
    solution: "Es",
    explanation: "Auto is neuter in German, so we refer to it with es.",
  },
  {
    id: 10,
    sentence: "Lukas, ___ kommst du mit ins Kino?",
    english: "Lukas, are you coming to the cinema?",
    turkish: "Lukas, sinemaya geliyor musun?",
    answers: ["du"],
    solution: "du",
    explanation: "Directly addressing Lukas uses du.",
  },
];

function pickPrompt(excludeId?: number): Prompt {
  const pool = excludeId ? PROMPT_POOL.filter((item) => item.id !== excludeId) : PROMPT_POOL;
  const source = pool.length > 0 ? pool : PROMPT_POOL;
  const index = Math.floor(Math.random() * source.length);
  return source[index];
}

export default function PersonalPronounsNominativeExercise() {
  const [prompt, setPrompt] = useState<Prompt>(() => pickPrompt());
  const [selected, setSelected] = useState<PronounValue | null>(null);

  const isCorrect = selected !== null && prompt.answers.includes(selected);
  const hasSelection = selected !== null;
  const hasMultipleAnswers = prompt.answers.length > 1;

  const handleSelect = useCallback((value: PronounValue) => {
    setSelected((prev) => (prev === value ? prev : value));
  }, []);

  const handleNext = useCallback(() => {
    setPrompt((current) => pickPrompt(current.id));
    setSelected(null);
  }, []);

  const correctLabels = useMemo(
    () => prompt.answers.map((value) => OPTION_MAP[value]?.label ?? value),
    [prompt.answers],
  );

  const feedbackMessage = useMemo(() => {
    if (!hasSelection) {
      return null;
    }

    if (isCorrect) {
      const base = hasMultipleAnswers
        ? `Correct! This sentence works with ${formatLabelList(correctLabels)}.`
        : "Correct choice!";
      return `${base} ${prompt.explanation}`.trim();
    }

    return `Not quite. ${prompt.explanation}`;
  }, [correctLabels, hasMultipleAnswers, hasSelection, isCorrect, prompt.explanation]);

  const filledSentence = useMemo(() => {
    const substitute = selected !== null ? buildReplacement(selected, prompt.solution) : prompt.solution;
    return prompt.sentence.replace("___", substitute);
  }, [prompt.sentence, prompt.solution, selected]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--color-fg)]">Pronoun selector</h3>
          <p className="text-sm text-[var(--color-muted)]">
            Pick the subject pronoun that completes the sentence. You can try as many options as you
            need—once it is correct you will unlock the next sentence.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-muted)]">Fill the blank</p>
          <p className="text-lg font-medium text-[var(--color-fg)]">{filledSentence}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRONOUN_OPTIONS.map((option) => {
            const isActive = selected === option.value;
            const optionIsCorrect = prompt.answers.includes(option.value);
            const isDisabled = isCorrect && !optionIsCorrect;

            const baseClass = "rounded-full border px-4 py-2 text-sm font-semibold transition";
            const defaultVariant =
              "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-fg)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]";
            const disabledVariant =
              "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted)] opacity-60";
            const correctVariant =
              "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)]";
            const incorrectVariant = "border-red-500 bg-red-500 text-white";

            let variantClass = defaultVariant;

            if (isDisabled) {
              variantClass = disabledVariant;
            } else if (isActive && hasSelection) {
              variantClass = optionIsCorrect ? correctVariant : incorrectVariant;
            }

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                disabled={isDisabled}
                className={`${baseClass} ${variantClass}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {feedbackMessage ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              isCorrect
                ? "border-[var(--color-accent)] bg-[var(--color-surface)] text-[var(--color-fg)]"
                : "border-red-500 bg-red-500/10 text-red-600"
            }`}
          >
            {feedbackMessage}
          </div>
        ) : null}

        {hasSelection ? (
          <div className="space-y-2 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-muted)]">
            <p className="text-[var(--color-fg)]">{prompt.english}</p>
            <p>{prompt.turkish}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleNext}
            className="rounded-full border border-[var(--color-line)] px-5 py-2 text-sm font-semibold text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Skip sentence
          </button>
          {isCorrect ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-[var(--color-bg)] transition hover:bg-[var(--color-accent-soft)]"
            >
              Next sentence
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
