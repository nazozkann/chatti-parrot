"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

type ChatLevel = "A1" | "A2" | "B1" | "B2";
type Message = { id: string; role: "user" | "assistant"; content: string };
type SendState = "idle" | "loading" | "error";

const LEVEL_OPTIONS: ChatLevel[] = ["A1", "A2", "B1", "B2"];

function createInitialMessages(level: ChatLevel): Message[] {
  return [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        level === "A1" || level === "A2"
          ? "Merhaba! Gemini ile Almanca pratik yapmaya hazır mısın? Kısa cümlelerle başlayalım. Bana gününün nasıl geçtiğini anlat!"
          : "Selam! Gemini destekli Almanca sohbetimize hoş geldin. Bana bugün neler yaptığını kısaca anlat, oradan devam edelim!",
    },
  ];
}

export default function GermanPartnerPage() {
  const [level, setLevel] = useState<ChatLevel>("A1");
  const [poolInput, setPoolInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() =>
    createInitialMessages("A1")
  );
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<SendState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const poolWords = useMemo(
    () =>
      poolInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [poolInput]
  );

  const resetConversation = useCallback((nextLevel: ChatLevel) => {
    setMessages(createInitialMessages(nextLevel));
    setDraft("");
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleLevelChange = useCallback(
    (value: ChatLevel) => {
      setLevel(value);
      resetConversation(value);
    },
    [resetConversation]
  );

  const handleClear = useCallback(() => {
    resetConversation(level);
  }, [level, resetConversation]);

  const handleSubmit = useCallback(async () => {
    const text = draft.trim();
    if (!text || status === "loading") return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const history = [...messages, userMessage];
    setMessages(history);
    setDraft("");
    setStatus("loading");
    setErrorMessage(null);

    try {
      const payload = {
        message: text,
        history: history.map(({ role, content }) => ({ role, text: content })),
        level,
        poolWords,
      };

      const res = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg =
          errData?.error ||
          errData?.detail ||
          `AI yanıtı alınamadı. Kod: ${res.status}`;
        throw new Error(msg);
      }

      const data = (await res.json()) as { text?: string };
      const reply = (data?.text ?? "").trim();

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            reply ||
            "Üzgünüm, şu an cevap veremedim. Birazdan tekrar dener misin?",
        },
      ]);
      setStatus("idle");
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : "Beklenmeyen bir hata oluştu."
      );
      setStatus("error");
    }
  }, [draft, history, level, messages, poolWords, status]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (status !== "loading") void handleSubmit();
      }
    },
    [handleSubmit, status]
  );

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="space-y-4">
          <span className="inline-flex w-fit items-center rounded-full bg-[var(--color-bg)] px-4 py-1 text-xs uppercase tracking-wide text-[var(--color-accent)]">
            Gemini Chat Partner
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-[var(--font-display)] text-[var(--color-fg)]">
              Gemini ile Almanca sohbet pratiği
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
              Google Gemini modelini kullanarak seviyene uygun Almanca konuşma
              pratiği yap. Seviyeni seç, istersen kelime havuzu ekle ve
              konuşmaya başla.
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="gemini-chat-level"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
            >
              Seviye
            </label>
            <select
              id="gemini-chat-level"
              value={level}
              onChange={(e) => handleLevelChange(e.target.value as ChatLevel)}
              className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-fg)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
              disabled={status === "loading"}
            >
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 lg:col-span-2">
            <label
              htmlFor="gemini-chat-pool"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
            >
              Kelime havuzu (virgülle ayır)
            </label>
            <input
              id="gemini-chat-pool"
              value={poolInput}
              onChange={(e) => setPoolInput(e.target.value)}
              placeholder="ör. Schule, Freund, lernen"
              className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-fg)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
              disabled={status === "loading"}
            />
          </div>
        </div>

        <div
          ref={scrollRef}
          className="h-[480px] space-y-4 overflow-y-auto rounded-3xl border border-[var(--color-line)] bg-[var(--color-bg)] p-6"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={clsx(
                "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                m.role === "assistant"
                  ? "ml-auto bg-[var(--color-surface)] text-[var(--color-fg)]"
                  : "bg-[var(--color-muted-bg)] text-[var(--color-fg)]"
              )}
            >
              {m.content}
            </div>
          ))}
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-28 w-full resize-none rounded-3xl border border-[var(--color-line)] bg-[var(--color-bg)] px-5 py-4 text-sm text-[var(--color-fg)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
            placeholder="Mesajını yaz..."
            disabled={status === "loading"}
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              disabled={status === "loading"}
            >
              Sohbeti sıfırla
            </button>
            <button
              type="button"
              onClick={() => status !== "loading" && handleSubmit()}
              className="inline-flex items-center rounded-full bg-[var(--color-accent)] px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:opacity-90 disabled:opacity-60"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Gönderiliyor..." : "Gönder"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
