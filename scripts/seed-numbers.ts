import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../app/lib/db/mongoose.ts";
import { Word, type CEFRLevel } from "../app/models/Word.ts";
import { WordGroup } from "../app/models/WordGroup.ts";

const LEVEL: CEFRLevel = "A1";

const numberEntries = [
  { value: 0, de: "null", en: "zero", tr: "sıfır", example: "Null Grad ist sehr kalt." },
  { value: 1, de: "eins", en: "one", tr: "bir", example: "Ich habe nur eins übrig." },
  { value: 2, de: "zwei", en: "two", tr: "iki", example: "Zwei Kinder spielen im Park." },
  { value: 3, de: "drei", en: "three", tr: "üç", example: "Drei Bücher liegen auf dem Tisch." },
  { value: 4, de: "vier", en: "four", tr: "dört", example: "Vier Tassen stehen bereit." },
  { value: 5, de: "fünf", en: "five", tr: "beş", example: "Fünf Freunde kommen heute Abend." },
  { value: 6, de: "sechs", en: "six", tr: "altı", example: "Sechs Schüler fehlen heute." },
  { value: 7, de: "sieben", en: "seven", tr: "yedi", example: "Sieben Tage hat die Woche." },
  { value: 8, de: "acht", en: "eight", tr: "sekiz", example: "Acht Stunden Schlaf sind ideal." },
  { value: 9, de: "neun", en: "nine", tr: "dokuz", example: "Neun Personen sitzen am Tisch." },
  { value: 10, de: "zehn", en: "ten", tr: "on", example: "Zehn Minuten Pause reichen." },
  { value: 11, de: "elf", en: "eleven", tr: "on bir", example: "Elf Spieler stehen auf dem Feld." },
  { value: 12, de: "zwölf", en: "twelve", tr: "on iki", example: "Zwölf Monate hat das Jahr." },
  { value: 13, de: "dreizehn", en: "thirteen", tr: "on üç", example: "Dreizehn Stühle sind reserviert." },
  { value: 14, de: "vierzehn", en: "fourteen", tr: "on dört", example: "Vierzehn Gäste sind eingeladen." },
  { value: 15, de: "fünfzehn", en: "fifteen", tr: "on beş", example: "Fünfzehn Fragen bleiben offen." },
  { value: 16, de: "sechzehn", en: "sixteen", tr: "on altı", example: "Sechzehn Seiten sind zu lesen." },
  { value: 17, de: "siebzehn", en: "seventeen", tr: "on yedi", example: "Siebzehn Kilometer sind es noch." },
  { value: 18, de: "achtzehn", en: "eighteen", tr: "on sekiz", example: "Achtzehn Jahre alt ist er." },
  { value: 19, de: "neunzehn", en: "nineteen", tr: "on dokuz", example: "Neunzehn Punkte haben wir erzielt." },
  { value: 20, de: "zwanzig", en: "twenty", tr: "yirmi", example: "Zwanzig Euro kosten die Karten." },
  { value: 21, de: "einundzwanzig", en: "twenty-one", tr: "yirmi bir", example: "Einundzwanzig Leute nehmen teil." },
  { value: 22, de: "zweiundzwanzig", en: "twenty-two", tr: "yirmi iki", example: "Zweiundzwanzig Teams starten." },
  { value: 23, de: "dreiundzwanzig", en: "twenty-three", tr: "yirmi üç", example: "Dreiundzwanzig Zimmer sind frei." },
  { value: 24, de: "vierundzwanzig", en: "twenty-four", tr: "yirmi dört", example: "Vierundzwanzig Stunden hat der Tag." },
  { value: 25, de: "fünfundzwanzig", en: "twenty-five", tr: "yirmi beş", example: "Fünfundzwanzig Aufgaben warten." },
  { value: 26, de: "sechsundzwanzig", en: "twenty-six", tr: "yirmi altı", example: "Sechsundzwanzig Schüler sind angemeldet." },
  { value: 27, de: "siebenundzwanzig", en: "twenty-seven", tr: "yirmi yedi", example: "Siebenundzwanzig Seiten hat das Kapitel." },
  { value: 28, de: "achtundzwanzig", en: "twenty-eight", tr: "yirmi sekiz", example: "Achtundzwanzig Grad sind angekündigt." },
  { value: 29, de: "neunundzwanzig", en: "twenty-nine", tr: "yirmi dokuz", example: "Neunundzwanzig Pakete sind angekommen." },
  { value: 30, de: "dreißig", en: "thirty", tr: "otuz", example: "Dreißig Minuten dauert die Fahrt." },
  { value: 40, de: "vierzig", en: "forty", tr: "kırk", example: "Vierzig Gäste werden erwartet." },
  { value: 50, de: "fünfzig", en: "fifty", tr: "elli", example: "Fünfzig Prozent Rabatt gilt heute." },
  { value: 60, de: "sechzig", en: "sixty", tr: "altmış", example: "Sechzig Meter misst der Turm." },
  { value: 70, de: "siebzig", en: "seventy", tr: "yetmiş", example: "Siebzig Jahre feiert sie heute." },
  { value: 80, de: "achtzig", en: "eighty", tr: "seksen", example: "Achtzig Teilnehmer sind angemeldet." },
  { value: 90, de: "neunzig", en: "ninety", tr: "doksan", example: "Neunzig Minuten dauert der Film." },
  { value: 100, de: "hundert", en: "one hundred", tr: "yüz", example: "Hundert Fragen stehen im Test." },
  { value: 101, de: "einhunderteins", en: "one hundred and one", tr: "yüz bir", example: "Einhunderteins Besucher kamen zur Eröffnung." },
  { value: 102, de: "einhundertzwei", en: "one hundred and two", tr: "yüz iki", example: "Einhundertzwei Schritte trennen die Gebäude." },
  { value: 103, de: "einhundertdrei", en: "one hundred and three", tr: "yüz üç", example: "Einhundertdrei Stimmen wurden gezählt." },
  { value: 110, de: "einhundertzehn", en: "one hundred and ten", tr: "yüz on", example: "Einhundertzehn Kilometer beträgt die Strecke." },
  { value: 111, de: "einhundertelf", en: "one hundred and eleven", tr: "yüz on bir", example: "Einhundertelf Schüler nehmen teil." },
  { value: 120, de: "einhundertzwanzig", en: "one hundred and twenty", tr: "yüz yirmi", example: "Einhundertzwanzig Plätze sind reserviert." },
  { value: 121, de: "einhunderteinundzwanzig", en: "one hundred and twenty-one", tr: "yüz yirmi bir", example: "Einhunderteinundzwanzig Stimmen wurden gezählt." },
  { value: 130, de: "einhundertdreißig", en: "one hundred and thirty", tr: "yüz otuz", example: "Einhundertdreißig Euro kostet das Ticket." },
  { value: 131, de: "einhunderteinunddreißig", en: "one hundred and thirty-one", tr: "yüz otuz bir", example: "Einhunderteinunddreißig Aufgaben wurden korrigiert." },
  { value: 140, de: "einhundertvierzig", en: "one hundred and forty", tr: "yüz kırk", example: "Einhundertvierzig Seiten hat das Buch." },
  { value: 150, de: "einhundertfünfzig", en: "one hundred and fifty", tr: "yüz elli", example: "Einhundertfünfzig Meter liegen zwischen den Toren." },
  { value: 200, de: "zweihundert", en: "two hundred", tr: "iki yüz", example: "Zweihundert Gäste passen in den Saal." },
  { value: 201, de: "zweihunderteins", en: "two hundred and one", tr: "iki yüz bir", example: "Zweihunderteins Euro stehen auf der Rechnung." },
  { value: 210, de: "zweihundertzehn", en: "two hundred and ten", tr: "iki yüz on", example: "Zweihundertzehn Pakete wurden verschickt." },
  { value: 300, de: "dreihundert", en: "three hundred", tr: "üç yüz", example: "Dreihundert Kinder besuchen die Schule." },
  { value: 400, de: "vierhundert", en: "four hundred", tr: "dört yüz", example: "Vierhundert Jahre alt ist die Kirche." },
  { value: 1000, de: "eintausend", en: "one thousand", tr: "bin", example: "Eintausend Euro (kurz: 'tausend') sind erforderlich." },
  { value: 1001, de: "eintausendeins", en: "one thousand and one", tr: "bin bir", example: "Eintausendeins Schritte zeigt der Zähler an." },
  { value: 1100, de: "eintausendeinhundert", en: "one thousand one hundred", tr: "bin yüz", example: "Eintausendeinhundert Teilnehmer haben sich angemeldet." },
  { value: 2000, de: "zweitausend", en: "two thousand", tr: "iki bin", example: "Zweitausend Menschen wohnen im Dorf." },
  { value: 3000, de: "dreitausend", en: "three thousand", tr: "üç bin", example: "Dreitausend Meter hoch ist der Berg." },
  { value: 10000, de: "zehntausend", en: "ten thousand", tr: "on bin", example: "Zehntausend Fans füllen das Stadion." },
  { value: 100000, de: "einhunderttausend", en: "one hundred thousand", tr: "yüz bin", example: "Einhunderttausend Besucher zählte die Ausstellung." },
  {
    value: 999999,
    de: "neunhundertneunundneunzigtausendneunhundertneunundneunzig",
    en: "nine hundred ninety-nine thousand nine hundred ninety-nine",
    tr: "dokuz yüz doksan dokuz bin dokuz yüz doksan dokuz",
    example: "Neunhundertneunundneunzigtausendneunhundertneunundneunzig Möglichkeiten wurden geprüft.",
  },
];

async function main() {
  await dbConnect();

  const slug = "zahlen-basics";
  const groupName = "Numbers 0-10000";
  const description = "Grundzahlen von 0 bis 10.000 für Alltagssituationen und Übungen.";

  const group = await WordGroup.findOneAndUpdate(
    { slug },
    { name: groupName, description, level: LEVEL, slug },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let upserted = 0;

  for (const entry of numberEntries) {
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

  console.log(`✅ Seed completed: ${upserted} numbers stored under group "${groupName}".`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
