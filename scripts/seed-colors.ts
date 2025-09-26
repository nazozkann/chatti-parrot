import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const colorEntries = [
  {
    de: "rot",
    en: "red",
    tr: "kırmızı",
    example: "Die rote Blume steht auf dem Fensterbrett.",
  },
  {
    de: "blau",
    en: "blue",
    tr: "mavi",
    example: "Der Himmel ist heute klar und blau.",
  },
  {
    de: "grün",
    en: "green",
    tr: "yeşil",
    example: "Der Park ist voller grüner Bäume.",
  },
  {
    de: "gelb",
    en: "yellow",
    tr: "sarı",
    example: "Die gelbe Jacke sieht sehr freundlich aus.",
  },
  {
    de: "orange",
    en: "orange",
    tr: "turuncu",
    example: "Wir haben einen orangefarbenen Teppich gekauft.",
  },
  {
    de: "lila",
    en: "purple",
    tr: "mor",
    example: "Sie trägt heute ein lilafarbenes Kleid.",
  },
  {
    de: "rosa",
    en: "pink",
    tr: "pembe",
    example: "Das Babyzimmer ist zart rosa gestrichen.",
  },
  {
    de: "schwarz",
    en: "black",
    tr: "siyah",
    example: "Er hat einen schwarzen Mantel angezogen.",
  },
  {
    de: "weiß",
    en: "white",
    tr: "beyaz",
    example: "Die Wände sind frisch weiß gestrichen.",
  },
  {
    de: "grau",
    en: "grey",
    tr: "gri",
    example: "Der Himmel ist heute grau und bewölkt.",
  },
  {
    de: "braun",
    en: "brown",
    tr: "kahverengi",
    example: "Die braune Tasche passt zu deinen Schuhen.",
  },
  {
    de: "beige",
    en: "beige",
    tr: "bej",
    example: "Wir haben beige Vorhänge für das Wohnzimmer.",
  },
  {
    de: "türkis",
    en: "turquoise",
    tr: "turkuaz",
    example: "Das Meer wirkt hier fast türkis.",
  },
  {
    de: "hellblau",
    en: "light blue",
    tr: "açık mavi",
    example: "Sie trägt einen hellblauen Schal.",
  },
  {
    de: "dunkelgrün",
    en: "dark green",
    tr: "koyu yeşil",
    example: "Der Rucksack ist dunkelgrün und sehr robust.",
  },
  {
    de: "gold",
    en: "gold",
    tr: "altın",
    example: "Die Uhr hat ein goldenes Armband.",
  },
  {
    de: "silber",
    en: "silver",
    tr: "gümüş",
    example: "Der silberne Ring glänzt im Licht.",
  },
];

async function main() {
  await dbConnect();

  const slug = "farben-basics";
  const groupName = "Colors & Shades";
  const description =
    "Grundfarben und häufige Farbabstufungen für den täglichen Wortschatz.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of colorEntries) {
    const payload = {
      de: entry.de,
      en: entry.en,
      tr: entry.tr,
      artikel: undefined,
      plural: undefined,
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

  console.log(`✅ Seed completed: ${upserted} colors stored under group "${groupName}".`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
