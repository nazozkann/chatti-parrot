import { NextRequest, NextResponse } from "next/server";

import {
  buildChatPrompt,
  type ChatHistoryEntry,
  type ChatLevel,
} from "@/app/lib/ai/chatPrompt";

const HF_CHAT_MODEL =
  process.env.HF_CHAT_MODEL ?? "meta-llama/Meta-Llama-3-8B-Instruct";
const HF_API_URL =
  process.env.HF_API_URL ??
  `https://api-inference.huggingface.co/models/${HF_CHAT_MODEL}`;
const HF_API_KEY = process.env.HF_API_KEY;

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
    if (typeof content !== "string") continue;
    normalised.push({ role, content });
  }
  return normalised;
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

    const prompt = buildChatPrompt({
      level,
      poolWords,
      history,
    });

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 160,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
        },
      }),
    });

    if (!response.ok) {
      const rawError = await response.text();
      let detail = rawError;
      try {
        const parsed = JSON.parse(rawError) as { error?: unknown };
        const candidate = parsed.error;
        if (typeof candidate === "string") {
          detail = candidate;
        }
      } catch {
        // no-op: rawError already contains text payload
      }

      const message = `AI yanıtı alınamadı (HF ${response.status}).`;
      console.error("HF request failed", response.status, detail);
      return NextResponse.json(
        {
          error: message,
          detail,
          status: response.status,
        },
        { status: 502 },
      );
    }

    const data = await response.json();

    let reply = "";
    if (Array.isArray(data) && data.length > 0) {
      reply = (data[0]?.generated_text as string | undefined) ?? "";
    }
    if (!reply && data?.generated_text) {
      reply = String(data.generated_text);
    }
    if (!reply && Array.isArray(data?.choices)) {
      const choice = data.choices[0];
      const content = choice?.message?.content ?? choice?.text;
      if (typeof content === "string") {
        reply = content;
      }
    }

    reply = reply.trim();

    if (!reply) {
      reply =
        "Üzgünüm, şu anda cevap veremedim. Lütfen yeniden denemeyi dener misin?";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI chat endpoint failed", error);
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu." },
      { status: 500 },
    );
  }
}
