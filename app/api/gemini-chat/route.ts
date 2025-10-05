import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type Level = "A1" | "A2" | "B1" | "B2";

const LEVEL_RULES: Record<Level, { lines: string[]; examples: string[] }> = {
  A1: {
    lines: [
      "Kısa ve çok basit cümleler kur.",
      "Günlük kelimeler kullan. Karmaşık zamanlar ve yan cümlelerden kaçın.",
      "Cevap boyutu: 1-2 cümle.",
    ],
    examples: ["Heute war ich müde. Ich habe zu Hause gearbeitet."],
  },
  A2: {
    lines: [
      "Basit cümleler, bazen 'weil/aber' gibi kolay bağlaçlar.",
      "Geniş zaman ve Perfekt düzeyinde kal.",
      "Cevap boyutu: 3-4 cümle.",
    ],
    examples: [
      "Heute war ein normaler Tag. Ich habe im Büro gearbeitet, weil wir eine Deadline haben. Am Abend treffe ich meine Freunde.",
    ],
  },
  B1: {
    lines: [
      "Akıcı ama basit; gerekirse yan cümle kullan.",
      "Deneyim ve planları kısa anlat. Modalverben/Perfekt/Präteritum karışımı olabilir.",
      "Cevap boyutu: 4–6 cümle.",
    ],
    examples: [
      "Heute hatte ich viel zu tun, weil wir ein neues Projekt starten. Ich habe viele E-Mails geschrieben und ein Meeting vorbereitet. Morgen möchte ich früher anfangen, damit ich pünktlich fertig werde.",
    ],
  },
  B2: {
    lines: [
      "Daha zengin kelime ve bağlaçlar, ancak ders kitabı gibi olmasın.",
      "Kısa argüman/karşılaştırma yapabilirsin; yine de çok uzun yazma.",
      "Cevap boyutu: 5–8 cümle.",
    ],
    examples: [
      "Heute war ein produktiver Tag. Ich habe an einer komplexen Aufgabe gearbeitet, die mehr Planung erforderte. Einerseits war es anstrengend, andererseits habe ich viel gelernt. Morgen möchte ich die Ergebnisse mit meinem Team diskutieren.",
    ],
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      level = "A1",
      poolWords = [],
    } = body as {
      message: string;
      history: Array<{
        role: "user" | "assistant";
        text?: string;
        content?: string;
      }>;
      level?: Level;
      poolWords?: string[];
    };

    const guide = LEVEL_RULES[level as Level] ?? LEVEL_RULES.A2;
    const vocabHint =
      Array.isArray(poolWords) && poolWords.length
        ? `Versuche gelegentlich diese Wörter sinnvoll zu nutzen: ${poolWords
            .slice(0, 12)
            .join(", ")}.`
        : "";

    const systemInstruction = {
      parts: [
        {
          text: `
sen sana yazan kişinin seviyesine göre cevap veren bir konuşma partnerisin. Almanca olarak cevapla. Yapay zeka gibi değil bir kişiymişsin gibi davran yani yaşın ismin memleketin filan olsun.
- ${guide.lines.join(" ")}

${vocabHint}

Beispielantwort (${level}):
"${guide.examples[0]}"
`.trim(),
        },
      ],
    };
    const contents = [
      systemInstruction,
      ...history.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
        maxOutputTokens: 400,
      },
    });
    const text =
      typeof (response as any).text === "function"
        ? (response as any).text()
        : (response as any).text;

    return NextResponse.json({ text: text ?? "" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Genel bir hata oluştu" },
      { status: 500 }
    );
  }
}
