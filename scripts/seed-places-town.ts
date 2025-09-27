import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const placesEntries = [
  {
    de: "der Markt",
    en: "market",
    tr: "pazar",
    example: "Der Markt ist jeden Samstag geöffnet.",
  },
  {
    de: "die Schule",
    en: "school",
    tr: "okul",
    example: "Die Schule liegt gleich neben der Kirche.",
  },
  {
    de: "das Krankenhaus",
    en: "hospital",
    tr: "hastane",
    example: "Das Krankenhaus ist fünf Minuten entfernt.",
  },
  {
    de: "die Bibliothek",
    en: "library",
    tr: "kütüphane",
    example: "Die Bibliothek hat bis 20 Uhr geöffnet.",
  },
  {
    de: "die Post",
    en: "post office",
    tr: "postane",
    example: "Die Post befindet sich gegenüber dem Park.",
  },
  {
    de: "die Apotheke",
    en: "pharmacy",
    tr: "eczane",
    example: "Ich hole meine Medikamente in der Apotheke ab.",
  },
  {
    de: "das Rathaus",
    en: "town hall",
    tr: "belediye",
    example: "Das Rathaus ist im historischen Zentrum.",
  },
  {
    de: "das Kino",
    en: "cinema",
    tr: "sinema",
    example: "Wir treffen uns abends vor dem Kino.",
  },
  {
    de: "der Bahnhof",
    en: "train station",
    tr: "tren istasyonu",
    example: "Der Bahnhof ist immer sehr belebt.",
  },
  {
    de: "der Park",
    en: "park",
    tr: "park",
    example: "Am Wochenende gehen wir im Park spazieren.",
  },
];

async function main() {
  await dbConnect();

  const slug = "places-in-town";
  const groupName = "Places in Town";
  const description = "Wichtige Orte in der Stadt für Alltagsgespräche.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of placesEntries) {
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
    `✅ Seed completed: ${upserted} town places stored under group "${groupName}".`
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
