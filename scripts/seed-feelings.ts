import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const feelingEntries = [
  {
    de: "glücklich",
    en: "happy",
    tr: "mutlu",
    example: "Ich bin heute glücklich, weil die Sonne scheint.",
  },
  {
    de: "traurig",
    en: "sad",
    tr: "üzgün",
    example: "Sie ist traurig, weil ihr Freund weggezogen ist.",
  },
  {
    de: "aufgeregt",
    en: "excited",
    tr: "heyecanlı",
    example: "Wir sind aufgeregt vor dem Konzert.",
  },
  {
    de: "wütend",
    en: "angry",
    tr: "kızgın",
    example: "Er ist wütend, weil der Zug verspätet ist.",
  },
  {
    de: "nervös",
    en: "nervous",
    tr: "gergin",
    example: "Ich bin nervös vor der Prüfung.",
  },
  {
    de: "entspannt",
    en: "relaxed",
    tr: "rahat",
    example: "Nach dem Yoga fühle ich mich entspannt.",
  },
  {
    de: "gelangweilt",
    en: "bored",
    tr: "sıkılmış",
    example: "Die Kinder sind gelangweilt ohne ihre Spiele.",
  },
  {
    de: "überrascht",
    en: "surprised",
    tr: "şaşırmış",
    example: "Sie war überrascht von der Geburtstagsparty.",
  },
  {
    de: "stolz",
    en: "proud",
    tr: "gururlu",
    example: "Wir sind stolz auf deinen Erfolg.",
  },
  {
    de: "besorgt",
    en: "worried",
    tr: "endişeli",
    example: "Ich bin besorgt um meine Großmutter.",
  },
];

async function main() {
  await dbConnect();

  const slug = "feelings-emotions";
  const groupName = "Feelings & Emotions";
  const description = "Gefühle und Emotionen für alltägliche Gespräche.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of feelingEntries) {
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
    `✅ Seed completed: ${upserted} feelings stored under group "${groupName}".`
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
