import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const travelEntries = [
  {
    de: "der Bus",
    en: "bus",
    tr: "otobüs",
    example: "Der Bus kommt alle zehn Minuten.",
  },
  {
    de: "der Zug",
    en: "train",
    tr: "tren",
    example: "Der Zug fährt pünktlich um acht Uhr ab.",
  },
  {
    de: "das Ticket",
    en: "ticket",
    tr: "bilet",
    example: "Ich habe ein Ticket nach München gekauft.",
  },
  {
    de: "das Flugzeug",
    en: "airplane",
    tr: "uçak",
    example: "Das Flugzeug landet um 14 Uhr.",
  },
  {
    de: "die U-Bahn",
    en: "subway",
    tr: "metro",
    example: "Die U-Bahn ist zur Spitzenzeit sehr voll.",
  },
  {
    de: "die Straßenbahn",
    en: "tram",
    tr: "tramvay",
    example: "Die Straßenbahn hält direkt vor der Universität.",
  },
  {
    de: "der Flughafen",
    en: "airport",
    tr: "havaalanı",
    example: "Der Flughafen liegt etwa 20 Kilometer außerhalb.",
  },
  {
    de: "der Bahnhof",
    en: "train station",
    tr: "tren istasyonu",
    example: "Der Bahnhof ist sehr modern.",
  },
  {
    de: "die Fahrkarte",
    en: "fare card",
    tr: "yolcu bileti",
    example: "Für die Fahrkarte brauchst du eine Kreditkarte.",
  },
  {
    de: "der Fahrplan",
    en: "timetable",
    tr: "sefer planı",
    example: "Der Fahrplan hängt an der Wand.",
  },
];

async function main() {
  await dbConnect();

  const slug = "travel-transport";
  const groupName = "Travel & Transport";
  const description = "Reise- und Verkehrswortschatz für den Alltag.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of travelEntries) {
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
    `✅ Seed completed: ${upserted} travel terms stored under group "${groupName}".`
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
