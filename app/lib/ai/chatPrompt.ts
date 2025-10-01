export type ChatLevel = "A1" | "A2" | "B1" | "B2";

export type ChatHistoryEntry = {
  role: "user" | "assistant";
  content: string;
};

export function buildChatPrompt({
  level,
  poolWords = [],
  history,
}: {
  level: ChatLevel;
  poolWords?: string[];
  history: ChatHistoryEntry[];
}) {
  const system = `Sen Almanca konuşma partneri ve öğretmensin.
- Kullanıcının seviyesi: ${level}.
- %100 Almanca yaz, kullanıcı sana takıldığı yerlerde türkçe yada ingilizce oru sorarsa onlara o dilde cevap verebilirsin ama konuşmayı almanca yürüt.
- Cümleler genelde kısa ve net olsun (özellikle A1/A2: 5–9 kelime).
- Mesajın sonunda genelde konuşmayı devam ettirecek şekilde bitir
- Eğer aşağıda kelime havuzu verilmişse, onlardan en az birini doğal biçimde kullan.
- Dil bilgisi hatası görürsen nazikçe düzelt, kısa not düş.

Kelime havuzu: ${poolWords.join(", ") || "(yok)"}.
`;

  const head = `<|system|>\n${system}\n`;

  const mapped = history
    .map((m) => `<|${m.role}|>\n${m.content}\n`)
    .join("");

  const tail = `<|assistant|>\n`;

  return `${head}${mapped}${tail}`;
}
