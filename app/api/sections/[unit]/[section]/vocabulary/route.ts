import { NextRequest, NextResponse } from "next/server";

import DialogueExerciseModel from "@/app/models/DialogueExercise";
import VocabularyEntryModel from "@/app/models/VocabularyEntry";
import UserSectionProgressModel from "@/app/models/UserSectionProgress";
import UserVocabularyStatModel from "@/app/models/UserVocabularyStat";
import {
  findSectionContent,
  type VocabularyTranslation,
} from "@/app/timeline/section-content";
import { dbConnect } from "@/app/lib/db/mongoose";
import { getCurrentUserId } from "@/lib/current-user";

type RouteParams = {
  params: {
    unit: string;
    section: string;
  };
};

type IncomingEntryPayload = {
  word: string;
  translations: VocabularyTranslation[];
  audioUrl?: string | null;
};

type DialogueLinePayload = {
  speaker: string;
  text: string;
};

type IncomingDialoguePayload = {
  lines: DialogueLinePayload[];
  answers: string[];
  options: string[];
};

function isValidTranslation(value: unknown): value is VocabularyTranslation {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as VocabularyTranslation).locale === "string" &&
    typeof (value as VocabularyTranslation).value === "string"
  );
}

function isIncomingEntry(value: unknown): value is IncomingEntryPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as IncomingEntryPayload;
  if (typeof candidate.word !== "string") {
    return false;
  }

  if (!Array.isArray(candidate.translations)) {
    return false;
  }

  return candidate.translations.every(isValidTranslation);
}

function isDialogueLine(value: unknown): value is DialogueLinePayload {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as DialogueLinePayload).speaker === "string" &&
    typeof (value as DialogueLinePayload).text === "string"
  );
}

function isIncomingDialogue(value: unknown): value is IncomingDialoguePayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as IncomingDialoguePayload;
  if (!Array.isArray(candidate.lines) || !candidate.lines.every(isDialogueLine)) {
    return false;
  }

  if (
    !Array.isArray(candidate.answers) ||
    !candidate.answers.every((item) => typeof item === "string")
  ) {
    return false;
  }

  if (
    !Array.isArray(candidate.options) ||
    !candidate.options.every((item) => typeof item === "string")
  ) {
    return false;
  }

  return true;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const milestoneId = request.nextUrl.searchParams.get("milestoneId");

  if (!milestoneId) {
    return NextResponse.json(
      { error: "milestoneId parametresi zorunludur." },
      { status: 400 }
    );
  }

  const section = findSectionContent(params.unit, params.section);
  if (!section) {
    return NextResponse.json(
      { error: "İstenen bölüm bulunamadı." },
      { status: 404 }
    );
  }

  const milestone = section.milestones.find(
    (item) => item.id === milestoneId && item.type === "vocabulary"
  );

  if (!milestone) {
    return NextResponse.json(
      { error: "İstenen milestone bulunamadı." },
      { status: 404 }
    );
  }

  await dbConnect();

  const vocabularyEntries = await VocabularyEntryModel.find({
    unitSlug: params.unit,
    sectionSlug: params.section,
    milestoneId,
  })
    .sort({ createdAt: 1 })
    .lean();

  const dialogueDocs = await DialogueExerciseModel.find({
    unitSlug: params.unit,
    sectionSlug: params.section,
    milestoneId,
  })
    .sort({ createdAt: 1 })
    .lean();

  const currentUserId = getCurrentUserId();
  const vocabIds = vocabularyEntries.map((entry) => entry._id);

  const statsDocs = vocabIds.length
    ? await UserVocabularyStatModel.find({
        userId: currentUserId,
        vocabId: { $in: vocabIds },
      }).lean()
    : [];

  const stats = vocabularyEntries.reduce<Record<string, { correctCount: number; wrongCount: number; lastReviewedAt: string | null }>>(
    (acc, entry) => {
      acc[entry._id.toString()] = {
        correctCount: 0,
        wrongCount: 0,
        lastReviewedAt: null,
      };
      return acc;
    },
    {}
  );

  for (const stat of statsDocs) {
    stats[stat.vocabId.toString()] = {
      correctCount: stat.correctCount,
      wrongCount: stat.wrongCount,
      lastReviewedAt: stat.lastReviewedAt ? stat.lastReviewedAt.toISOString() : null,
    };
  }

  const progressDoc = await UserSectionProgressModel.findOne({
    userId: currentUserId,
    sectionId: section.id,
  }).lean();

  const progress = progressDoc
    ? {
        completedMilestones: progressDoc.completedMilestones,
        completedAt: progressDoc.completedAt
          ? progressDoc.completedAt.toISOString()
          : null,
      }
    : {
        completedMilestones: [],
        completedAt: null,
      };

  return NextResponse.json({
    section: {
      id: section.id,
      title: section.title,
      summary: section.summary,
    },
    milestone: {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      estimatedDuration: milestone.estimatedDuration,
    },
    entries: vocabularyEntries.map((entry) => ({
      id: entry._id.toString(),
      word: entry.word,
      translations: entry.translations,
      audioUrl: entry.audioUrl ?? null,
    })),
    dialogues: dialogueDocs.map((dialogue) => ({
      id: dialogue._id.toString(),
      lines: (dialogue.lines ?? []).map((line) => ({
        speaker: line.speaker ?? "",
        text: line.text ?? "",
      })),
      answers: dialogue.answers ?? [],
      options: dialogue.options ?? [],
    })),
    stats,
    progress,
  });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const payload = await request.json();
  const { milestoneId, entries, dialogues } = payload ?? {};

  if (
    !milestoneId ||
    ((!Array.isArray(entries) || entries.length === 0) &&
      (!Array.isArray(dialogues) || dialogues.length === 0))
  ) {
    return NextResponse.json(
      {
        error:
          "milestoneId alanı ve en az bir entries veya dialogues kaydı zorunludur.",
      },
      { status: 400 }
    );
  }

  const section = findSectionContent(params.unit, params.section);
  if (!section) {
    return NextResponse.json(
      { error: "İstenen bölüm bulunamadı." },
      { status: 404 }
    );
  }

  const milestone = section.milestones.find(
    (item) => item.id === milestoneId && item.type === "vocabulary"
  );

  if (!milestone) {
    return NextResponse.json(
      { error: "Milestone bu bölüme ait değil." },
      { status: 400 }
    );
  }

  await dbConnect();

  const entryOperations = Array.isArray(entries)
    ? (entries as unknown[])
        .filter(isIncomingEntry)
        .map((entry) => ({
          updateOne: {
            filter: {
              unitSlug: params.unit,
              sectionSlug: params.section,
              milestoneId,
              word: entry.word.trim(),
            },
            update: {
              $set: {
                unitSlug: params.unit,
                sectionSlug: params.section,
                sectionId: section.id,
                milestoneId,
                word: entry.word.trim(),
                translations: entry.translations.map((translation) => ({
                  locale: translation.locale,
                  value: translation.value,
                })),
                audioUrl: entry.audioUrl ?? null,
              },
            },
            upsert: true,
          },
        }))
    : [];

  const dialogueOperations = Array.isArray(dialogues)
    ? (dialogues as unknown[])
        .filter(isIncomingDialogue)
        .map((dialogue, index) => ({
          updateOne: {
            filter: {
              unitSlug: params.unit,
              sectionSlug: params.section,
              milestoneId,
              order: index,
            },
            update: {
              $set: {
                unitSlug: params.unit,
                sectionSlug: params.section,
                sectionId: section.id,
                milestoneId,
                lines: dialogue.lines.map((line) => ({
                  speaker: line.speaker.trim(),
                  text: line.text.trim(),
                })),
                answers: dialogue.answers.map((answer) => answer.trim()),
                options: dialogue.options.map((option) => option.trim()),
                order: index,
              },
            },
            upsert: true,
          },
        }))
    : [];

  if (!entryOperations.length && !dialogueOperations.length) {
    return NextResponse.json(
      { error: "Geçerli formatta veri bulunamadı." },
      { status: 400 }
    );
  }

  if (entryOperations.length) {
    await VocabularyEntryModel.bulkWrite(entryOperations, { ordered: false });
  }

  if (dialogueOperations.length) {
    await DialogueExerciseModel.bulkWrite(dialogueOperations, { ordered: false });
  }

  const [updatedEntries, updatedDialogues] = await Promise.all([
    VocabularyEntryModel.find({
      unitSlug: params.unit,
      sectionSlug: params.section,
      milestoneId,
    })
      .sort({ createdAt: 1 })
      .lean(),
    DialogueExerciseModel.find({
      unitSlug: params.unit,
      sectionSlug: params.section,
      milestoneId,
    })
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  return NextResponse.json({
    entries: updatedEntries.map((entry) => ({
      id: entry._id.toString(),
      word: entry.word,
      translations: entry.translations,
      audioUrl: entry.audioUrl ?? null,
    })),
    dialogues: updatedDialogues.map((dialogue) => ({
      id: dialogue._id.toString(),
      lines: (dialogue.lines ?? []).map((line) => ({
        speaker: line.speaker ?? "",
        text: line.text ?? "",
      })),
      answers: dialogue.answers ?? [],
      options: dialogue.options ?? [],
    })),
  });
}
