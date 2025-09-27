import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const foodEntries = [
  {
    de: "das Obst",
    en: "fruit",
    tr: "meyve",
    example: "Frisches Obst findest du auf dem Markt.",
  },
  {
    de: "das Gemüse",
    en: "vegetable",
    tr: "sebze",
    example: "Das Gemüse kommt direkt vom Bauernhof.",
  },
  {
    de: "das Getränk",
    en: "drink",
    tr: "içecek",
    example: "Welches Getränk möchtest du bestellen?",
  },
  {
    de: "der Apfel",
    en: "apple",
    tr: "elma",
    example: "Ich esse jeden Morgen einen Apfel.",
  },
  {
    de: "die Banane",
    en: "banana",
    tr: "muz",
    example: "Die Banane ist schon reif und süß.",
  },
  {
    de: "die Tomate",
    en: "tomato",
    tr: "domates",
    example: "Die Tomate schmeckt frisch aus dem Garten.",
  },
  {
    de: "die Suppe",
    en: "soup",
    tr: "çorba",
    example: "Im Winter wärmt mich eine heiße Suppe.",
  },
  {
    de: "das Brot",
    en: "bread",
    tr: "ekmek",
    example: "Frisches Brot duftet besonders gut.",
  },
  {
    de: "das Wasser",
    en: "water",
    tr: "su",
    example: "Trinkst du genug Wasser am Tag?",
  },
  {
    de: "der Kaffee",
    en: "coffee",
    tr: "kahve",
    example: "Der Kaffee ist stark und aromatisch.",
  },
];

async function main() {
  await dbConnect();

  const slug = "food-drinks";
  const groupName = "Food & Drinks (Yemek & İçecek)";
  const description = "Grundwortschatz zu Essen und Trinken für den Alltag.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of foodEntries) {
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
    `✅ Seed completed: ${upserted} food and drink items stored under group "${groupName}".`
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
