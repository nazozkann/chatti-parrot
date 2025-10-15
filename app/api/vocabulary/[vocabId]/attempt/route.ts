import { NextRequest, NextResponse } from "next/server";

import VocabularyEntryModel from "@/app/models/VocabularyEntry";
import UserVocabularyStatModel from "@/app/models/UserVocabularyStat";
import { dbConnect } from "@/app/lib/db/mongoose";
import { getCurrentUserId } from "@/lib/current-user";

type RouteParams = {
  params: {
    vocabId: string;
  };
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { result, sectionId, milestoneId } = await request.json();
  const outcome = result === "correct" ? "correct" : "incorrect";

  await dbConnect();

  const entry = await VocabularyEntryModel.findById(params.vocabId).lean();

  if (!entry) {
    return NextResponse.json(
      { error: "Kelime bulunamadı." },
      { status: 404 }
    );
  }

  if (
    (sectionId && entry.sectionId !== sectionId) ||
    (milestoneId && entry.milestoneId !== milestoneId)
  ) {
    return NextResponse.json(
      { error: "Kelime istenen dersle eşleşmiyor." },
      { status: 400 }
    );
  }

  const currentUserId = getCurrentUserId();

  const statDoc = await UserVocabularyStatModel.findOneAndUpdate(
    { userId: currentUserId, vocabId: entry._id },
    {
      $setOnInsert: {
        userId: currentUserId,
        vocabId: entry._id,
      },
      $inc:
        outcome === "correct"
          ? { correctCount: 1 }
          : { wrongCount: 1 },
      $set: {
        lastReviewedAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  ).lean();

  const responseStat = {
    correctCount: statDoc?.correctCount ?? 0,
    wrongCount: statDoc?.wrongCount ?? 0,
    lastReviewedAt: statDoc?.lastReviewedAt
      ? statDoc.lastReviewedAt.toISOString()
      : null,
  };

  return NextResponse.json({
    vocabId: params.vocabId,
    stat: responseStat,
  });
}
