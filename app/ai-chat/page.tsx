"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";

import type { ChatHistoryEntry, ChatLevel } from "@/app/lib/ai/chatPrompt";

const LEVEL_OPTIONS: ChatLevel[] = ["A1", "A2", "B1", "B2"];

type Message = ChatHistoryEntry & { id: string };

type SendState = "idle" | "loading" | "error";

function createInitialMessages(level: ChatLevel): Message[] {
  return [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        level === "A1" || level === "A2"
          ? "Merhaba! Almanca pratik yapmaya hazır mısın? Kısa cümlelerle başlayalım. Bana gününün nasıl geçtiğini anlat!"
          : "Selam! Almanca konuşma pratiğine hazır mısın? Bana bugün neler yaptığını kısaca anlat, oradan devam edelim!",
    },
  ];
}

export default function AiChatPage() {
  const [level, setLevel] = useState<ChatLevel>("A1");
  const [poolInput, setPoolInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() =>
    createInitialMessages("A1"),
  );
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<SendState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const poolWords = useMemo(() => {
    return poolInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [poolInput]);

  const resetConversation = useCallback(
    (nextLevel: ChatLevel) => {
      setMessages(createInitialMessages(nextLevel));
      setDraft("");
      setErrorMessage(null);
    },
    [],
  );

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleLevelChange = useCallback(
    (value: ChatLevel) => {
      setLevel(value);
      resetConversation(value);
    },
    [resetConversation],
  );

  const handleClear = useCallback(() => {
    resetConversation(level);
  }, [level, resetConversation]);

  const handleSubmit = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const history: Message[] = [...messages, userMessage];
    setMessages(history);
    setDraft("");
    setStatus("loading");
    setErrorMessage(null);

    try {
      const payload = {
        level,
        poolWords,
        history: history.map(({ role, content }) => ({ role, content })),
      };

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = (await response
          .json()
          .catch(() => ({ error: "", detail: "" }))) as {
          error?: string;
          detail?: string;
        };
        const message = [errorPayload.error, errorPayload.detail]
          .filter(Boolean)
          .join(" — ")
          .trim();
        throw new Error(message || "AI yanıtı alınamadı.");
      }

      const data = (await response.json()) as { reply: string };
      const reply = data.reply?.trim() || "";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply ||
            "Üzgünüm, şu an cevap veremedim. Birazdan tekrar dener misin?",
        },
      ]);
      setStatus("idle");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Beklenmeyen bir hata oluştu.";
      setErrorMessage(message);
      setStatus("error");
    }
  }, [draft, level, messages, poolWords]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (status !== "loading") {
          void handleSubmit();
        }
      }
    },
    [handleSubmit, status],
  );

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-sm">
        <div className="space-y-4">
          <span className="inline-flex w-fit items-center rounded-full bg-[var(--color-bg)] px-4 py-1 text-xs uppercase tracking-wide text-[var(--color-accent)]">
            AI Chat Partner
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-[var(--font-display)] text-[var(--color-fg)]">
              Seviyene uygun Almanca konuşma partneri
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
              Seviyeni seç, istersen kelime havuzu ekle ve Almanca konuşmaya başla. Yapay zekâ yakında yanıtlarını değerlendirecek ve düzeltmeler sunacak.
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="chat-level"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
            >
              Seviye
            </label>
            <select
              id="chat-level"
              value={level}
              onChange={(event) => handleLevelChange(event.target.value as ChatLevel)}
              className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-fg)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
              disabled={status === "loading"}
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 lg:col-span-2">
            <label
              htmlFor="chat-pool"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
            >
              Kelime havuzu (virgülle ayır)
            </label>
            <input
              id="chat-pool"
              value={poolInput}
              onChange={(event) => setPoolInput(event.target.value)}
              placeholder="ör. Frühstück, Termin, Gespräch"
              className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-2 text-sm text-[var(--color-fg)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
            {poolWords.length > 0 && (
              <span>
                Kelimeler: <strong>{poolWords.join(", ")}</strong>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] underline"
            disabled={status === "loading"}
          >
            Konuşmayı sıfırla
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-sm">
        <div
          ref={scrollRef}
          className="max-h-[520px] space-y-4 overflow-y-auto p-6"
        >
          {messages.map((message) => (
            <div key={message.id} className="flex">
              <div
                className={clsx(
                  "max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                  message.role === "assistant"
                    ? "ml-0 bg-[var(--color-bg)] text-[var(--color-fg)]"
                    : "ml-auto bg-[var(--color-accent)]/90 text-white",
                )}
              >
                <p>{message.content}</p>
              </div>
            </div>
          ))}
        </div>
        {errorMessage ? (
          <div className="border-t border-[var(--color-line)] bg-[var(--color-accent)]/10 p-4 text-sm text-[var(--color-accent)]">
            {errorMessage}
          </div>
        ) : null}
        <div className="border-t border-[var(--color-line)] p-6">
          <div className="space-y-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Almanca mesajını buraya yaz ve Enter'a bas (Shift + Enter yeni satır)."
              className="min-h-[120px] w-full resize-none rounded-3xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4 text-sm text-[var(--color-fg)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
              disabled={status === "loading"}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-muted)]">
                Enter ile gönder, Shift + Enter ile satır ekle.
              </span>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={status === "loading" || draft.trim().length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-muted)]"
              >
                {status === "loading" ? "Yanıt bekleniyor…" : "Gönder"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
