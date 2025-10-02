import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

import {
  buildChatPrompt,
  type ChatHistoryEntry,
  type ChatLevel,
} from "@/app/lib/ai/chatPrompt";

const HF_API_KEY = process.env.HF_API_KEY ?? process.env.HF_TOKEN;
const HF_CHAT_MODEL =
  process.env.HF_CHAT_MODEL ?? "HuggingFaceH4/zephyr-7b-beta";
const HF_ROUTER_PROVIDER = process.env.HF_ROUTER_PROVIDER ?? "featherless-ai";
const HF_ROUTER_MODEL =
  process.env.HF_ROUTER_MODEL ?? `${HF_CHAT_MODEL}:${HF_ROUTER_PROVIDER}`;
const HF_ROUTER_BASE_URL =
  process.env.HF_ROUTER_BASE_URL ?? "https://router.huggingface.co/v1";

const SUPPORTED_LEVELS: ChatLevel[] = ["A1", "A2", "B1", "B2"];

function normalisePool(pool: unknown) {
  if (!Array.isArray(pool)) return [];
  return pool
    .map((item) =>
      typeof item === "string" ? item.trim() : String(item ?? "").trim(),
    )
    .filter(Boolean);
}

function normaliseHistory(payload: unknown): ChatHistoryEntry[] {
  if (!Array.isArray(payload)) return [];
  const normalised: ChatHistoryEntry[] = [];
  for (const entry of payload) {
    if (!entry || typeof entry !== "object") continue;
    const role = (entry as { role?: string }).role;
    const content = (entry as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string" || !content.trim()) continue;
    normalised.push({ role, content: content.trim() });
  }
  return normalised;
}

function convertHistoryToMessages(history: ChatHistoryEntry[]) {
  return history.map((item) => ({
    role: item.role,
    content: item.content,
  }));
}

function extractCompletionText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const choice = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choice) || choice.length === 0) return "";
  const message = choice[0]?.message as { content?: unknown } | undefined;
  const content = message?.content;
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .filter((part) =>
        part && typeof part === "object" && "type" in part
          ? (part as { type?: string }).type === "text"
          : false,
      )
      .map((part) =>
        typeof part === "object" && part && "text" in part
          ? String((part as { text?: unknown }).text ?? "")
          : "",
      )
      .join("");
  }
  return "";
}

function buildStatusHint(status: number): string {
  switch (status) {
    case 400:
      return "İstek yükü hatalı görünüyor. Mesaj geçmişini ve payload formatını kontrol edin.";
    case 401:
      return "Hugging Face Router API anahtarı geçersiz ya da eksik. `.env` dosyanızda `HF_API_KEY` veya `HF_TOKEN` değeri tanımlı ve Inference API yetkisine sahip olmalı.";
    case 403:
      return "Bu modele erişim izniniz olmayabilir. Model kartındaki koşulları kabul ettiğinizden emin olun.";
    case 404:
      return "Model adı veya sağlayıcı eşleşmedi. `HF_CHAT_MODEL`/`HF_ROUTER_MODEL` değerlerini ve seçilen inference provider'ı kontrol edin.";
    case 423:
      return "Model geçici olarak kilitli görünüyor. Bir süre sonra yeniden deneyin.";
    default:
      return "";
  }
}

function describeError(error: unknown) {
  if (!error || typeof error !== "object") {
    return { detail: String(error ?? ""), status: 500 };
  }

  const statusCandidate = (error as { status?: unknown }).status;
  const status = typeof statusCandidate === "number" ? statusCandidate : 500;

  const messageCandidate = (error as { message?: unknown }).message;
  const detail =
    typeof messageCandidate === "string" && messageCandidate.trim()
      ? messageCandidate
      : JSON.stringify(error);

  return { detail, status };
}

export async function POST(request: NextRequest) {
  try {
    if (!HF_API_KEY) {
      return NextResponse.json(
        { error: "HF API anahtarı bulunamadı." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      level?: string;
      poolWords?: unknown;
      history?: unknown;
    };

    const level = body.level?.toUpperCase() as ChatLevel | undefined;
    if (!level || !SUPPORTED_LEVELS.includes(level)) {
      return NextResponse.json(
        { error: "Geçerli bir seviye seçmelisiniz." },
        { status: 400 },
      );
    }

    const history = normaliseHistory(body.history);
    if (history.length === 0) {
      return NextResponse.json(
        { error: "Konuşma geçmişi boş olamaz." },
        { status: 400 },
      );
    }

    const poolWords = normalisePool(body.poolWords);
    const systemPrompt = buildChatPrompt({ level, poolWords });

    const client = new OpenAI({
      apiKey: HF_API_KEY,
      baseURL: HF_ROUTER_BASE_URL,
    });

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...convertHistoryToMessages(history),
    ];

    const completion = await client.chat.completions.create({
      model: HF_ROUTER_MODEL,
      messages,
      max_tokens: 160,
      temperature: 0.7,
      top_p: 0.9,
    });

    let reply = extractCompletionText(completion).trim();

    if (!reply) {
      reply =
        "Üzgünüm, şu anda cevap veremedim. Lütfen yeniden denemeyi dener misin?";
    }

    return NextResponse.json({
      reply,
      model: HF_ROUTER_MODEL,
      provider: HF_ROUTER_PROVIDER,
    });
  } catch (error) {
    const { detail, status } = describeError(error);
    const hint = buildStatusHint(status);
    const message = `AI yanıtı alınamadı (HF ${status}).`;
    console.error("HF router request failed", status, detail);
    return NextResponse.json(
      {
        error: message,
        detail,
        status,
        hint: hint || undefined,
      },
      { status: 502 },
    );
  }
}
