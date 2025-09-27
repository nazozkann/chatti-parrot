import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const questionEntries = [
  {
    de: "Wo?",
    en: "where?",
    tr: "nerede?",
    example: "Wo ist die Bibliothek?",
  },
  {
    de: "Wann?",
    en: "when?",
    tr: "ne zaman?",
    example: "Wann beginnt der Film?",
  },
  {
    de: "Wie?",
    en: "how?",
    tr: "nasıl?",
    example: "Wie funktioniert dieses Gerät?",
  },
  {
    de: "Was?",
    en: "what?",
    tr: "ne?",
    example: "Was machst du heute Abend?",
  },
  {
    de: "Wer?",
    en: "who?",
    tr: "kim?",
    example: "Wer kommt mit uns ins Kino?",
  },
  {
    de: "Warum?",
    en: "why?",
    tr: "neden?",
    example: "Warum lernst du Deutsch?",
  },
  {
    de: "Wohin?",
    en: "where to?",
    tr: "nereye?",
    example: "Wohin fahrt ihr im Urlaub?",
  },
  {
    de: "Woher?",
    en: "where from?",
    tr: "nereden?",
    example: "Woher kommst du?",
  },
  {
    de: "Wie viel?",
    en: "how much?",
    tr: "ne kadar?",
    example: "Wie viel kostet dieses Buch?",
  },
  {
    de: "Wie lange?",
    en: "how long?",
    tr: "ne kadar süre?",
    example: "Wie lange dauert die Fahrt?",
  },
];

async function main() {
  await dbConnect();

  const slug = "questions";
  const groupName = "Questions";
  const description = "Grundlegende Fragewörter für schnelle Gespräche.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of questionEntries) {
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
    `✅ Seed completed: ${upserted} question words stored under group "${groupName}".`
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
