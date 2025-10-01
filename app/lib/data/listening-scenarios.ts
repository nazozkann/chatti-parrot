export type ListeningLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type ListeningSegment = {
  id: string;
  type: "dialogue" | "narration";
  speaker?: string;
  text: string;
  direction?: "left" | "right";
};

export type ListeningScenario = {
  id: string;
  level: ListeningLevel;
  title: string;
  theme: string;
  description: string;
  estimatedTime: string;
  focus: string[];
  segments: ListeningSegment[];
};

const listeningScenarios: ListeningScenario[] = [
  {
    id: "a1-cafe-morning",
    level: "A1",
    title: "Frühstück im Café",
    theme: "Alltag",
    description:
      "Lukas und Anna bestellen in einem Berliner Café ihr Frühstück und planen den Vormittag.",
    estimatedTime: "4 Minuten",
    focus: ["Höfliche Fragen", "Bestellen"],
    segments: [
      {
        id: "s1",
        type: "dialogue",
        speaker: "Lukas",
        direction: "left",
        text: "Guten Morgen! Können wir bitte die Frühstückskarte sehen?",
      },
      {
        id: "s2",
        type: "dialogue",
        speaker: "Servicekraft",
        direction: "right",
        text: "Natürlich, hier ist die Karte. Möchten Sie zuerst Kaffee oder Tee?",
      },
      {
        id: "s3",
        type: "dialogue",
        speaker: "Anna",
        direction: "left",
        text: "Ich nehme einen Cappuccino, bitte. Lukas, was möchtest du?",
      },
      {
        id: "s4",
        type: "dialogue",
        speaker: "Lukas",
        direction: "left",
        text: "Für mich einen schwarzen Kaffee. Und können wir zwei Croissants bekommen?",
      },
      {
        id: "s5",
        type: "dialogue",
        speaker: "Servicekraft",
        direction: "right",
        text: "Sehr gern. Soll ich auch frischen Orangensaft bringen?",
      },
      {
        id: "s6",
        type: "dialogue",
        speaker: "Anna",
        direction: "left",
        text: "Das klingt gut, bitte zwei Gläser. Lukas, hast du später Zeit für den Markt?",
      },
      {
        id: "s7",
        type: "dialogue",
        speaker: "Lukas",
        direction: "left",
        text: "Ja, nach dem Frühstück können wir dorthin spazieren. Ich brauche noch Gemüse fürs Abendessen.",
      },
      {
        id: "s8",
        type: "dialogue",
        speaker: "Servicekraft",
        direction: "right",
        text: "Ihr Frühstück kommt sofort. Wenn Sie etwas brauchen, geben Sie einfach Bescheid.",
      },
      {
        id: "s9",
        type: "narration",
        text: "Ein paar Minuten später duftet der Tisch nach frischen Croissants, Cappuccino und Orangensaft. Lukas schaut auf die Uhr, während Anna den Tagesplan in ihr Notizbuch schreibt.",
      },
      {
        id: "s10",
        type: "dialogue",
        speaker: "Anna",
        direction: "left",
        text: "Ich möchte den Bus um zehn nehmen. Dann haben wir genug Zeit für den Markt und den Buchladen.",
      },
      {
        id: "s11",
        type: "dialogue",
        speaker: "Lukas",
        direction: "left",
        text: "Perfekt. Ich höre gerade die Durchsage, dass die Linie heute pünktlich ist. Lass uns das Frühstück genießen!",
      },
    ],
  },
];

export function getListeningScenarios() {
  return listeningScenarios;
}

export function getFeaturedListeningScenario() {
  return listeningScenarios[0];
}

export function getListeningScenarioById(id: string) {
  return listeningScenarios.find((scenario) => scenario.id === id);
}

export function getListeningScenarioParams() {
  return listeningScenarios.map((scenario) => ({ id: scenario.id }));
}
