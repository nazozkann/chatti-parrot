import "server-only";

import { Types } from "mongoose";

import { dbConnect } from "@/app/lib/db/mongoose";
import { Word, type IWord } from "@/app/models/Word";
import { WordGroup, type IWordGroup } from "@/app/models/WordGroup";

export type WordGroupSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
};

export type WordEntry = {
  id: string;
  de: string;
  en?: string;
  tr?: string;
  artikel?: string;
  plural?: string;
  examples: string[];
};

export type WordGroupDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: string;
  words: WordEntry[];
};

function normalizeDate(value: Date | string | undefined): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

export async function getWordGroupsWithCounts(): Promise<WordGroupSummary[]> {
  await dbConnect();

  const groups = (await WordGroup.find({})
    .sort({ level: 1, name: 1 })
    .lean<
      IWordGroup & { _id: Types.ObjectId; createdAt?: Date; updatedAt?: Date }
    >()
    .exec()) as unknown as (IWordGroup & {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  })[];

  const counts = (await Word.aggregate<{
    _id: Types.ObjectId | null;
    wordCount: number;
  }>([{ $group: { _id: "$group", wordCount: { $sum: 1 } } }]).exec()) as {
    _id: Types.ObjectId | null;
    wordCount: number;
  }[];

  const countMap = new Map<string, number>();
  for (const entry of counts) {
    if (!entry._id) continue;
    countMap.set(entry._id.toString(), entry.wordCount);
  }

  return groups.map((group) => ({
    id: String(group._id),
    name: group.name,
    slug: group.slug,
    description: group.description ?? null,
    level: group.level,
    wordCount: countMap.get(String(group._id)) ?? 0,
    createdAt: normalizeDate(group.createdAt),
    updatedAt: normalizeDate(group.updatedAt),
  }));
}

export async function getWordGroupBySlug(
  slug: string
): Promise<WordGroupDetail | null> {
  await dbConnect();

  const group = (await WordGroup.findOne({ slug })
    .lean<IWordGroup & { _id: Types.ObjectId }>()
    .exec()) as (IWordGroup & { _id: Types.ObjectId }) | null;
  if (!group) return null;

  const words = (await Word.find({ group: group._id })
    .sort({ createdAt: 1, _id: 1 })
    .lean<IWord & { _id: Types.ObjectId }>()
    .exec()) as unknown as (IWord & { _id: Types.ObjectId })[];

  return {
    id: String(group._id),
    name: group.name,
    slug: group.slug,
    description: group.description ?? null,
    level: group.level,
    words: words.map((word) => ({
      id: String(word._id),
      de: word.de,
      en: word.en ?? undefined,
      tr: word.tr ?? undefined,
      artikel: word.artikel ?? undefined,
      plural: word.plural ?? undefined,
      examples: Array.isArray(word.examples)
        ? word.examples.filter(Boolean)
        : [],
    })),
  };
}
