export type VocabularyTranslation = {
  locale: string;
  value: string;
};

export type VocabularyEntry = {
  id: string;
  word: string;
  audioHint?: string;
  translations: VocabularyTranslation[];
};

export type VocabularyMilestone = {
  id: string;
  type: "vocabulary";
  title: string;
  description: string;
  estimatedDuration: string;
};

export type SectionMilestone = VocabularyMilestone;

export type SectionContent = {
  id: string;
  unitSlug: string;
  topicIndex: number;
  slug: string;
  title: string;
  summary: string;
  milestones: SectionMilestone[];
};

export const SECTION_CONTENT: SectionContent[] = [
  {
    id: "section-a1-1-01",
    unitSlug: "a1-1",
    topicIndex: 0,
    slug: "selamlasma-ve-vedalas",
    title: "Selamlaşma ve Vedalaşma Cümleleri",
    summary:
      "Almanca selamlaşma ve vedalaşma kalıplarını, tonlamalarını ve en yaygın kullanımları öğren.",
    milestones: [
      {
        id: "milestone-a1-1-01-vocab",
        type: "vocabulary",
        title: "Temel Selamlaşma Kelimeleri",
        description:
          "Karşılaştığın ilk kişiyle kendinden emin bir şekilde selamlaşabilmek için kelimeleri dinle, anlamlarını incele ve telaffuzunu tekrar et.",
        estimatedDuration: "5 dakika",
      },
    ],
  },
];

export function findSectionContent(unitSlug: string, sectionSlug: string) {
  return SECTION_CONTENT.find(
    (section) => section.unitSlug === unitSlug && section.slug === sectionSlug
  );
}

export function findSectionByTopicIndex(unitSlug: string, topicIndex: number) {
  return SECTION_CONTENT.find(
    (section) => section.unitSlug === unitSlug && section.topicIndex === topicIndex
  );
}
