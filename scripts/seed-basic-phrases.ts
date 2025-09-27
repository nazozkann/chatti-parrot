import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const basicPhraseEntries = [
  {
    de: "Danke",
    en: "thank you",
    tr: "teşekkür ederim",
    example: "Danke für deine Hilfe.",
  },
  {
    de: "Vielen Dank",
    en: "thank you very much",
    tr: "çok teşekkür ederim",
    example: "Vielen Dank für das Geschenk.",
  },
  {
    de: "Bitte",
    en: "please",
    tr: "lütfen",
    example: "Bitte setzen Sie sich.",
  },
  {
    de: "Gern geschehen",
    en: "you're welcome",
    tr: "rica ederim",
    example: "Gern geschehen, es war kein Problem.",
  },
  {
    de: "Entschuldigung",
    en: "excuse me",
    tr: "afedersiniz",
    example: "Entschuldigung, wo ist die U-Bahn?",
  },
  {
    de: "Es tut mir leid",
    en: "I'm sorry",
    tr: "üzgünüm",
    example: "Es tut mir leid, ich habe den Termin vergessen.",
  },
  {
    de: "Ja",
    en: "yes",
    tr: "evet",
    example: "Ja, ich komme morgen mit.",
  },
  {
    de: "Nein",
    en: "no",
    tr: "hayır",
    example: "Nein, das passt mir nicht.",
  },
  {
    de: "Vielleicht",
    en: "maybe",
    tr: "belki",
    example: "Vielleicht regnet es später.",
  },
  {
    de: "Ich verstehe nicht",
    en: "I don't understand",
    tr: "anlamıyorum",
    example: "Ich verstehe nicht, können Sie das erklären?",
  },
  {
    de: "Können Sie das wiederholen?",
    en: "could you repeat that?",
    tr: "tekrar eder misiniz?",
    example: "Können Sie das wiederholen? Ich habe es nicht gehört.",
  },
  {
    de: "Ich brauche Hilfe",
    en: "I need help",
    tr: "yardıma ihtiyacım var",
    example: "Ich brauche Hilfe bei den Hausaufgaben.",
  },
  {
    de: "Kein Problem",
    en: "no problem",
    tr: "sorun değil",
    example: "Kein Problem, ich mache das morgen.",
  },
  {
    de: "Alles klar",
    en: "all good",
    tr: "her şey yolunda",
    example: "Alles klar? Wir können loslegen.",
  },
  {
    de: "Natürlich",
    en: "of course",
    tr: "tabii ki",
    example: "Natürlich, ich helfe dir gern.",
  },
  {
    de: "Wie sagt man ... auf Deutsch?",
    en: "how do you say ... in German?",
    tr: "Almanca'da ... nasıl söylenir?",
    example: "Wie sagt man \"library\" auf Deutsch?",
  },
];

async function main() {
  await dbConnect();

  const slug = "basic-phrases";
  const groupName = "Basic Phrases (Temel Kalıplar)";
  const description =
    "Alltägliche Redewendungen für schnelle Reaktionen im Gespräch.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of basicPhraseEntries) {
    const payload = {
      de: entry.de,
      en: entry.en,
      tr: entry.tr,
      examples: [entry.example],
      level: LEVEL,
      group: group._id,
    };

    await Word.findOneAndUpdate({ de: entry.de, group: group._id }, payload, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    });
    upserted += 1;
  }

  console.log(
    `✅ Seed completed: ${upserted} basic phrases stored under group "${groupName}".`
  );
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
