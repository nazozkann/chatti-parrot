"use client";

import {
  Fragment,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Volume2 } from "lucide-react";

import { INTERNAL_DICTIONARY } from "@/app/lib/data/internal-dictionary";
import { HoverWord } from "@/app/reading/_components/HoverWord";

import type {
  ListeningScenario,
  ListeningSegment,
} from "@/app/lib/data/listening-scenarios";

export type ListeningSessionProps = {
  scenario: ListeningScenario;
};

type RevealState = Record<string, boolean>;

function getStaticTranslation(word: string) {
  const entry = INTERNAL_DICTIONARY.get(word.trim().toLowerCase());
  if (!entry) return null;
  return {
    english: entry.english,
    turkish: entry.turkish,
  };
}

function renderTextWithHover(content: string, keyBase: string) {
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

function MaskedText({
  text,
  revealed,
  wordKey,
}: {
  text: string;
  revealed: boolean;
  wordKey: string;
}) {
  if (!revealed) {
    return (
      <span className="border-b border-dashed border-[var(--color-muted)] text-transparent">
        {text}
      </span>
    );
  }

  return <>{renderTextWithHover(text, wordKey)}</>;
}

export function ListeningSession({ scenario }: ListeningSessionProps) {
  const [started, setStarted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [unlockedIndex, setUnlockedIndex] = useState<number>(-1);
  const [revealed, setRevealed] = useState<RevealState>({});
  const [visibleCount, setVisibleCount] = useState(0);
  const [awaitingAdvance, setAwaitingAdvance] = useState(false);
  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previousVisibleRef = useRef(0);
  const nextButtonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
      setSpeechError("Tarayıcınız konuşma sentezini desteklemiyor.");
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const segments = useMemo(() => scenario.segments, [scenario.segments]);

  const scrollToViewport = useCallback(
    (
      element: HTMLElement,
      { anchor, offsetRatio }: { anchor: "top" | "bottom"; offsetRatio: number }
    ) => {
      if (typeof window === "undefined") return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const safeOffset = Math.min(Math.max(offsetRatio, 0), 1);

      let targetTop: number;
      if (anchor === "bottom") {
        const absoluteBottom = rect.bottom + window.scrollY;
        targetTop = absoluteBottom - viewportHeight * (1 - safeOffset);
      } else {
        const absoluteTop = rect.top + window.scrollY;
        targetTop = absoluteTop - viewportHeight * safeOffset;
      }

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth",
      });
    },
    []
  );

  useEffect(() => {
    if (visibleCount <= 0) {
      previousVisibleRef.current = visibleCount;
      return;
    }

    if (visibleCount > previousVisibleRef.current) {
      const lastIndex = Math.min(visibleCount - 1, segments.length - 1);
      const lastSegment = segments[lastIndex];
      if (lastSegment) {
        const node = segmentRefs.current[lastSegment.id];
        if (node) {
          scrollToViewport(node, { anchor: "top", offsetRatio: 0.3 });
        }
      }
    }

    previousVisibleRef.current = visibleCount;
  }, [scrollToViewport, segments, visibleCount]);

  useEffect(() => {
    if (!awaitingAdvance) return;
    if (!started) return;
    const node = nextButtonRef.current;
    if (!node) return;
    scrollToViewport(node, { anchor: "bottom", offsetRatio: 0.3 });
  }, [awaitingAdvance, scrollToViewport, started]);

  const playSegment = useCallback(
    (segment: ListeningSegment, index: number) => {
      if (!speechSupported) {
        setSpeechError("Tarayıcı konuşma sentezini desteklemiyor.");
        return;
      }

      if (typeof window === "undefined" || !window.speechSynthesis) {
        setSpeechError("Tarayıcı konuşma sentezi mevcut değil.");
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(segment.text);
        utterance.lang = "de-DE";
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onend = () => {
          setCurrentIndex(null);
          if (index + 1 < segments.length) {
            setAwaitingAdvance(true);
          }
        };
        utterance.onerror = () => {
          setCurrentIndex(null);
          setSpeechError("Ses oynatılırken bir hata oluştu.");
        };

        setCurrentIndex(index);
        setSpeechError(null);
        setAwaitingAdvance(false);
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Speech synthesis failed", error);
        setSpeechError("Ses oynatılamadı.");
      }
    },
    [segments.length, speechSupported]
  );

  const handleStart = useCallback(() => {
    setStarted(true);
    setUnlockedIndex(0);
    setRevealed({});
    setVisibleCount(1);
    setAwaitingAdvance(false);
    if (segments.length > 0) {
      playSegment(segments[0], 0);
    }
  }, [playSegment, segments]);

  const handleReset = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    segmentRefs.current = {};
    setStarted(false);
    setUnlockedIndex(-1);
    setCurrentIndex(null);
    setRevealed({});
    setSpeechError(null);
    setVisibleCount(0);
    setAwaitingAdvance(false);
  }, []);

  const handleSegmentClick = useCallback(
    (segment: ListeningSegment, index: number) => {
      if (!started) return;
      if (index > unlockedIndex) return;
      playSegment(segment, index);
    },
    [playSegment, started, unlockedIndex]
  );

  const toggleReveal = useCallback((segmentId: string) => {
    setRevealed((prev) => ({
      ...prev,
      [segmentId]: !prev[segmentId],
    }));
  }, []);

  const handleAdvance = useCallback(() => {
    if (!started) return;
    if (!awaitingAdvance) return;
    const nextIndex = visibleCount;
    if (nextIndex >= segments.length) {
      setAwaitingAdvance(false);
      return;
    }

    setVisibleCount((prev) => Math.min(prev + 1, segments.length));
    setUnlockedIndex(nextIndex);
    setAwaitingAdvance(false);
    playSegment(segments[nextIndex], nextIndex);
  }, [awaitingAdvance, playSegment, segments, started, visibleCount]);

  useEffect(() => {
    setUnlockedIndex((prev) => {
      const maxVisible = Math.max(visibleCount - 1, -1);
      return Math.max(prev, maxVisible);
    });
  }, [visibleCount]);

  return (
    <div className="space-y-6 mb-30">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleStart}
          disabled={!speechSupported || segments.length === 0}
          className="flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-muted)]"
        >
          ▶ Başlat
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-fg)]"
        >
          Sıfırla
        </button>
        <span className="text-xs text-[var(--color-muted)]">
          {started
            ? "Metinler tek tek açılıyor. Dinledikten sonra Sonraki butonuna tıklayın."
            : "Başlat’a tıklayın ve konuşmayı dinlemek için devam edin."}
        </span>
      </div>

      {speechError && (
        <p className="rounded-2xl border border-[var(--color-accent)]/60 bg-[var(--color-accent)]/10 px-4 py-3 text-xs text-[var(--color-accent)]">
          {speechError}
        </p>
      )}

      <div className="space-y-4">
        {visibleCount === 0 && (
          <div className="rounded-3xl border border-dashed border-[var(--color-line)] bg-[var(--color-bg)] p-6 text-sm text-[var(--color-muted)]">
            Başlat’a tıkladığınızda ilk konuşma balonu görünür ve ses otomatik
            olarak çalar.
          </div>
        )}

        {segments.slice(0, visibleCount).map((segment, index) => {
          const isActive = started && index === unlockedIndex;
          const isCurrent = currentIndex === index;
          const isLocked = started && index > unlockedIndex;
          const isRevealed = revealed[segment.id] ?? false;
          const alignment =
            segment.type === "dialogue" && segment.direction === "right"
              ? "justify-end"
              : "justify-start";

          if (segment.type === "narration") {
            return (
              <div
                key={segment.id}
                className="flex justify-center"
                ref={(node) => {
                  segmentRefs.current[segment.id] = node;
                }}
              >
                <div className="w-full max-w-3xl space-y-3 rounded-3xl border border-[var(--color-line)] p-6 shadow-sm">
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed">
                      <MaskedText
                        text={segment.text}
                        revealed={isRevealed}
                        wordKey={`narration-${segment.id}`}
                      />
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleSegmentClick(segment, index)}
                      disabled={!started || isLocked}
                      className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)] transition disabled:cursor-not-allowed disabled:text-[var(--color-muted)]"
                    >
                      {isCurrent ? "Çalıyor..." : "Dinle"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleReveal(segment.id)}
                      className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)] underline"
                    >
                      {isRevealed ? "Gizle" : "Metni göster"}
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={segment.id}
              className={`flex ${alignment}`}
              ref={(node) => {
                segmentRefs.current[segment.id] = node;
              }}
            >
              <button
                type="button"
                onClick={() => handleSegmentClick(segment, index)}
                disabled={!started || isLocked}
                className={`group relative w-full max-w-xl rounded-3xl border border-[var(--color-line)]  p-5 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-70 ${
                  isActive ? "ring-2 ring-[var(--color-accent)]" : ""
                }`}
              >
                {segment.direction === "right" ? (
                  <span className="pointer-events-none absolute -right-3 top-8 hidden h-6 w-6 rotate-45 border-r border-t border-[var(--color-line)] bg-[var(--color-surface)] sm:block" />
                ) : (
                  <span className="pointer-events-none absolute -left-3 top-8 hidden h-6 w-6 rotate-45 border-b border-l border-[var(--color-line)] bg-[var(--color-surface)] sm:block" />
                )}

                <div className="space-y-3">
                  {segment.speaker && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                      {segment.speaker}
                    </span>
                  )}
                  <p className="text-sm leading-relaxed">
                    <MaskedText
                      text={segment.text}
                      revealed={isRevealed}
                      wordKey={`dialogue-${segment.id}`}
                    />
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-wide">
                  <span
                    className={`flex items-center gap-2 font-semibold ${
                      isCurrent
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-muted)]"
                    }`}
                  >
                    {isCurrent ? (
                      "Çalıyor"
                    ) : isLocked ? (
                      "Kilidi açılacak"
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Dinlemek için tıkla</span>
                      </>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleReveal(segment.id);
                    }}
                    className="text-[var(--color-muted)] underline"
                  >
                    {isRevealed ? "Gizle" : "Metni göster"}
                  </button>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {started && awaitingAdvance && visibleCount < segments.length && (
        <div className="flex justify-center" ref={nextButtonRef}>
          <button
            type="button"
            onClick={handleAdvance}
            className="rounded-full bg-[var(--color-accent)] px-6 py-2 text-sm font-semibold text-white shadow transition hover:opacity-90"
          >
            Sonraki
          </button>
        </div>
      )}

      {started &&
        !awaitingAdvance &&
        visibleCount < segments.length &&
        currentIndex === null && (
          <div className="flex justify-center">
            <span className="text-xs text-[var(--color-muted)]">
              Dinleme tamamlandığında Sonraki butonu aktif olur.
            </span>
          </div>
        )}
    </div>
  );
}
