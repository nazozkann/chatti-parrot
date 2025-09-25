import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const greetingsEntries = [
  {
    de: "Hallo",
    en: "hello",
    tr: "merhaba",
    example: "Hallo, wie geht es dir heute?",
  },
  {
    de: "Hi",
    en: "hi",
    tr: "selam",
    example: "Hi, schön dich zu sehen!",
  },
  {
    de: "Guten Morgen",
    en: "good morning",
    tr: "günaydın",
    example: "Guten Morgen, haben Sie gut geschlafen?",
  },
  {
    de: "Guten Tag",
    en: "good day",
    tr: "iyi günler",
    example: "Guten Tag, womit kann ich Ihnen helfen?",
  },
  {
    de: "Guten Abend",
    en: "good evening",
    tr: "iyi akşamlar",
    example: "Guten Abend, willkommen bei uns!",
  },
  {
    de: "Gute Nacht",
    en: "good night",
    tr: "iyi geceler",
    example: "Gute Nacht, schlaf gut!",
  },
  {
    de: "Willkommen",
    en: "welcome",
    tr: "hoş geldiniz",
    example: "Willkommen in Berlin!",
  },
  {
    de: "Servus",
    en: "hi/bye (southern)",
    tr: "selam / hoşça kal",
    example: "Servus, alles klar bei dir?",
  },
  {
    de: "Tschüss",
    en: "bye",
    tr: "hoşça kal",
    example: "Tschüss, bis morgen!",
  },
  {
    de: "Auf Wiedersehen",
    en: "goodbye",
    tr: "güle güle",
    example: "Auf Wiedersehen und einen schönen Tag noch!",
  },
  {
    de: "Bis später",
    en: "see you later",
    tr: "sonra görüşürüz",
    example: "Bis später, ich rufe dich an.",
  },
  {
    de: "Bis bald",
    en: "see you soon",
    tr: "yakında görüşürüz",
    example: "Bis bald, wir bleiben in Kontakt.",
  },
  {
    de: "Schönen Tag noch",
    en: "have a nice day",
    tr: "iyi günler dilerim",
    example: "Schönen Tag noch und gute Fahrt!",
  },
  {
    de: "Schönen Abend noch",
    en: "have a nice evening",
    tr: "iyi akşamlar",
    example: "Schönen Abend noch, bis nächste Woche!",
  },
  {
    de: "Schönes Wochenende",
    en: "have a nice weekend",
    tr: "iyi hafta sonları",
    example: "Schönes Wochenende! Was hast du vor?",
  },
  {
    de: "Wie geht's?",
    en: "how are you?",
    tr: "nasılsın?",
    example: "Wie geht's? Alles in Ordnung?",
  },
  {
    de: "Es geht mir gut",
    en: "I'm doing well",
    tr: "iyiyim",
    example: "Es geht mir gut, danke der Nachfrage!",
  },
  {
    de: "Freut mich",
    en: "nice to meet you",
    tr: "tanıştığımıza memnun oldum",
    example: "Freut mich. Ich heiße Lara.",
  },
  {
    de: "Ich heiße ...",
    en: "my name is ...",
    tr: "benim adım ...",
    example: "Ich heiße Markus. Wie heißt du?",
  },
];

async function main() {
  await dbConnect();

  const slug = "greetings-basics";
  const groupName = "Greetings & Introductions";
  const description =
    "Alltagstaugliche Begrüßungen, Verabschiedungen und Vorstellungssätze.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of greetingsEntries) {
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
    `✅ Seed completed: ${upserted} greetings stored under group "${groupName}".`
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
