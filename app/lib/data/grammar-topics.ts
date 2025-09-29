export const GRAMMAR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type GrammarLevel = (typeof GRAMMAR_LEVELS)[number];

export type GrammarTopicSummary = {
  level: GrammarLevel;
  slug: string;
  title: string;
  summary: string;
  estimatedTime: string;
  focus: string[];
};

export type GrammarConceptCard = {
  label: string;
  suffix: string;
  description: string;
  example: string;
};

export type GrammarTable = {
  title: string;
  caption?: string;
  headers: string[];
  rows: string[][];
};

export type GrammarExample = {
  heading: string;
  description?: string;
  sentences: {
    de: string;
    tr: string;
    note?: string;
  }[];
};

export type GrammarTopicDetail = GrammarTopicSummary & {
  introduction: string[];
  learningGoals: string[];
  conceptCards: GrammarConceptCard[];
  tables: GrammarTable[];
  walkthrough: {
    title: string;
    body: string[];
  }[];
  examples: GrammarExample[];
  practiceIdeas: string[];
};

type GrammarCatalog = Record<GrammarLevel, GrammarTopicDetail[]>;

function toSummary(topic: GrammarTopicDetail): GrammarTopicSummary {
  const { level, slug, title, summary, estimatedTime, focus } = topic;
  return { level, slug, title, summary, estimatedTime, focus: [...focus] };
}

const grammarCatalog: GrammarCatalog = {
  A1: [
    {
      level: "A1",
      slug: "verb-konjugation",
      title: "Verb Conjugation",
      summary: "Conjugate regular verbs correctly for each personal pronoun.",
      estimatedTime: "15 min",
      focus: ["personal pronouns", "-e/-st/-t/-en endings", "key word pattern"],
      introduction: [
        "At A1 level you need to know how the verb changes with the subject. In German the stem usually stays the same; you attach specific endings for each pronoun.",
        "In this lesson you will practice separating the verb stem, matching pronouns quickly, and using the basic endings for regular verbs. By the end you will build everyday sentences with accurate conjugations.",
      ],
      learningGoals: [
        "Recognize the pronouns ich, du, er/sie/es, wir, ihr, sie/Sie.",
        "Identify the verb stem and add the appropriate personal endings.",
        "Form everyday expressions with the correct conjugation.",
      ],
      conceptCards: [
        {
          label: "ich",
          suffix: "-e",
          description: "First person singular verbs usually end with -e.",
          example: "ich spiele",
        },
        {
          label: "du",
          suffix: "-st",
          description: "Add -st to the stem for the second person singular.",
          example: "du spielst",
        },
        {
          label: "er / sie / es",
          suffix: "-t",
          description: "All third person singular forms share the ending -t.",
          example: "er spielt",
        },
        {
          label: "wir",
          suffix: "-en",
          description: "First person plural keeps the infinitive ending -en.",
          example: "wir spielen",
        },
        {
          label: "ihr",
          suffix: "-t",
          description: "Second person plural also uses the ending -t.",
          example: "ihr spielt",
        },
        {
          label: "sie / Sie",
          suffix: "-en",
          description: "Third person plural and formal Sie use the infinitive ending -en.",
          example: "sie spielen",
        },
      ],
      tables: [
        {
          title: "Regular verb conjugation: spielen",
          caption: "Keep the stem (spiel-) and add the correct ending for each pronoun.",
          headers: ["Pronoun", "Verb", "English meaning"],
          rows: [
            ["ich", "ich spiele", "I play"],
            ["du", "du spielst", "you play"],
            ["er / sie / es", "er spielt", "he/she/it plays"],
            ["wir", "wir spielen", "we play"],
            ["ihr", "ihr spielt", "you (plural) play"],
            ["sie / Sie", "sie spielen", "they/you (formal) play"],
          ],
        },
      ],
      walkthrough: [
        {
          title: "Step 1 - Find the verb stem",
          body: [
            "Start with the infinitive of the verb you want to conjugate. For example, *lernen* ends with -en.",
            "Remove the -en or -n ending to get the stem: *lern-*.",
          ],
        },
        {
          title: "Step 2 - Choose the ending from the pronoun table",
          body: [
            "Look up the subject pronoun in the table and note the ending you need to add to the stem.",
            "For example, the pronoun *du* takes the ending -st: *du lernst*.",
          ],
        },
        {
          title: "Step 3 - Check sound patterns",
          body: [
            "If the stem ends in s, ß, x, or z, the *du* form usually only needs -t: *du heißt*.",
            "If the stem ends in -t or -d, add an extra -e before the ending to make it easier to pronounce: *du arbeitest*, *er wartet*.",
          ],
        },
      ],
      examples: [
        {
          heading: "Daily routine",
          description: "Build simple sentences with regular verbs.",
          sentences: [
            {
              de: "Ich lerne Deutsch und du lernst Englisch.",
              tr: "I learn German and you learn English.",
              note: "ich → -e, du → -st",
            },
            {
              de: "Er arbeitet in Berlin und wir arbeiten in Köln.",
              tr: "He works in Berlin and we work in Cologne.",
            },
          ],
        },
        {
          heading: "Questions",
          sentences: [
            {
              de: "Wann spielt ihr Fußball?",
              tr: "When do you play soccer?",
            },
            {
              de: "Lernen Sie heute oder morgen?",
              tr: "Are you studying today or tomorrow?",
              note: "Sie (formal) → -en",
            },
          ],
        },
      ],
      practiceIdeas: [
        "Choose three regular verbs you like and build a conjugation table for every pronoun.",
        "Write a short paragraph about your day, using a different pronoun in each sentence.",
        "Create pronoun cards, draw one at random, and conjugate a verb out loud with that pronoun.",
      ],
    },
    {
      level: "A1",
      slug: "personalpronomen-nominativ",
      title: "Personal Pronouns – Nominative",
      summary: "Recognize German subject pronouns and use them in simple sentences.",
      estimatedTime: "10 min",
      focus: ["subject pronouns", "ich/du/er", "wir/ihr/sie"],
      introduction: [
        "Subject pronouns replace the person or thing doing the action. In the nominative case they tell you who the subject of the sentence is.",
        "Mastering these short words makes it easier to follow conversations and to combine them with correctly conjugated verbs.",
      ],
      learningGoals: [
        "Memorize the nominative pronouns ich, du, er/sie/es, wir, ihr, sie/Sie.",
        "Choose the correct pronoun based on who performs the action.",
        "Form basic subject + verb sentences with each pronoun.",
      ],
      conceptCards: [
        {
          label: "ich",
          suffix: "I",
          description: "Use when you are the subject of the sentence.",
          example: "Ich heiße Lara.",
        },
        {
          label: "du",
          suffix: "you (singular)",
          description: "Informal form for addressing one person you know well.",
          example: "Du wohnst in Berlin.",
        },
        {
          label: "er / sie / es",
          suffix: "he / she / it",
          description: "Third person singular forms for people, objects, or ideas.",
          example: "Sie arbeitet viel.",
        },
        {
          label: "wir",
          suffix: "we",
          description: "Use when you talk about yourself together with others.",
          example: "Wir lernen Deutsch.",
        },
        {
          label: "ihr",
          suffix: "you (plural)",
          description: "Informal plural form when addressing several people.",
          example: "Ihr spielt Fußball.",
        },
        {
          label: "sie / Sie",
          suffix: "they / you (formal)",
          description: "Lowercase sie means 'they'; capitalized Sie is the formal 'you'.",
          example: "Sie kommen morgen.",
        },
      ],
      tables: [
        {
          title: "Personal pronouns in the nominative",
          caption: "Match each pronoun with its English meaning and typical use.",
          headers: ["Pronoun", "English", "Typical use"],
          rows: [
            ["ich", "I", "Talking about yourself"],
            ["du", "you (singular)", "Informal address to one person"],
            ["er", "he", "Referring to a male person"],
            ["sie", "she", "Referring to a female person"],
            ["es", "it", "Objects, concepts, or neuter nouns"],
            ["wir", "we", "Group including yourself"],
            ["ihr", "you (plural)", "Informal address to several people"],
            ["sie", "they", "Talking about several people"],
            ["Sie", "you (formal)", "Polite address to one or more people"],
          ],
        },
      ],
      walkthrough: [
        {
          title: "Step 1 - Identify the subject",
          body: [
            "Look at who performs the action in the sentence.",
            "Is it I, you, or another person? This tells you which pronoun you need.",
          ],
        },
        {
          title: "Step 2 - Choose the matching pronoun",
          body: [
            "Pick the pronoun that fits the subject's number and level of formality.",
            "Remember that Sie with a capital letter is formal and always uses the same verb form as sie (they).",
          ],
        },
        {
          title: "Step 3 - Combine with a verb",
          body: [
            "Add the correctly conjugated verb after the pronoun.",
            "Read the full sentence aloud to check if it sounds natural.",
          ],
        },
      ],
      examples: [
        {
          heading: "Everyday life",
          description: "Subject pronouns in simple statements.",
          sentences: [
            {
              de: "Ich trinke Kaffee und du trinkst Tee.",
              tr: "I drink coffee and you drink tea.",
            },
            {
              de: "Er fährt zur Arbeit, aber wir bleiben zu Hause.",
              tr: "He drives to work, but we stay at home.",
            },
          ],
        },
        {
          heading: "Questions",
          sentences: [
            {
              de: "Wer seid ihr?",
              tr: "Who are you (plural)?",
            },
            {
              de: "Sind Sie Herr Müller?",
              tr: "Are you Mr Müller?",
            },
          ],
        },
      ],
      practiceIdeas: [
        "Write five sentences about your friends using different pronouns.",
        "Create flashcards with German pronouns on one side and English meanings on the other.",
        "Record yourself reading the pronoun chart to get comfortable with pronunciation.",
      ],
    },
  ],
  A2: [],
  B1: [],
  B2: [],
  C1: [],
  C2: [],
};

export function listGrammarLevels(): GrammarLevel[] {
  return GRAMMAR_LEVELS;
}

export function listGrammarTopics(): GrammarTopicSummary[] {
  return Object.values(grammarCatalog)
    .flat()
    .map(toSummary)
    .sort((a, b) => {
      if (a.level === b.level) {
        return a.title.localeCompare(b.title, "tr");
      }
      return GRAMMAR_LEVELS.indexOf(a.level) - GRAMMAR_LEVELS.indexOf(b.level);
    });
}

export function listGrammarTopicsByLevel(level: GrammarLevel): GrammarTopicSummary[] {
  const topics = grammarCatalog[level] ?? [];
  return topics.map(toSummary);
}

export function getGrammarTopic(level: string, slug: string): GrammarTopicDetail | null {
  if (!level) return null;
  const normalizedLevel = level.toUpperCase() as GrammarLevel;
  if (!GRAMMAR_LEVELS.includes(normalizedLevel)) {
    return null;
  }
  const topics = grammarCatalog[normalizedLevel] ?? [];
  const topic = topics.find((entry) => entry.slug === slug);
  return topic ?? null;
}

export function getGrammarLevelMap(): { level: GrammarLevel; topics: GrammarTopicSummary[] }[] {
  return GRAMMAR_LEVELS.map((level) => ({
    level,
    topics: listGrammarTopicsByLevel(level),
  }));
}

export function getGrammarTopicPaths(): { level: GrammarLevel; slug: string }[] {
  return GRAMMAR_LEVELS.flatMap((level) =>
    grammarCatalog[level]?.map((topic) => ({ level, slug: topic.slug })) ?? []
  );
}
