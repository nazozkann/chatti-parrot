export type WritingLevel = "A1" | "A2" | "B1" | "B2";

export type WritingTopic = {
  id: string;
  level: WritingLevel;
  title: string;
  summary: string;
  prompt: string;
  guidance?: string[];
};

const writingTopics: WritingTopic[] = [
  {
    id: "a1-introduce-yourself",
    level: "A1",
    title: "Stell dich vor",
    summary: "Kısa cümlelerle kendini ve günlük hayatını tanıt.",
    prompt:
      "Introduce yourself in German. Tell your name, where you live, what you like, and one daily routine.",
    guidance: [
      "Begin with a greeting (Hallo, Ich heiße …)",
      "Mention your age and where you come from",
      "Add two sentences about hobbies or favourite things",
      "Finish with a simple closing sentence",
    ],
  },
  {
    id: "a1-favorite-food",
    level: "A1",
    title: "Lieblingsessen",
    summary: "En sevdiğin yemeği ve neden sevdiğini anlat.",
    prompt:
      "Describe your favourite food. Include its name, ingredients, when you eat it, and why you like it.",
    guidance: [
      "Name the dish and where it comes from",
      "Explain what ingredients it has",
      "Tell when you usually eat it",
      "End with a sentence about why it is special for you",
    ],
  },
  {
    id: "a2-weekend-plans",
    level: "A2",
    title: "Wochenendpläne",
    summary: "Bu hafta sonu planlarını ve kiminle yapacağını yaz.",
    prompt:
      "Write about your weekend plans. Explain what you will do, with whom, and how you feel about it.",
    guidance: [
      "Start with when and where your plan happens",
      "Describe two or three activities",
      "Mention who joins you and why",
      "Share how you feel and what you expect",
    ],
  },
  {
    id: "a2-daily-routine",
    level: "A2",
    title: "Mein Tagesablauf",
    summary: "Günlük programını saatlerle birlikte yaz.",
    prompt:
      "Describe your daily routine with times. Include morning, afternoon and evening habits.",
    guidance: [
      "Use adverbs like morgens, nachmittags, abends",
      "Include at least one school or work activity",
      "Add a sentence about something you want to change",
    ],
  },
  {
    id: "b1-moving-to-new-city",
    level: "B1",
    title: "Neue Stadt, neues Leben",
    summary: "Yeni bir şehre taşınma deneyimini anlat.",
    prompt:
      "You recently moved to a new city. Describe why you moved, your first impressions, challenges, and what you enjoy so far.",
    guidance: [
      "Explain the reason for moving",
      "Describe two impressions (positive or negative)",
      "Mention a challenge and how you handle it",
      "End with your hopes for the next months",
    ],
  },
  {
    id: "b1-healthy-habits",
    level: "B1",
    title: "Gesunde Gewohnheiten",
    summary: "Sağlıklı kalmak için yaptığın şeyleri paylaş.",
    prompt:
      "Write about your healthy habits. Include food, exercise, rest, and how you stay motivated.",
    guidance: [
      "Give examples of meals or routines",
      "Describe a challenge and a solution",
      "Explain why these habits matter to you",
    ],
  },
  {
    id: "b2-cultural-event",
    level: "B2",
    title: "Kulturelle Erfahrung",
    summary: "Katıldığın kültürel bir etkinliği detaylandır.",
    prompt:
      "Describe a cultural event you attended. Share context, people involved, highlights, and what you learned.",
    guidance: [
      "Set the scene: when, where, who",
      "Explain two memorable moments",
      "Reflect on what surprised you",
      "Conclude with the impact on you",
    ],
  },
  {
    id: "b2-technology-impact",
    level: "B2",
    title: "Technologie im Alltag",
    summary: "Teknolojinin günlük yaşamına etkilerini tartış.",
    prompt:
      "Discuss how technology impacts your daily life. Provide advantages, disadvantages, and personal examples.",
    guidance: [
      "Compare past and present habits",
      "Give one positive and one negative impact",
      "Suggest how you balance technology use",
    ],
  },
];

export function getWritingLevels(): WritingLevel[] {
  return ["A1", "A2", "B1", "B2"];
}

export function getWritingTopics() {
  return writingTopics;
}

export function getWritingTopicsByLevel(level: WritingLevel) {
  return writingTopics.filter((topic) => topic.level === level);
}

export function getWritingTopic(level: WritingLevel, id: string) {
  return writingTopics.find((topic) => topic.level === level && topic.id === id);
}

export function getWritingTopicParams() {
  return writingTopics.map((topic) => ({ level: topic.level, id: topic.id }));
}
