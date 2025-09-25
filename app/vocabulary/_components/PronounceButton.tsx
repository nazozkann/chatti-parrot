"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Volume2 } from "lucide-react";

type PronounceButtonProps = {
  word: string;
  lang?: string;
};

const PREFERRED_GERMAN_VOICES = [
  "Anna",
  "Helena",
  "Maria",
  "Markus",
  "Petra",
  "Yannick",
];

export function PronounceButton({ word, lang = "de-DE" }: PronounceButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    function populateVoices() {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
      }
    }

    populateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", populateVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", populateVoices);
    };
  }, []);

  const matchedVoice = useMemo(() => {
    if (!voices.length) return undefined;
    const normalizedLang = lang.toLowerCase();

    const exact = voices.find((voice) => voice.lang?.toLowerCase() === normalizedLang);
    const localized = voices.find((voice) =>
      voice.lang?.toLowerCase().startsWith(normalizedLang.split("-")[0])
    );

    const prioritized = voices.find((voice) => {
      if (!voice.lang?.toLowerCase().startsWith("de")) return false;
      return PREFERRED_GERMAN_VOICES.some((name) =>
        voice.name.toLowerCase().includes(name.toLowerCase())
      );
    });

    return prioritized ?? exact ?? localized;
  }, [lang, voices]);

  const handleClick = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech synthesis is not supported in this browser.");
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang;
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.rate = 0.9;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synth.speak(utterance);
  }, [lang, matchedVoice, word]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Play pronunciation for ${word}`}
      className="rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] p-1 text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-none focus-visible:ring focus-visible:ring-[var(--color-accent)]/50"
      title="Play pronunciation"
    >
      <Volume2 className={`h-4 w-4 ${speaking ? "animate-pulse" : ""}`} />
    </button>
  );
}
