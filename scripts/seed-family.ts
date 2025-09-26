import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const familyEntries = [
  {
    de: "die Mutter",
    en: "mother",
    tr: "anne",
    artikel: "die",
    plural: "die Mütter",
    example: "Meine Mutter kocht jeden Sonntag das Mittagessen.",
  },
  {
    de: "der Vater",
    en: "father",
    tr: "baba",
    artikel: "der",
    plural: "die Väter",
    example: "Mein Vater liest abends gern Zeitung.",
  },
  {
    de: "die Eltern",
    en: "parents",
    tr: "ebeveynler",
    artikel: "die",
    plural: "die Eltern",
    example: "Meine Eltern wohnen auf dem Land.",
  },
  {
    de: "das Kind",
    en: "child",
    tr: "çocuk",
    artikel: "das",
    plural: "die Kinder",
    example: "Das Kind spielt im Garten.",
  },
  {
    de: "der Sohn",
    en: "son",
    tr: "oğul",
    artikel: "der",
    plural: "die Söhne",
    example: "Ihr Sohn ist acht Jahre alt.",
  },
  {
    de: "die Tochter",
    en: "daughter",
    tr: "kız evlat",
    artikel: "die",
    plural: "die Töchter",
    example: "Die Tochter besucht die Grundschule.",
  },
  {
    de: "der Bruder",
    en: "brother",
    tr: "erkek kardeş",
    artikel: "der",
    plural: "die Brüder",
    example: "Mein Bruder arbeitet als Ingenieur.",
  },
  {
    de: "die Schwester",
    en: "sister",
    tr: "kız kardeş",
    artikel: "die",
    plural: "die Schwestern",
    example: "Meine Schwester studiert Medizin.",
  },
  {
    de: "die Geschwister",
    en: "siblings",
    tr: "kardeşler",
    artikel: "die",
    plural: "die Geschwister",
    example: "Hast du Geschwister oder bist du Einzelkind?",
  },
  {
    de: "die Oma",
    en: "grandma",
    tr: "büyükanne",
    artikel: "die",
    plural: "die Omas",
    example: "Unsere Oma backt die besten Kuchen.",
  },
  {
    de: "der Opa",
    en: "grandpa",
    tr: "büyükbaba",
    artikel: "der",
    plural: "die Opas",
    example: "Der Opa erzählt gern Geschichten.",
  },
  {
    de: "die Großmutter",
    en: "grandmother",
    tr: "büyükanne",
    artikel: "die",
    plural: "die Großmütter",
    example: "Meine Großmutter wohnt in München.",
  },
  {
    de: "der Großvater",
    en: "grandfather",
    tr: "büyükbaba",
    artikel: "der",
    plural: "die Großväter",
    example: "Der Großvater spielt gern Schach.",
  },
  {
    de: "die Tante",
    en: "aunt",
    tr: "hala / teyze",
    artikel: "die",
    plural: "die Tanten",
    example: "Meine Tante kommt am Wochenende zu Besuch.",
  },
  {
    de: "der Onkel",
    en: "uncle",
    tr: "amca / dayı",
    artikel: "der",
    plural: "die Onkel",
    example: "Der Onkel lebt in Berlin.",
  },
  {
    de: "der Cousin",
    en: "male cousin",
    tr: "erkek kuzen",
    artikel: "der",
    plural: "die Cousins",
    example: "Mein Cousin studiert in Hamburg.",
  },
  {
    de: "die Cousine",
    en: "female cousin",
    tr: "kız kuzen",
    artikel: "die",
    plural: "die Cousinen",
    example: "Die Cousine arbeitet als Lehrerin.",
  },
  {
    de: "der Ehemann",
    en: "husband",
    tr: "koca",
    artikel: "der",
    plural: "die Ehemänner",
    example: "Ihr Ehemann reist beruflich viel.",
  },
  {
    de: "die Ehefrau",
    en: "wife",
    tr: "eş",
    artikel: "die",
    plural: "die Ehefrauen",
    example: "Seine Ehefrau arbeitet im Krankenhaus.",
  },
  {
    de: "der Freund",
    en: "friend (male)",
    tr: "arkadaş (erkek)",
    artikel: "der",
    plural: "die Freunde",
    example: "Mein bester Freund wohnt nebenan.",
  },
  {
    de: "die Freundin",
    en: "friend (female) / girlfriend",
    tr: "arkadaş (kadın) / kız arkadaş",
    artikel: "die",
    plural: "die Freundinnen",
    example: "Sie trifft sich heute mit ihrer Freundin.",
  },
  {
    de: "der Partner",
    en: "partner (male)",
    tr: "partner (erkek)",
    artikel: "der",
    plural: "die Partner",
    example: "Ihr Partner unterstützt sie sehr.",
  },
  {
    de: "die Partnerin",
    en: "partner (female)",
    tr: "partner (kadın)",
    artikel: "die",
    plural: "die Partnerinnen",
    example: "Seine Partnerin arbeitet in einer Agentur.",
  },
  {
    de: "der Nachbar",
    en: "neighbor (male)",
    tr: "komşu (erkek)",
    artikel: "der",
    plural: "die Nachbarn",
    example: "Der Nachbar hilft uns oft im Garten.",
  },
  {
    de: "die Nachbarin",
    en: "neighbor (female)",
    tr: "komşu (kadın)",
    artikel: "die",
    plural: "die Nachbarinnen",
    example: "Unsere Nachbarin backt gern Kuchen für alle.",
  },
];

async function main() {
  await dbConnect();

  const slug = "familie-basics";
  const groupName = "Family & Friends";
  const description =
    "Verwandtschaftsbezeichnungen und wichtige Begriffe rund um Freundschaften.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of familyEntries) {
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

  console.log(`✅ Seed completed: ${upserted} family words stored under group "${groupName}".`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
