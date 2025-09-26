import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const timeEntries = [
  {
    de: "der Morgen",
    en: "morning",
    tr: "sabah",
    artikel: "der",
    plural: "die Morgen",
    example: "Jeden Morgen trinke ich eine Tasse Kaffee.",
  },
  {
    de: "der Vormittag",
    en: "late morning",
    tr: "öğleden önce",
    artikel: "der",
    plural: "die Vormittage",
    example: "Der Unterricht beginnt am Vormittag um neun Uhr.",
  },
  {
    de: "der Mittag",
    en: "noon",
    tr: "öğle",
    artikel: "der",
    plural: "die Mittage",
    example: "Um Mittag essen wir zusammen in der Kantine.",
  },
  {
    de: "der Nachmittag",
    en: "afternoon",
    tr: "öğleden sonra",
    artikel: "der",
    plural: "die Nachmittage",
    example: "Am Nachmittag gehen wir spazieren.",
  },
  {
    de: "der Abend",
    en: "evening",
    tr: "akşam",
    artikel: "der",
    plural: "die Abende",
    example: "Am Abend lese ich gern ein Buch.",
  },
  {
    de: "die Nacht",
    en: "night",
    tr: "gece",
    artikel: "die",
    plural: "die Nächte",
    example: "In der Nacht ist es sehr ruhig im Dorf.",
  },
  {
    de: "der Tag",
    en: "day",
    tr: "gün",
    artikel: "der",
    plural: "die Tage",
    example: "Ein Tag hat vierundzwanzig Stunden.",
  },
  {
    de: "die Stunde",
    en: "hour",
    tr: "saat",
    artikel: "die",
    plural: "die Stunden",
    example: "Die Stunde dauert sechzig Minuten.",
  },
  {
    de: "die Minute",
    en: "minute",
    tr: "dakika",
    artikel: "die",
    plural: "die Minuten",
    example: "In einer Minute kann viel passieren.",
  },
  {
    de: "die Sekunde",
    en: "second",
    tr: "saniye",
    artikel: "die",
    plural: "die Sekunden",
    example: "Nur eine Sekunde bitte, ich komme sofort.",
  },
  {
    de: "die Uhr",
    en: "clock",
    tr: "saat",
    artikel: "die",
    plural: "die Uhren",
    example: "Die Uhr zeigt fast zwölf Uhr.",
  },
  {
    de: "die Uhrzeit",
    en: "time of day",
    tr: "saat dilimi",
    artikel: "die",
    plural: "die Uhrzeiten",
    example: "Welche Uhrzeit passt dir für das Meeting?",
  },
];

async function main() {
  await dbConnect();

  const slug = "zeit-basics";
  const groupName = "Time & Daily Rhythm";
  const description = "Zeiten des Tages und wichtige Begriffe rund um Uhrzeiten.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of timeEntries) {
    const payload = {
      de: entry.de,
      en: entry.en,
      tr: entry.tr,
      artikel: entry.artikel,
      plural: entry.plural,
      examples: [entry.example],
      level: LEVEL,
      group: group._id,
    };

    await Word.findOneAndUpdate(
      { de: entry.de, group: group._id },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
    upserted += 1;
  }

  console.log(`✅ Seed completed: ${upserted} time-related words stored under group "${groupName}".`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
