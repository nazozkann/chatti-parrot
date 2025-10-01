import { NextRequest, NextResponse } from "next/server";

import { getWordTranslations } from "@/app/lib/services/translations";

const MAX_TEXT_LENGTH = 64;

function normalizeInput(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { text } = (await request.json()) as { text?: string };
    const word = normalizeInput(text);

    if (!word) {
      return NextResponse.json(
        { error: "Kelime gerekli." },
        { status: 400 },
      );
    }

    if (word.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "Kelime çok uzun. Lütfen daha kısa bir kelime deneyin." },
        { status: 400 },
      );
    }

    const translations = await getWordTranslations(word);

    return NextResponse.json({
      english: translations.en,
      turkish: translations.tr,
    });
  } catch (error) {
    console.error("Translation request failed", error);
    return NextResponse.json(
      { error: "Üzgünüz, çeviri alınamadı." },
      { status: 500 },
    );
  }
}
