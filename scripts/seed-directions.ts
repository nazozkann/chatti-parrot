import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const directionEntries = [
  {
    de: "rechts",
    en: "right",
    tr: "sağ",
    example: "An der Kreuzung musst du nach rechts fahren.",
  },
  {
    de: "links",
    en: "left",
    tr: "sol",
    example: "Die Apotheke ist links neben dem Supermarkt.",
  },
  {
    de: "geradeaus",
    en: "straight ahead",
    tr: "düz",
    example: "Gehen Sie geradeaus bis zur Ampel.",
  },
  {
    de: "hinten",
    en: "at the back",
    tr: "arka",
    example: "Der Parkplatz liegt hinten am Gebäude.",
  },
  {
    de: "vorne",
    en: "in front",
    tr: "ön",
    example: "Die Rezeption ist vorne beim Eingang.",
  },
  {
    de: "oben",
    en: "upstairs",
    tr: "yukarıda",
    example: "Die Toilette ist oben im ersten Stock.",
  },
  {
    de: "unten",
    en: "downstairs",
    tr: "aşağıda",
    example: "Das Café befindet sich unten im Erdgeschoss.",
  },
  {
    de: "neben",
    en: "next to",
    tr: "yanında",
    example: "Die Bushaltestelle ist direkt neben der Bank.",
  },
  {
    de: "gegenüber",
    en: "opposite",
    tr: "karşısında",
    example: "Die Schule liegt gegenüber vom Park.",
  },
  {
    de: "zurück",
    en: "back",
    tr: "geri",
    example: "Gehen Sie zurück und nehmen Sie dann die zweite Straße rechts.",
  },
];

async function main() {
  await dbConnect();

  const slug = "directions";
  const groupName = "Directions";
  const description = "Wegbeschreibungen für Alltagssituationen.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of directionEntries) {
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
    `✅ Seed completed: ${upserted} direction words stored under group "${groupName}".`
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
