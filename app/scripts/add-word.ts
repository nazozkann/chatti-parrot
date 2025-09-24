import "dotenv/config";
import { dbConnect } from "../lib/db/mongoose.ts";
import { Word } from "../models/Word.ts";

async function main() {
  await dbConnect();

  const newWord = await Word.create({
    de: "Apfel",
    en: "apple",
    tr: "elma",
    artikel: "der",
    plural: "Äpfel",
    examples: ["Ich esse einen Apfel."],
  });

  console.log("Yeni kelime eklendi:", newWord);
  process.exit(0);
}

main();
