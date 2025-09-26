import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const dayMonthEntries = [
  {
    de: "der Montag",
    en: "Monday",
    tr: "Pazartesi",
    artikel: "der",
    plural: "die Montage",
    example: "Montags beginnt die Woche für viele mit Arbeit.",
  },
  {
    de: "der Dienstag",
    en: "Tuesday",
    tr: "Salı",
    artikel: "der",
    plural: "die Dienstage",
    example: "Dienstagabend habe ich einen Deutschkurs.",
  },
  {
    de: "der Mittwoch",
    en: "Wednesday",
    tr: "Çarşamba",
    artikel: "der",
    plural: "die Mittwoche",
    example: "Mittwoch ist der Tag für unser Teammeeting.",
  },
  {
    de: "der Donnerstag",
    en: "Thursday",
    tr: "Perşembe",
    artikel: "der",
    plural: "die Donnerstage",
    example: "Donnerstag gehen wir abends zum Sport.",
  },
  {
    de: "der Freitag",
    en: "Friday",
    tr: "Cuma",
    artikel: "der",
    plural: "die Freitage",
    example: "Freitagabend feiern wir den Start ins Wochenende.",
  },
  {
    de: "der Samstag",
    en: "Saturday",
    tr: "Cumartesi",
    artikel: "der",
    plural: "die Samstage",
    example: "Samstag erledigen viele ihren Wocheneinkauf.",
  },
  {
    de: "der Sonntag",
    en: "Sunday",
    tr: "Pazar",
    artikel: "der",
    plural: "die Sonntage",
    example: "Sonntag ist Familientag und wir brunchen zusammen.",
  },
  {
    de: "der Januar",
    en: "January",
    tr: "Ocak",
    artikel: "der",
    plural: "die Januare",
    example: "Im Januar beginnt das neue Jahr mit vielen Vorsätzen.",
  },
  {
    de: "der Februar",
    en: "February",
    tr: "Şubat",
    artikel: "der",
    plural: "die Februare",
    example: "Der Februar ist der kürzeste Monat im Jahr.",
  },
  {
    de: "der März",
    en: "March",
    tr: "Mart",
    artikel: "der",
    plural: "die Märze",
    example: "Im März beginnt der Frühling in Deutschland.",
  },
  {
    de: "der April",
    en: "April",
    tr: "Nisan",
    artikel: "der",
    plural: "die Aprile",
    example: "Aprilwetter kann sehr wechselhaft sein.",
  },
  {
    de: "der Mai",
    en: "May",
    tr: "Mayıs",
    artikel: "der",
    plural: "die Maie",
    example: "Im Mai blühen viele Blumen.",
  },
  {
    de: "der Juni",
    en: "June",
    tr: "Haziran",
    artikel: "der",
    plural: "die Junis",
    example: "Juni bringt oft warme Sommertage.",
  },
  {
    de: "der Juli",
    en: "July",
    tr: "Temmuz",
    artikel: "der",
    plural: "die Julis",
    example: "Juli ist Ferienzeit für viele Schüler.",
  },
  {
    de: "der August",
    en: "August",
    tr: "Ağustos",
    artikel: "der",
    plural: "die Auguste",
    example: "Im August reisen viele Menschen ans Meer.",
  },
  {
    de: "der September",
    en: "September",
    tr: "Eylül",
    artikel: "der",
    plural: "die September",
    example: "Im September beginnt in vielen Bundesländern die Schule.",
  },
  {
    de: "der Oktober",
    en: "October",
    tr: "Ekim",
    artikel: "der",
    plural: "die Oktober",
    example: "Der Oktober bringt buntes Herbstlaub.",
  },
  {
    de: "der November",
    en: "November",
    tr: "Kasım",
    artikel: "der",
    plural: "die November",
    example: "Im November werden die Tage merklich kürzer.",
  },
  {
    de: "der Dezember",
    en: "December",
    tr: "Aralık",
    artikel: "der",
    plural: "die Dezember",
    example: "Im Dezember feiern wir Weihnachten.",
  },
];

async function main() {
  await dbConnect();

  const slug = "tage-monate-basics";
  const groupName = "Days & Months";
  const description =
    "Wichtige Wochentage und Monate des Jahres für alltägliche Gespräche.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of dayMonthEntries) {
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

  console.log(`✅ Seed completed: ${upserted} day/month words stored under group "${groupName}".`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
