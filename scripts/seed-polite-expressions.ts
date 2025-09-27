import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A2";

const politeEntries = [
  {
    de: "Ich bitte um Hilfe.",
    en: "I request assistance.",
    tr: "Yardım rica ediyorum.",
    example: "Ich bitte um Hilfe, könnten Sie kurz vorbeikommen?",
  },
  {
    de: "Ich bitte um Entschuldigung.",
    en: "I apologize.",
    tr: "Özür dilerim.",
    example: "Ich bitte um Entschuldigung für die Verspätung.",
  },
  {
    de: "Ich möchte mich bedanken.",
    en: "I would like to say thank you.",
    tr: "Teşekkür etmek istiyorum.",
    example: "Ich möchte mich bedanken für Ihre Unterstützung.",
  },
  {
    de: "Vielen Dank für Ihre Mühe.",
    en: "Thank you very much for your effort.",
    tr: "Emekleriniz için çok teşekkür ederim.",
    example: "Vielen Dank für Ihre Mühe, das hat mir sehr geholfen.",
  },
  {
    de: "Darf ich Sie kurz sprechen?",
    en: "May I speak with you briefly?",
    tr: "Sizinle kısaca konuşabilir miyim?",
    example: "Darf ich Sie kurz sprechen, es geht um das Projekt?",
  },
  {
    de: "Wären Sie so freundlich, mir die Tür zu öffnen?",
    en: "Would you be so kind as to open the door for me?",
    tr: "Kapıyı açar mısınız, lütfen?",
    example: "Wären Sie so freundlich, mir die Tür zu öffnen, meine Hände sind voll.",
  },
  {
    de: "Ich weiß Ihre Hilfe zu schätzen.",
    en: "I appreciate your help.",
    tr: "Yardımınızı takdir ediyorum.",
    example: "Ich weiß Ihre Hilfe zu schätzen, vielen Dank!",
  },
  {
    de: "Könnten Sie mir bitte weiterhelfen?",
    en: "Could you please help me further?",
    tr: "Bana biraz daha yardımcı olabilir misiniz?",
    example: "Könnten Sie mir bitte weiterhelfen, ich finde die Adresse nicht.",
  },
  {
    de: "Darf ich um Ihre Aufmerksamkeit bitten?",
    en: "May I ask for your attention?",
    tr: "Dikkatinizi rica edebilir miyim?",
    example: "Darf ich um Ihre Aufmerksamkeit bitten, die Sitzung beginnt jetzt.",
  },
  {
    de: "Ich freue mich über Ihre Rückmeldung.",
    en: "I look forward to your feedback.",
    tr: "Geri bildiriminizi merakla bekliyorum.",
    example: "Ich freue mich über Ihre Rückmeldung bis Freitag.",
  },
];

async function main() {
  await dbConnect();

  const slug = "polite-expressions";
  const groupName = "Polite Expressions";
  const description =
    "Höfliche Ausdrücke für respektvolle Gespräche und Anfragen.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of politeEntries) {
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
    `✅ Seed completed: ${upserted} polite expressions stored under group "${groupName}".`
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
