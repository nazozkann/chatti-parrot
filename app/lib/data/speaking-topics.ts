export type SpeakingLevel = "A1" | "A2" | "B1" | "B2";

export type SpeakingTopic = {
  id: string;
  level: SpeakingLevel;
  title: string;
  scenario: string;
  instructions: string;
  keyPhrases?: string[];
  guidance?: string[];
};

const speakingTopics: SpeakingTopic[] = [
  {
    id: "a1-restaurant-order",
    level: "A1",
    title: "Im Restaurant bestellen",
    scenario:
      "Du bist in einem Restaurant. Der Kellner fragt: ‘Was möchten Sie bestellen?’",
    instructions:
      "Answer the waiter. Say what you would like to order, add a polite phrase, and mention a drink.",
    keyPhrases: [
      "Ich möchte … bitte.",
      "Für mich …, danke.",
      "Ich nehme dazu …",
    ],
    guidance: [
      "Start with a greeting and a polite request.",
      "Name one main dish and one drink.",
      "Close the conversation with a thank you.",
    ],
  },
  {
    id: "a1-self-introduction",
    level: "A1",
    title: "Sich vorstellen",
    scenario: "Du lernst eine neue Person kennen. Stelle dich in drei Sätzen vor.",
    instructions:
      "Introduce yourself aloud. Share your name, where you live, and one favourite activity.",
    keyPhrases: [
      "Ich heiße …",
      "Ich wohne in …",
      "Ich mag …",
    ],
    guidance: [
      "Smile and speak slowly.",
      "Use simple present tense verbs.",
    ],
  },
  {
    id: "a2-shopping-dialogue",
    level: "A2",
    title: "Einkaufsgespräch",
    scenario:
      "Du bist in einem Geschäft und suchst eine Jacke. Der Verkäufer fragt: ‘Kann ich Ihnen helfen?’",
    instructions:
      "Respond to the shop assistant. Explain what you are looking for, ask about the price, and decide whether to buy it.",
    keyPhrases: [
      "Ich suche …",
      "Wie viel kostet …?",
      "Ich nehme sie / Ich schaue noch weiter.",
    ],
    guidance: [
      "Mention colour or size to add detail.",
      "React to the price with a short opinion.",
    ],
  },
  {
    id: "a2-weekend-story",
    level: "A2",
    title: "Vom Wochenende erzählen",
    scenario: "Ein Freund fragt dich: ‘Was hast du am Wochenende gemacht?’",
    instructions:
      "Tell your friend about your weekend. Mention two activities, who you were with, and how it was.",
    keyPhrases: [
      "Am Samstag …",
      "Mit meinen Freunden …",
      "Es war …",
    ],
    guidance: [
      "Use past tense (Perfekt) for key actions.",
      "Add an emotion such as toll, anstrengend, entspannend.",
    ],
  },
  {
    id: "b1-job-interview",
    level: "B1",
    title: "Vorstellungsgespräch",
    scenario:
      "Du bist in einem Vorstellungsgespräch. Der Interviewer sagt: ‘Erzählen Sie mir etwas über Ihre Erfahrungen.’",
    instructions:
      "Talk about your experience. Summarise your previous role, mention two responsibilities, and connect them to the new job.",
    keyPhrases: [
      "In meiner letzten Stelle …",
      "Ich war verantwortlich für …",
      "Ich möchte diese Erfahrung nutzen, um …",
    ],
    guidance: [
      "Structure your answer with Anfang - Mitte - Abschluss.",
      "Highlight one strength that fits the role.",
    ],
  },
  {
    id: "b1-travel-problem",
    level: "B1",
    title: "Reiseproblem lösen",
    scenario:
      "Im Zug merkst du, dass dein Sitzplatz besetzt ist. Sprich mit der anderen Person, um das Problem zu lösen.",
    instructions:
      "Politely explain the situation, show your ticket, suggest a solution, and thank the person.",
    keyPhrases: [
      "Entschuldigung, ich glaube …",
      "Hier ist mein Ticket.",
      "Könnten wir …?",
    ],
    guidance: [
      "Bleibe ruhig und höflich.",
      "Schlage eine Alternative vor (z.B. Plätze tauschen).",
    ],
  },
  {
    id: "b2-team-presentation",
    level: "B2",
    title: "Teampräsentation halten",
    scenario:
      "Du präsentierst deinem Team ein neues Projekt. Alle warten auf eine kurze Übersicht.",
    instructions:
      "Deliver a short briefing: introduce the project goal, outline two key tasks, and invite questions.",
    keyPhrases: [
      "Unser Ziel ist …",
      "Das Projekt besteht aus …",
      "Habt ihr Fragen dazu?",
    ],
    guidance: [
      "Sprich klar und strukturiert (Einleitung, Hauptteil, Abschluss).",
      "Nutze verbindende Wörter wie zuerst, außerdem, abschließend.",
    ],
  },
  {
    id: "b2-debate-opinion",
    level: "B2",
    title: "Meinung in einer Diskussion vertreten",
    scenario:
      "In einer Lerngruppe diskutiert ihr über Home-Office. Du sollst deine Meinung begründen.",
    instructions:
      "Express your opinion, give one benefit and one drawback, and end with a balanced conclusion.",
    keyPhrases: [
      "Meiner Meinung nach …",
      "Ein Vorteil ist …",
      "Trotzdem denke ich, dass …",
    ],
    guidance: [
      "Nutze mindestens ein Verbindungswort wie weil, aber, obwohl.",
      "Schließe mit einer Einladung zur weiteren Diskussion.",
    ],
  },
];

export function getSpeakingLevels(): SpeakingLevel[] {
  return ["A1", "A2", "B1", "B2"];
}

export function getSpeakingTopics() {
  return speakingTopics;
}

export function getSpeakingTopicsByLevel(level: SpeakingLevel) {
  return speakingTopics.filter((topic) => topic.level === level);
}

export function getSpeakingTopic(level: SpeakingLevel, id: string) {
  return speakingTopics.find((topic) => topic.level === level && topic.id === id);
}

export function getSpeakingTopicParams() {
  return speakingTopics.map((topic) => ({ level: topic.level, id: topic.id }));
}
