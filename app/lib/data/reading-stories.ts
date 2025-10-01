export type ReadingLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type StoryFragment =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "vocab";
      content: string;
      english?: string;
      turkish?: string;
    };

export type StoryBlock =
  | {
      kind: "paragraph";
      fragments: StoryFragment[];
    }
  | {
      kind: "dialogue";
      speaker: string;
      fragments: StoryFragment[];
    }
  | {
      kind: "scene-break";
      label?: string;
    };

export type KeyVocabulary = {
  word: string;
  english: string;
  turkish: string;
};

export type ReadingStory = {
  id: string;
  level: ReadingLevel;
  slug: string;
  title: string;
  summary: string;
  theme: string;
  estimatedTime: string;
  focus: string[];
  keyVocabulary: KeyVocabulary[];
  content: StoryBlock[];
  comprehensionPrompts: string[];
};

const readingStories: ReadingStory[] = [
  {
    id: "a1-morning-market",
    level: "A1",
    slug: "morgen-auf-dem-markt",
    title: "Morgen auf dem Markt",
    summary:
      "Lukas und Anna besuchen früh den Markt, um ein gemütliches Frühstück mit Brot, Obst und Getränken vorzubereiten.",
    theme: "Marktbesuch",
    estimatedTime: "3 Minuten",
    focus: ["Frühstück", "Einkaufen"],
    keyVocabulary: [
      { word: "das Obst", english: "fruit", turkish: "meyve" },
      { word: "das Brot", english: "bread", turkish: "ekmek" },
      { word: "die Suppe", english: "soup", turkish: "çorba" },
      { word: "das Gemüse", english: "vegetable", turkish: "sebze" },
      { word: "der Apfel", english: "apple", turkish: "elma" },
      { word: "die Banane", english: "banana", turkish: "muz" },
      { word: "die Tomate", english: "tomato", turkish: "domates" },
      { word: "das Wasser", english: "water", turkish: "su" },
      { word: "der Kaffee", english: "coffee", turkish: "kahve" },
      { word: "das Getränk", english: "drink", turkish: "içecek" },
    ],
    content: [
      {
        kind: "paragraph",
        fragments: [
          {
            type: "text",
            content:
              "Es ist ein ruhiger Samstagmorgen in Freiburg. Lukas und Anna gehen zum Marktplatz. Sie möchten ",
          },
          { type: "vocab", content: "das Obst", english: "fruit", turkish: "meyve" },
          { type: "text", content: " und " },
          { type: "vocab", content: "das Brot", english: "bread", turkish: "ekmek" },
          { type: "text", content: " für ihr Frühstück kaufen." },
        ],
      },
      { kind: "scene-break", label: "Beim Bäcker" },
      {
        kind: "paragraph",
        fragments: [
          {
            type: "text",
            content:
              "Der Bäcker stellt warmes Brot und kleine Schüsseln Suppe auf den Tisch. Der Duft lässt Lukas lächeln.",
          },
        ],
      },
      {
        kind: "dialogue",
        speaker: "Bäcker",
        fragments: [
          { type: "text", content: "Heute ist " },
          { type: "vocab", content: "das Brot", english: "bread", turkish: "ekmek" },
          { type: "text", content: " besonders knusprig. Wollt ihr auch " },
          { type: "vocab", content: "die Suppe", english: "soup", turkish: "çorba" },
          { type: "text", content: " probieren?" },
        ],
      },
      {
        kind: "dialogue",
        speaker: "Lukas",
        fragments: [
          { type: "text", content: "Danke, heute nehmen wir nur " },
          { type: "vocab", content: "das Brot", english: "bread", turkish: "ekmek" },
          { type: "text", content: ". Die Suppe behalten wir für morgen." },
        ],
      },
      {
        kind: "paragraph",
        fragments: [
          {
            type: "text",
            content:
              "Anna zahlt und legt das Brot vorsichtig in den Korb. Dann gehen sie weiter zum nächsten Stand.",
          },
        ],
      },
      { kind: "scene-break", label: "Gemüse und Obst" },
      {
        kind: "paragraph",
        fragments: [
          {
            type: "text",
            content: "Der Markt ist bunt und laut. Überall glänzt ",
          },
          { type: "vocab", content: "das Gemüse", english: "vegetable", turkish: "sebze" },
          { type: "text", content: "." },
        ],
      },
      {
        kind: "dialogue",
        speaker: "Anna",
        fragments: [
          { type: "text", content: "Schau, " },
          { type: "vocab", content: "der Apfel", english: "apple", turkish: "elma" },
          { type: "text", content: " duftet so süß heute!" },
        ],
      },
      {
        kind: "dialogue",
        speaker: "Lukas",
        fragments: [
          { type: "text", content: "Und hier liegt " },
          { type: "vocab", content: "die Banane", english: "banana", turkish: "muz" },
          { type: "text", content: ". Die nehmen wir für später." },
        ],
      },
      {
        kind: "paragraph",
        fragments: [
          { type: "text", content: "Anna packt " },
          { type: "vocab", content: "die Tomate", english: "tomato", turkish: "domates" },
          { type: "text", content: " vorsichtig ein und lächelt zufrieden." },
        ],
      },
      { kind: "scene-break", label: "Getränke" },
      {
        kind: "paragraph",
        fragments: [
          {
            type: "text",
            content: "Am letzten Stand empfiehlt der Verkäufer ",
          },
          { type: "vocab", content: "das Getränk", english: "drink", turkish: "içecek" },
          { type: "text", content: " mit frischer Minze." },
        ],
      },
      {
        kind: "dialogue",
        speaker: "Lukas",
        fragments: [
          { type: "text", content: "Für den Weg brauche ich noch " },
          { type: "vocab", content: "das Wasser", english: "water", turkish: "su" },
          { type: "text", content: "." },
        ],
      },
      {
        kind: "dialogue",
        speaker: "Anna",
        fragments: [
          { type: "vocab", content: "der Kaffee", english: "coffee", turkish: "kahve" },
          { type: "text", content: " duftet stark. Ich nehme eine Tasse." },
        ],
      },
      {
        kind: "paragraph",
        fragments: [
          {
            type: "text",
            content:
              "Sie bedanken sich und gehen mit dem vollen Korb nach Hause. Das Frühstück kann beginnen.",
          },
        ],
      },
    ],
    comprehensionPrompts: [
      "Welche Lebensmittel möchten Lukas und Anna am Anfang kaufen?",
      "Was bietet der Bäcker außer Brot an?",
      "Welche Getränke wählen Lukas und Anna am Ende des Einkaufs?",
    ],
  },
];

export function getReadingStories(): ReadingStory[] {
  return readingStories;
}

export function getReadingStoriesByLevel(level: ReadingLevel): ReadingStory[] {
  return readingStories.filter((story) => story.level === level);
}

export function getReadingStory(level: ReadingLevel, slug: string): ReadingStory | undefined {
  return readingStories.find((story) => story.level === level && story.slug === slug);
}

export function getReadingLevels(): ReadingLevel[] {
  return ["A1", "A2", "B1", "B2", "C1", "C2"];
}

export function getReadingCatalog() {
  const levels = getReadingLevels();
  return levels.map((level) => ({
    level,
    stories: getReadingStoriesByLevel(level),
  }));
}

export function getReadingStoryParams() {
  return readingStories.map((story) => ({
    level: story.level,
    slug: story.slug,
  }));
}
