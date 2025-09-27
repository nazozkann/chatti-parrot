import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const animalEntries = [
  {
    de: "der Hund",
    en: "dog",
    tr: "köpek",
    example: "Der Hund spielt gerne im Garten.",
  },
  {
    de: "die Katze",
    en: "cat",
    tr: "kedi",
    example: "Meine Katze schläft den ganzen Tag.",
  },
  {
    de: "der Vogel",
    en: "bird",
    tr: "kuş",
    example: "Der Vogel singt früh am Morgen.",
  },
  {
    de: "der Fisch",
    en: "fish",
    tr: "balık",
    example: "Im Aquarium schwimmt ein bunter Fisch.",
  },
  {
    de: "der Hase",
    en: "rabbit",
    tr: "tavşan",
    example: "Der Hase hoppelt über die Wiese.",
  },
  {
    de: "das Pferd",
    en: "horse",
    tr: "at",
    example: "Das Pferd galoppiert schnell über das Feld.",
  },
  {
    de: "die Kuh",
    en: "cow",
    tr: "inek",
    example: "Die Kuh gibt jeden Morgen frische Milch.",
  },
  {
    de: "das Schaf",
    en: "sheep",
    tr: "koyun",
    example: "Das Schaf weidet auf der grünen Wiese.",
  },
  {
    de: "die Ente",
    en: "duck",
    tr: "ördek",
    example: "Die Ente schwimmt im See.",
  },
  {
    de: "die Maus",
    en: "mouse",
    tr: "fare",
    example: "Die Maus versteckt sich unter dem Schrank.",
  },
];

async function main() {
  await dbConnect();

  const slug = "animals";
  const groupName = "Animals";
  const description = "Tiernamen für Alltagsgespräche und Geschichten.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of animalEntries) {
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
    `✅ Seed completed: ${upserted} animal words stored under group "${groupName}".`
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
