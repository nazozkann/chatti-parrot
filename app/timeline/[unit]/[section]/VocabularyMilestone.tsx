"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import type {
  VocabularyMilestone,
  VocabularyTranslation,
} from "@/app/timeline/section-content";
import { PronounceButton } from "@/app/vocabulary/_components/PronounceButton";

const SPECIAL_CHARACTERS = ["ä", "ö", "ü", "ß"] as const;

const VARIANT_MAP: Record<string, string[]> = {
  ä: ["ä", "ae"],
  ö: ["ö", "oe"],
  ü: ["ü", "ue"],
  ß: ["ß", "ss"],
};

type FeedbackTone = "neutral" | "correct" | "almost" | "incorrect";
type StatRecord = {
  correctCount: number;
  wrongCount: number;
  lastReviewedAt: string | null;
};

type VocabularyEntryView = {
  id: string;
  word: string;
  translations: VocabularyTranslation[];
  audioUrl?: string | null;
};

type DialogueLineView = {
  speaker: string;
  text: string;
};

type DialogueExerciseView = {
  id: string;
  lines: DialogueLineView[];
  answers: string[];
  options: string[];
};

type VocabularyMilestoneProps = {
  unitSlug: string;
  sectionSlug: string;
  sectionId: string;
  milestone: VocabularyMilestone;
};

const defaultStat: StatRecord = {
  correctCount: 0,
  wrongCount: 0,
  lastReviewedAt: null,
};

type MatchPageState = {
  pairs: VocabularyEntryView[];
  leftOrder: string[];
  rightOrder: string[];
  matched: string[];
};

function shuffle<T>(items: T[]): T[] {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) {
    return [items];
  }

  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function formatTranslation(entry: VocabularyEntryView) {
  const english = entry.translations.find(
    (translation) => translation.locale?.toLowerCase() === "en"
  )?.value;
  const turkish = entry.translations.find(
    (translation) => translation.locale?.toLowerCase() === "tr"
  )?.value;

  const pieces: string[] = [];

  if (english) {
    pieces.push(`EN: ${english}`);
  }
  if (turkish) {
    pieces.push(`TR: ${turkish}`);
  }

  if (pieces.length === 0) {
    const fallback = entry.translations
      .map(
        (translation) =>
          `${translation.locale.toUpperCase()}: ${translation.value}`
      )
      .join(" / ");
    if (fallback) {
      pieces.push(fallback);
    }
  }

  return pieces.join(" · ");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripNumberPrefix(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return trimmed;
  }

  const match = trimmed.match(/^\d+/);
  if (!match) {
    return trimmed;
  }

  const prefixLength = match[0].length;
  const nextChar = trimmed.charAt(prefixLength);

  if (nextChar && !/[\s.\-–—:()]/.test(nextChar)) {
    return trimmed;
  }

  let offset = prefixLength;
  while (offset < trimmed.length && /[\s.\-–—:()]/.test(trimmed[offset])) {
    offset += 1;
  }

  const rest = trimmed.slice(offset).trim();
  return rest.length > 0 ? rest : trimmed;
}

function splitArticle(value: string): { article: string | null; rest: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { article: null, rest: "" };
  }

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
  const lower = value.toLowerCase();
  let pattern = "";

  for (const char of lower) {
    if (VARIANT_MAP[char]) {
      pattern += `(?:${VARIANT_MAP[char].join("|")})`;
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

  const matrix = Array.from({ length: a.length + 1 }, (_, index) => index);

  for (let j = 1; j <= b.length; j++) {
    let prev = matrix[0];
    matrix[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const temp = matrix[i];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i] = Math.min(matrix[i] + 1, matrix[i - 1] + 1, prev + cost);
      prev = temp;
    }
  }

  return matrix[a.length];
}

function normalize(value: string): string {
  return stripDiacritics(
    stripNumberPrefix(value).toLowerCase().replace(/\s+/g, " ").trim()
  );
}

export default function VocabularyMilestone(props: VocabularyMilestoneProps) {
  const { milestone, sectionId, sectionSlug, unitSlug } = props;

  const [entries, setEntries] = useState<VocabularyEntryView[]>([]);
  const [stats, setStats] = useState<Record<string, StatRecord>>({});
  const [phase, setPhase] =
    useState<"learn" | "practice" | "match" | "dialogue">("learn");
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>("neutral");
  const [matchPages, setMatchPages] = useState<MatchPageState[]>([]);
  const [dialogues, setDialogues] = useState<DialogueExerciseView[]>([]);
  const [matchPageIndex, setMatchPageIndex] = useState(0);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [dialogueSelections, setDialogueSelections] = useState<(string | null)[]>([]);
  const [completedDialogues, setCompletedDialogues] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const mismatchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeEntry = entries[activeIndex] ?? entries[0] ?? null;
  const currentMatchPage = matchPages[matchPageIndex] ?? null;
  const totalMatchPages = matchPages.length;
  const currentMatchedSet = new Set(currentMatchPage?.matched ?? []);
  const currentDialogue = dialogues[dialogueIndex] ?? null;
  const totalDialogues = dialogues.length;
  const isDialogueCompleted = currentDialogue
    ? completedDialogues.includes(currentDialogue.id)
    : false;
  const hasIncompleteDialogueSlot = currentDialogue
    ? dialogueSelections.length < currentDialogue.answers.length ||
      dialogueSelections.some((value) => value === null)
    : false;
  const hasDialogueMismatch = currentDialogue
    ? dialogueSelections.some(
        (value, index) =>
          value !== null &&
          normalize(value) !==
            normalize(currentDialogue.answers[index] ?? "")
      )
    : false;
  const answerWord = activeEntry ? activeEntry.word : "";
  const answerLength = answerWord.length;

  const learnedCount = useMemo(
    () =>
      entries.reduce((count, entry) => {
        const stat = stats[entry.id] ?? defaultStat;
        return stat.correctCount > 0 ? count + 1 : count;
      }, 0),
    [entries, stats]
  );

  const totalCount = entries.length;
  const practiceProgressRatio =
    totalCount === 0 ? 0 : learnedCount / totalCount;
  const learnProgressRatio =
    phase === "learn" && totalCount > 0
      ? Math.min((activeIndex + 1) / totalCount, 1)
      : 0;
  const totalPairs = matchPages.reduce(
    (sum, page) => sum + page.pairs.length,
    0
  );
  const matchedPairs = matchPages.reduce(
    (sum, page) => sum + page.matched.length,
    0
  );
  const matchProgressRatio = totalPairs === 0 ? 0 : matchedPairs / totalPairs;
  const dialoguesCompletedCount = completedDialogues.length;
  const dialogueProgressRatio =
    totalDialogues === 0 ? 0 : dialoguesCompletedCount / totalDialogues;
  const displayedProgress =
    phase === "learn"
      ? learnProgressRatio
      : phase === "practice"
        ? practiceProgressRatio
        : phase === "match"
          ? matchProgressRatio
          : dialogueProgressRatio;

  const remainingForPractice = useMemo(
    () => entries.filter((entry) => (stats[entry.id]?.correctCount ?? 0) === 0),
    [entries, stats]
  );

  const progressLabel = (() => {
    if (entries.length === 0 && totalDialogues === 0) {
      return "İlerleme";
    }

    if (phase === "learn") {
      return `Kelime ${Math.min(activeIndex + 1, Math.max(totalCount, 1))} / ${Math.max(totalCount, 1)}`;
    }

    if (phase === "practice") {
      return `Pratik ${learnedCount} / ${Math.max(totalCount, 1)}`;
    }

    if (phase === "match") {
      return totalMatchPages > 0
        ? `Eşleştirme ${matchPageIndex + 1} / ${totalMatchPages}`
        : "Eşleştirme";
    }

    if (phase === "dialogue") {
      return totalDialogues > 0
        ? `Diyalog ${Math.min(dialogueIndex + 1, totalDialogues)} / ${totalDialogues}`
        : "Diyalog";
    }

    return "İlerleme";
  })();

  const startDialoguePhase = useCallback(
    (index: number) => {
      if (!dialogues.length) {
        return;
      }

      const clamped = Math.max(0, Math.min(index, dialogues.length - 1));
      const dialogue = dialogues[clamped];

      if (mismatchTimeout.current) {
        clearTimeout(mismatchTimeout.current);
        mismatchTimeout.current = null;
      }
      if (advanceTimeout.current) {
        clearTimeout(advanceTimeout.current);
        advanceTimeout.current = null;
      }

      setPhase("dialogue");
      setDialogueIndex(clamped);
      setDialogueSelections(
        dialogue ? Array(dialogue.answers.length).fill(null) : []
      );
      setFeedbackTone("neutral");
      setHintCount(0);
      setSelectedLeft(null);
      setSelectedRight(null);
      setInputValue("");
    },
    [dialogues]
  );

  const handleDialogueOptionSelect = useCallback(
    (option: string) => {
      if (phase !== "dialogue") {
        return;
      }

      const dialogue = currentDialogue;
      if (!dialogue || completedDialogues.includes(dialogue.id)) {
        return;
      }

      if (dialogueSelections.length !== dialogue.answers.length) {
        setDialogueSelections(Array(dialogue.answers.length).fill(null));
        return;
      }

      const maxCount = dialogue.answers.filter((answer) => answer === option).length;
      const currentCount = dialogueSelections.filter((value) => value === option).length;
      if (maxCount > 0 && currentCount >= maxCount) {
        return;
      }
      if (maxCount === 0 && dialogueSelections.includes(option)) {
        return;
      }

      const emptyIndex = dialogueSelections.findIndex((value) => value === null);
      if (emptyIndex === -1) {
        return;
      }

      const next = [...dialogueSelections];
      next[emptyIndex] = option;
      setDialogueSelections(next);
      setFeedbackTone("neutral");
    },
    [completedDialogues, currentDialogue, dialogueSelections, phase]
  );

  const handleDialogueSlotClear = useCallback(
    (index: number) => {
      if (phase !== "dialogue") {
        return;
      }

      const dialogue = currentDialogue;
      if (!dialogue || completedDialogues.includes(dialogue.id)) {
        return;
      }

      if (dialogueSelections.length !== dialogue.answers.length) {
        setDialogueSelections(Array(dialogue.answers.length).fill(null));
        return;
      }

      if (dialogueSelections[index] === null) {
        return;
      }

      const next = [...dialogueSelections];
      next[index] = null;
      setDialogueSelections(next);
      setFeedbackTone("neutral");
    },
    [completedDialogues, currentDialogue, dialogueSelections, phase]
  );

  const handleDialogueReset = useCallback(() => {
    if (phase !== "dialogue") {
      return;
    }

    const dialogue = currentDialogue;
    if (!dialogue || completedDialogues.includes(dialogue.id)) {
      return;
    }

    setDialogueSelections(Array(dialogue.answers.length).fill(null));
    setFeedbackTone("neutral");
  }, [completedDialogues, currentDialogue, phase]);

  const handleDialogueSubmit = useCallback(() => {
    if (phase !== "dialogue") {
      return;
    }

    const dialogue = currentDialogue;
    if (!dialogue || completedDialogues.includes(dialogue.id)) {
      return;
    }

    if (dialogueSelections.length !== dialogue.answers.length) {
      setDialogueSelections(Array(dialogue.answers.length).fill(null));
      setFeedbackTone("neutral");
      return;
    }

    if (dialogueSelections.some((value) => value === null)) {
      setFeedbackTone("incorrect");
      return;
    }

    const normalizedSelections = dialogueSelections.map((value) =>
      normalize(value ?? "")
    );
    const normalizedAnswers = dialogue.answers.map((answer) => normalize(answer));

    const isCorrect = normalizedSelections.every(
      (value, index) => value === normalizedAnswers[index]
    );

    if (isCorrect) {
      setFeedbackTone("correct");
      setCompletedDialogues((prev) =>
        prev.includes(dialogue.id) ? prev : [...prev, dialogue.id]
      );

      if (advanceTimeout.current) {
        clearTimeout(advanceTimeout.current);
      }

      if (dialogueIndex < dialogues.length - 1) {
        advanceTimeout.current = setTimeout(() => {
          startDialoguePhase(dialogueIndex + 1);
          advanceTimeout.current = null;
        }, 800);
      }
    } else {
      setFeedbackTone("incorrect");
    }
  }, [
    completedDialogues,
    currentDialogue,
    dialogueIndex,
    dialogueSelections,
    dialogues.length,
    phase,
    startDialoguePhase,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/sections/${unitSlug}/${sectionSlug}/vocabulary?milestoneId=${milestone.id}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Veriler alınamadı.");
        }

        const data = await response.json();
        if (!isMounted) {
          return;
        }

        const fetchedEntries: VocabularyEntryView[] = Array.isArray(
          data.entries
        )
          ? (
              data.entries as Array<{
                id?: string;
                _id?: string;
                word?: string;
                translations?: VocabularyTranslation[];
                audioUrl?: string | null;
              }>
            )
              .filter((entry) => typeof entry?.word === "string")
              .map((entry) => ({
                id:
                  typeof entry.id === "string"
                    ? entry.id
                    : entry._id
                    ? String(entry._id)
                    : (entry.word as string),
                word: entry.word as string,
                translations: Array.isArray(entry.translations)
                  ? entry.translations.filter(
                      (translation): translation is VocabularyTranslation =>
                        typeof translation?.locale === "string" &&
                        typeof translation?.value === "string"
                    )
                  : [],
                audioUrl: entry.audioUrl ?? null,
              }))
          : [];

        const incomingStats: Record<string, StatRecord> = data.stats ?? {};
        const mergedStats: Record<string, StatRecord> = fetchedEntries.reduce(
          (acc, entry) => {
            acc[entry.id] = incomingStats[entry.id] ?? { ...defaultStat };
            return acc;
          },
          {} as Record<string, StatRecord>
        );

        setEntries(fetchedEntries);
        setStats(mergedStats);

        const matchSetup: MatchPageState[] = chunkArray(fetchedEntries, 5).map(
          (chunk) => {
            const ids = chunk.map((entry) => entry.id);
            return {
              pairs: chunk,
              leftOrder: shuffle(ids),
              rightOrder: shuffle(ids),
              matched: [],
            };
          }
        );
        setMatchPages(matchSetup);
        setMatchPageIndex(0);
        setSelectedLeft(null);
        setSelectedRight(null);

        const dialogueEntries: DialogueExerciseView[] = Array.isArray(
          data.dialogues
        )
          ? (data.dialogues as Array<{
              id?: string;
              _id?: string;
              lines?: Array<{ speaker?: string; text?: string }>;
              answers?: string[];
              options?: string[];
            }>)
              .filter((dialogue) => Array.isArray(dialogue?.answers))
              .map((dialogue, index) => ({
                id:
                  typeof dialogue.id === "string"
                    ? dialogue.id
                    : dialogue._id
                      ? String(dialogue._id)
                      : `dialogue-${index}`,
                lines: Array.isArray(dialogue.lines)
                  ? dialogue.lines
                      .filter(
                        (line) =>
                          typeof line?.speaker === "string" &&
                          typeof line?.text === "string"
                      )
                      .map((line) => ({
                        speaker: line.speaker ?? "",
                        text: line.text ?? "",
                      }))
                  : [],
                answers: Array.isArray(dialogue.answers)
                  ? dialogue.answers.filter((answer) => typeof answer === "string")
                  : [],
                options: Array.isArray(dialogue.options)
                  ? dialogue.options.filter((option) => typeof option === "string")
                  : [],
              }))
          : [];

        setDialogues(dialogueEntries);
        setCompletedDialogues([]);
        setDialogueIndex(0);
        setDialogueSelections(
          dialogueEntries.length
            ? Array(dialogueEntries[0].answers.length).fill(null)
            : []
        );

        const isAlreadyComplete = Boolean(
          data.progress?.completedMilestones?.includes(milestone.id)
        );

        setIsComplete(isAlreadyComplete);
        setHasMarkedComplete(isAlreadyComplete);

        const hasEntries = fetchedEntries.length > 0;
        const hasMatchPairs = matchSetup.some((page) => page.pairs.length > 0);
        const hasDialogues = dialogueEntries.length > 0;

        setActiveIndex(0);
        setInputValue("");
        setFeedbackTone("neutral");
        setHintCount(0);

        if (isAlreadyComplete) {
          if (hasDialogues) {
            setPhase("dialogue");
          } else if (hasMatchPairs) {
            setPhase("match");
          } else if (hasEntries) {
            setPhase("practice");
          } else {
            setPhase("learn");
          }
          return;
        }

        if (hasEntries) {
          setPhase("learn");
        } else if (hasMatchPairs) {
          setPhase("match");
        } else if (hasDialogues) {
          setPhase("dialogue");
        } else {
          setPhase("learn");
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError((err as Error).message);
        setEntries([]);
        setStats({});
        setPhase("learn");
        setActiveIndex(0);
        setDialogues([]);
        setDialogueSelections([]);
        setCompletedDialogues([]);
        setFeedbackTone("neutral");
        setHintCount(0);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [milestone.id, sectionSlug, unitSlug]);

  useEffect(() => {
    if (!activeEntry) {
      return;
    }

    speakWord(activeEntry.word);
  }, [activeEntry]);

  useEffect(() => {
    if (dialogues.length === 0) {
      if (dialogueSelections.length) {
        setDialogueSelections([]);
      }
      if (dialogueIndex !== 0) {
        setDialogueIndex(0);
      }
      return;
    }

    if (dialogueIndex >= dialogues.length) {
      setDialogueIndex(0);
      setDialogueSelections(Array(dialogues[0].answers.length).fill(null));
    }
  }, [dialogueIndex, dialogueSelections.length, dialogues]);

  useEffect(() => {
    setFeedbackTone("neutral");
    setHintCount(0);
    setInputValue("");
  }, [activeEntry?.id]);

  useEffect(() => {
    if (phase !== "practice") {
      return;
    }

    const hasEntries = entries.length > 0;
    const allLearned = hasEntries
      ? entries.every((entry) => (stats[entry.id]?.correctCount ?? 0) > 0)
      : true;

    if (!allLearned) {
      return;
    }

    const hasMatchPairs = matchPages.some((page) => page.pairs.length > 0);

    if (hasMatchPairs) {
      setPhase("match");
      setFeedbackTone("neutral");
      setHintCount(0);
      setInputValue("");
      setMatchPageIndex(0);
      setSelectedLeft(null);
      setSelectedRight(null);
      return;
    }

    if (dialogues.length > 0) {
      startDialoguePhase(0);
      return;
    }

    if (!hasMarkedComplete) {
      setHasMarkedComplete(true);
      markMilestoneComplete(unitSlug, sectionSlug, milestone.id, setIsComplete);
      setFeedbackTone("correct");
    }
  }, [
    dialogues.length,
    entries,
    hasMarkedComplete,
    matchPages,
    milestone.id,
    phase,
    sectionSlug,
    startDialoguePhase,
    stats,
    unitSlug,
  ]);

  useEffect(() => {
    if (phase !== "match") {
      return;
    }

    const currentPage = matchPages[matchPageIndex];
    if (!currentPage) {
      return;
    }

    if (
      currentPage.pairs.length === 0 ||
      currentPage.matched.length !== currentPage.pairs.length
    ) {
      return;
    }

    if (matchPageIndex >= matchPages.length - 1) {
      return;
    }

    if (advanceTimeout.current) {
      return;
    }

    advanceTimeout.current = setTimeout(() => {
      setMatchPageIndex((prev) => Math.min(prev + 1, matchPages.length - 1));
      setSelectedLeft(null);
      setSelectedRight(null);
      setFeedbackTone("neutral");
      advanceTimeout.current = null;
    }, 600);
  }, [matchPageIndex, matchPages, phase]);

  useEffect(() => {
    if (phase !== "match") {
      return;
    }

    const hasPairs = matchPages.some((page) => page.pairs.length > 0);

    if (!hasPairs) {
      if (dialogues.length > 0) {
        startDialoguePhase(0);
      } else if (!hasMarkedComplete) {
        setHasMarkedComplete(true);
        markMilestoneComplete(unitSlug, sectionSlug, milestone.id, setIsComplete);
        setFeedbackTone("correct");
      }
      return;
    }

    const allMatched = matchPages.every(
      (page) =>
        page.pairs.length === 0 || page.matched.length === page.pairs.length
    );

    if (!allMatched) {
      return;
    }

    if (dialogues.length > 0) {
      startDialoguePhase(0);
      return;
    }

    if (!hasMarkedComplete) {
      setHasMarkedComplete(true);
      markMilestoneComplete(unitSlug, sectionSlug, milestone.id, setIsComplete);
      setFeedbackTone("correct");
    }
  }, [
    dialogues.length,
    hasMarkedComplete,
    matchPages,
    milestone.id,
    phase,
    sectionSlug,
    startDialoguePhase,
    unitSlug,
  ]);

  useEffect(() => {
    return () => {
      if (mismatchTimeout.current) {
        clearTimeout(mismatchTimeout.current);
      }
      if (advanceTimeout.current) {
        clearTimeout(advanceTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!dialogues.length) {
      return;
    }

    const allCompleted = dialogues.every((dialogue) =>
      completedDialogues.includes(dialogue.id)
    );

    if (!allCompleted || hasMarkedComplete) {
      return;
    }

    setHasMarkedComplete(true);
    markMilestoneComplete(unitSlug, sectionSlug, milestone.id, setIsComplete);
    setFeedbackTone("correct");
  }, [
    completedDialogues,
    dialogues,
    hasMarkedComplete,
    milestone.id,
    sectionSlug,
    unitSlug,
  ]);

  const handleSelectCard = (side: "left" | "right", id: string) => {
    const page = currentMatchPage;
    if (!page) {
      return;
    }

    if (page.matched.includes(id)) {
      return;
    }

    const newLeft =
      side === "left" ? (selectedLeft === id ? null : id) : selectedLeft;
    const newRight =
      side === "right" ? (selectedRight === id ? null : id) : selectedRight;

    setSelectedLeft(newLeft);
    setSelectedRight(newRight);
    setFeedbackTone("neutral");

    if (mismatchTimeout.current) {
      clearTimeout(mismatchTimeout.current);
      mismatchTimeout.current = null;
    }

    if (newLeft && newRight) {
      if (newLeft === newRight) {
        const updatedPages = matchPages.map((matchPage, index) => {
          if (index !== matchPageIndex) {
            return matchPage;
          }
          if (matchPage.matched.includes(newLeft)) {
            return matchPage;
          }
          return {
            ...matchPage,
            matched: [...matchPage.matched, newLeft],
          };
        });
        setMatchPages(updatedPages);
        setSelectedLeft(null);
        setSelectedRight(null);
        setFeedbackTone("correct");
      } else {
        setFeedbackTone("incorrect");
        mismatchTimeout.current = setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setFeedbackTone("neutral");
          mismatchTimeout.current = null;
        }, 800);
      }
    }
  };

  const handleAdvanceLearn = () => {
    setFeedbackTone("neutral");

    if (activeIndex + 1 < entries.length) {
      setActiveIndex((index) => index + 1);
      return;
    }

    setPhase("practice");
    const firstPendingIndex = entries.findIndex(
      (entry) => (stats[entry.id]?.correctCount ?? 0) === 0
    );
    setActiveIndex(firstPendingIndex >= 0 ? firstPendingIndex : 0);
    setInputValue("");
  };

  const handleSubmitPractice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const currentEntry = activeEntry;
    if (!currentEntry) {
      return;
    }

    const guessRaw = inputValue.trim();
    const expectedRaw = currentEntry.word;

    const normalizedGuess = normalize(guessRaw);
    const normalizedExpected = normalize(expectedRaw);

    if (normalizedGuess === normalizedExpected) {
      setFeedbackTone("correct");
      setHintCount(0);
      setError(null);

      try {
        const response = await fetch(
          `/api/vocabulary/${currentEntry.id}/attempt`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              result: "correct",
              sectionId,
              milestoneId: milestone.id,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Sonuç kaydedilemedi.");
        }

        const data = await response.json();
        const nextStat: StatRecord = data.stat ?? defaultStat;

        setStats((previous) => {
          const updated = {
            ...previous,
            [currentEntry.id]: nextStat,
          };

          const pending = entries.filter(
            (entry) => (updated[entry.id]?.correctCount ?? 0) === 0
          );

          if (pending.length > 0) {
            const nextEntryId = pending[0].id;
            const nextIndex = entries.findIndex(
              (entry) => entry.id === nextEntryId
            );
            if (nextIndex >= 0) {
              setActiveIndex(nextIndex);
            }
          }

          return updated;
        });
      } catch (err) {
        setError((err as Error).message);
      }

      setInputValue("");
      return;
    }

    const expectedLower = expectedRaw.toLowerCase();
    const guessLower = guessRaw.toLowerCase();
    const collapsedExpected = expectedLower.replace(/\s+/g, "");
    const collapsedGuess = guessLower.replace(/\s+/g, "");

    const spacingMismatch =
      expectedLower !== guessLower && collapsedExpected === collapsedGuess;

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
      setFeedbackTone("almost");
      return;
    }

    setFeedbackTone("incorrect");
    setHintCount(0);
    setError(null);

    try {
      const response = await fetch(
        `/api/vocabulary/${currentEntry.id}/attempt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            result: "incorrect",
            sectionId,
            milestoneId: milestone.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Sonuç kaydedilemedi.");
      }

      const data = await response.json();
      const nextStat: StatRecord = data.stat ?? defaultStat;

      setStats((previous) => ({
        ...previous,
        [currentEntry.id]: nextStat,
      }));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const circleClassName =
    feedbackTone === "correct"
      ? "h-6 w-6 rounded-full border border-emerald-500 bg-emerald-500 transition-colors"
      : feedbackTone === "incorrect"
      ? "h-6 w-6 rounded-full border border-red-500 bg-red-500 transition-colors"
      : feedbackTone === "almost"
      ? "h-6 w-6 rounded-full border border-amber-400 bg-amber-400 transition-colors"
      : "h-6 w-6 rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] transition-colors";

  const correctionContent = useMemo(() => {
    if (!activeEntry || feedbackTone !== "almost") {
      return null;
    }

    const expected = activeEntry.word;
    const guess = inputValue;

    if (!expected || !guess) {
      return null;
    }

    const expectedChars = Array.from(expected);
    const guessChars = Array.from(guess);
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
      return expected;
    }

    const before = expected.slice(0, mismatchIndex);
    const highlightChar = expectedChars[mismatchIndex] ?? "";
    const after = expected.slice(mismatchIndex + 1);

    return (
      <span className="text-[var(--color-accent-soft)]">
        {before}
        <span className="underline decoration-current underline-offset-4">
          {highlightChar}
        </span>
        {after}
      </span>
    );
  }, [activeEntry, feedbackTone, inputValue]);

  const isHintAvailable =
    phase === "practice"
      ? Boolean(
          activeEntry && feedbackTone !== "correct" && hintCount < answerLength
        )
      : phase === "match"
        ? Boolean(
            currentMatchPage &&
              currentMatchPage.matched.length < currentMatchPage.pairs.length
          )
      : phase === "dialogue"
      ? Boolean(
          currentDialogue &&
            !isDialogueCompleted &&
            (hasIncompleteDialogueSlot || hasDialogueMismatch)
        )
      : false;

  const revealHint = () => {
    if (phase === "practice") {
      if (!activeEntry) {
        return;
      }

      const nextValue = Math.min(hintCount + 1, answerLength);
      if (nextValue === hintCount) {
        return;
      }

      setHintCount(nextValue);
      setInputValue(activeEntry.word.slice(0, nextValue));
      setFeedbackTone("neutral");
      return;
    }

    if (phase === "match") {
      const page = currentMatchPage;
      if (!page) {
        return;
      }

      const unmatched = page.pairs.filter(
        (pair) => !page.matched.includes(pair.id)
      );

      if (!unmatched.length) {
        return;
      }

      const target = unmatched[0];
      const updatedPages = matchPages.map((matchPage, index) => {
        if (index !== matchPageIndex) {
          return matchPage;
        }

        if (matchPage.matched.includes(target.id)) {
          return matchPage;
        }

        return {
          ...matchPage,
          matched: [...matchPage.matched, target.id],
        };
      });

      setMatchPages(updatedPages);
      setSelectedLeft(null);
      setSelectedRight(null);
      setFeedbackTone("correct");
      return;
    }

    if (phase === "dialogue") {
      const dialogue = currentDialogue;
      if (!dialogue || isDialogueCompleted) {
        return;
      }

      const next = [...dialogueSelections];
      let updated = false;

      for (let index = 0; index < dialogue.answers.length; index += 1) {
        const expected = dialogue.answers[index] ?? "";
        const currentValue = next[index];

        if (currentValue === null) {
          next[index] = expected;
          updated = true;
          break;
        }

        if (normalize(currentValue ?? "") !== normalize(expected)) {
          next[index] = expected;
          updated = true;
          break;
        }
      }

      if (updated) {
        setDialogueSelections(next);
        setFeedbackTone("neutral");
      }
    }
  };

  const insertCharacter = (character: string) => {
    setInputValue((prev) => prev + character);
  };

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setFeedbackTone("neutral");
  };


  let stageContent: ReactNode;

  if (entries.length === 0) {
    stageContent = (
      <div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-10 text-center text-sm text-[var(--color-muted)]">
        {isLoading
          ? "Kelime listesi yükleniyor..."
          : "Bu milestone için henüz kelime eklenmedi. Yeni kelimeler eklendiğinde burada göreceksin."}
      </div>
    );
  } else if (phase === "learn" && activeEntry) {
    stageContent = (
      <div className="space-y-6 text-center">
        <h4 className="text-4xl font-semibold text-[var(--color-fg)]">
          {activeEntry.word}
        </h4>

        <div className="space-y-2 text-sm text-[var(--color-muted)]">
          {activeEntry.translations.map((translation) => (
            <div
              key={`${activeEntry.id}-${translation.locale}`}
              className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3"
            >
              <span className="uppercase tracking-wide text-[var(--color-accent)]">
                {translation.locale}
              </span>
              <span>{translation.value}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <PronounceButton word={activeEntry.word} />
          <button
            type="button"
            onClick={handleAdvanceLearn}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {activeIndex + 1 < totalCount ? "Sonraki kelime" : "Pratiğe geç"}
          </button>
        </div>
      </div>
    );
  } else if (phase === "practice" && activeEntry) {
    stageContent = (
      <div className="space-y-6">
        <div className="space-y-2 text-sm text-[var(--color-muted)]">
          {activeEntry.translations.map((translation) => (
            <div
              key={`${activeEntry.id}-${translation.locale}`}
              className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3"
            >
              <span className="uppercase tracking-wide text-[var(--color-accent)]">
                {translation.locale}
              </span>
              <span>{translation.value}</span>
            </div>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleSubmitPractice}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={inputValue}
                onChange={onChangeInput}
                placeholder="Almanca kelimeyi yaz"
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

              {feedbackTone === "almost" && correctionContent ? (
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  {correctionContent}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <PronounceButton word={activeEntry.word} />
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
                className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                disabled={isLoading}
              >
                Kontrol et
              </button>
            </div>
          </div>
        </form>

        {remainingForPractice.length === 0 ? (
          <p className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-muted)]">
            Tüm kelimeleri başarıyla tamamladın. Dilersen tekrar dinleyip
            pekiştirebilirsin.
          </p>
        ) : null}
      </div>
    );
  } else if (phase === "match" && currentMatchPage) {
    stageContent = (
      <div className="space-y-6">
        <div className="flex flex-col items-start gap-2 text-sm text-[var(--color-muted)] md:flex-row md:items-center md:justify-between">
          <p>İngilizce ve Türkçe ipuçlarını Almanca kartlarla eşleştir.</p>
          {totalMatchPages > 1 ? (
            <span className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs uppercase tracking-wide text-[var(--color-accent)]">
              Sayfa {matchPageIndex + 1} / {totalMatchPages}
            </span>
          ) : null}
        </div>

        {currentMatchPage.pairs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-10 text-center text-sm text-[var(--color-muted)]">
            Bu sayfa için eşleştirme bulunmuyor.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              {currentMatchPage.leftOrder.map((id) => {
                const pair = currentMatchPage.pairs.find(
                  (item) => item.id === id
                );
                if (!pair) {
                  return null;
                }

                const isMatched = currentMatchedSet.has(id);
                const isSelected = selectedLeft === id;
                const isMismatch =
                  feedbackTone === "incorrect" &&
                  (selectedLeft === id || selectedRight === id);

                let className =
                  "w-full rounded-2xl border px-4 py-3 text-left text-sm transition";
                if (isMatched) {
                  className +=
                    " border-[var(--color-line)] bg-[var(--color-bg)] text-[var(--color-fg)] opacity-60";
                } else if (isMismatch) {
                  className +=
                    " border-red-400 bg-[var(--color-bg)] text-[var(--color-fg)]";
                } else if (isSelected) {
                  className +=
                    " border-[var(--color-accent)] bg-[var(--color-bg)] text-[var(--color-fg)]";
                } else {
                  className +=
                    " border-[var(--color-line)] bg-[var(--color-bg)] text-[var(--color-fg)] hover:border-[var(--color-accent)]";
                }

                const english = pair.translations.find(
                  (translation) => translation.locale?.toLowerCase() === "en"
                )?.value;
                const turkish = pair.translations.find(
                  (translation) => translation.locale?.toLowerCase() === "tr"
                )?.value;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectCard("left", id)}
                    className={`${className} min-h-[104px]`}
                    disabled={isMatched}
                  >
                    <div className="flex flex-col gap-1 text-left">
                      {english ? (
                        <span className="text-[var(--color-fg)]">
                          EN: <span className="font-medium">{english}</span>
                        </span>
                      ) : null}
                      {turkish ? (
                        <span className="text-[var(--color-fg)]">
                          TR: <span className="font-medium">{turkish}</span>
                        </span>
                      ) : null}
                      {!english && !turkish ? (
                        <span className="text-[var(--color-muted)]">
                          {formatTranslation(pair)}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              {currentMatchPage.rightOrder.map((id) => {
                const pair = currentMatchPage.pairs.find(
                  (item) => item.id === id
                );
                if (!pair) {
                  return null;
                }

                const isMatched = currentMatchedSet.has(id);
                const isSelected = selectedRight === id;
                const isMismatch =
                  feedbackTone === "incorrect" &&
                  (selectedLeft === id || selectedRight === id);

                let className =
                  "w-full rounded-2xl border px-4 py-3 text-left text-sm transition";
                if (isMatched) {
                  className +=
                    " border-[var(--color-line)] bg-[var(--color-bg)] text-[var(--color-fg)] opacity-60";
                } else if (isMismatch) {
                  className +=
                    " border-red-400 bg-[var(--color-bg)] text-[var(--color-fg)]";
                } else if (isSelected) {
                  className +=
                    " border-[var(--color-accent)] bg-[var(--color-bg)] text-[var(--color-fg)]";
                } else {
                  className +=
                    " border-[var(--color-line)] bg-[var(--color-bg)] text-[var(--color-fg)] hover:border-[var(--color-accent)]";
                }

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectCard("right", id)}
                    className={`${className} min-h-[104px]`}
                    disabled={isMatched}
                  >
                    <span className="font-semibold text-[var(--color-fg)]">
                      {pair.word}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  } else if (phase === "dialogue" && currentDialogue) {
    const answerLimits = currentDialogue.answers.reduce<Record<string, number>>(
      (acc, answer) => {
        acc[answer] = (acc[answer] ?? 0) + 1;
        return acc;
      },
      {}
    );
    const slots =
      dialogueSelections.length === currentDialogue.answers.length
        ? dialogueSelections
        : Array(currentDialogue.answers.length).fill(null);
    const selectionCounts = slots.reduce<Record<string, number>>(
      (acc, value) => {
        if (value) {
          acc[value] = (acc[value] ?? 0) + 1;
        }
        return acc;
      },
      {}
    );

    const isSubmitDisabled =
      !currentDialogue.answers.length ||
      isDialogueCompleted ||
      slots.some((value) => value === null);
    const isResetDisabled =
      isDialogueCompleted || slots.every((value) => value === null);

    stageContent = (
      <div className="space-y-6">
        <div className="space-y-3">
          {currentDialogue.lines.map((line, index) => (
            <div
              key={`${currentDialogue.id}-line-${index}`}
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-left"
            >
              {line.speaker ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                  {line.speaker}
                </p>
              ) : null}
              <p className="text-sm text-[var(--color-fg)]">{line.text}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {slots.map((value, index) => {
              const expected = currentDialogue.answers[index] ?? "";
              const isFilled = value !== null;
              const isMismatch =
                value !== null && normalize(value) !== normalize(expected);

              let className =
                "rounded-full border px-4 py-2 text-sm transition";
              if (isDialogueCompleted) {
                className += " border-[var(--color-line)] opacity-60";
              } else if (isMismatch) {
                className += " border-red-400";
              } else if (isFilled) {
                className += " border-[var(--color-accent)]";
              } else {
                className += " border-[var(--color-line)] text-[var(--color-muted)]";
              }

              return (
                <button
                  key={`${currentDialogue.id}-slot-${index}`}
                  type="button"
                  onClick={() => handleDialogueSlotClear(index)}
                  className={`${className} bg-[var(--color-bg)] text-left`}
                  disabled={!isFilled || isDialogueCompleted}
                >
                  {value ?? `Boş ${index + 1}`}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {currentDialogue.options.map((option, index) => {
              const usageCount = selectionCounts[option] ?? 0;
              const maxCount = answerLimits[option] ?? 0;
              const isUsed =
                maxCount > 0
                  ? usageCount >= maxCount
                  : dialogueSelections.includes(option);
              const isDisabled = isDialogueCompleted || isUsed;

              return (
                <button
                  key={`${currentDialogue.id}-option-${index}`}
                  type="button"
                  onClick={() => handleDialogueOptionSelect(option)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    isDisabled
                      ? "border-[var(--color-line)] opacity-60"
                      : "border-[var(--color-line)] hover:border-[var(--color-accent)]"
                  }`}
                  disabled={isDisabled}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
            type="button"
            onClick={handleDialogueReset}
            disabled={isResetDisabled}
            className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm transition hover:border-[var(--color-accent)] disabled:opacity-50"
          >
            Temizle
          </button>
          <button
            type="button"
            onClick={handleDialogueSubmit}
            disabled={isSubmitDisabled}
            className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Kontrol et
          </button>
        </div>
      </div>
    );
  } else {
    stageContent = null;
  }

  return (
    <article className="space-y-6 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Milestone
          </p>
          <h3 className="text-2xl font-[var(--font-display)] text-[var(--color-fg)]">
            {milestone.title}
          </h3>
          <p className="text-sm text-[var(--color-muted)]">
            {milestone.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: "rgba(76, 201, 240, 0.12)",
              color: "var(--color-fg)",
            }}
          >
            {learnedCount}/{totalCount}
          </span>
        </div>
      </header>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="space-y-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[var(--color-muted)]">
            <span>{progressLabel}</span>
            {isComplete ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
                Tamamlandı
              </span>
            ) : isLoading ? (
              <span>Veriler güncelleniyor...</span>
            ) : null}
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--color-line)]/50">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all"
              style={{ width: `${displayedProgress * 100}%` }}
            />
          </div>
        </div>

        {stageContent}
      </div>
    </article>
  );
}

function speakWord(word: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "de-DE";
  window.speechSynthesis.speak(utterance);
}

async function markMilestoneComplete(
  unitSlug: string,
  sectionSlug: string,
  milestoneId: string,
  onComplete: (flag: boolean) => void
) {
  try {
    const response = await fetch(
      `/api/sections/${unitSlug}/${sectionSlug}/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ milestoneId }),
      }
    );

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const isComplete =
      data.progress?.completedMilestones?.includes(milestoneId);
    if (isComplete) {
      onComplete(true);
    }
  } catch {
    // Sessizce yoksay: tamamlanma çağrısının tekrarı UI durumunu bozmayacak.
  }
}
