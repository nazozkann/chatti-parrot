export type LearnedWord = {
  wordId: string;
  de: string;
  en: string | null;
  tr: string | null;
  artikel: string | null;
  plural: string | null;
  level: string;
  totalAttempts: number;
  successCount: number;
  successRate: number;
  lastAttemptAt: string | null;
  group: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    level: string;
  };
};

export type WordGroupStat = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: string;
  averageRate: number;
  wordCount: number;
  totalAttempts: number;
  successCount: number;
  words: LearnedWord[];
};
