import { NextRequest, NextResponse } from "next/server";

import UserSectionProgressModel from "@/app/models/UserSectionProgress";
import { findSectionContent } from "@/app/timeline/section-content";
import { dbConnect } from "@/app/lib/db/mongoose";
import { getCurrentUserId } from "@/lib/current-user";

type RouteParams = {
  params: {
    unit: string;
    section: string;
  };
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { milestoneId } = await request.json();

  if (!milestoneId) {
    return NextResponse.json(
      { error: "milestoneId alanı zorunludur." },
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

  const milestoneExists = section.milestones.some(
    (item) => item.id === milestoneId
  );

  if (!milestoneExists) {
    return NextResponse.json(
      { error: "Milestone bu bölüme ait değil." },
      { status: 400 }
    );
  }

  await dbConnect();

  const currentUserId = getCurrentUserId();
  const totalMilestones = section.milestones.length;

  let progressDoc = await UserSectionProgressModel.findOneAndUpdate(
    { userId: currentUserId, sectionId: section.id },
    {
      $setOnInsert: {
        completedMilestones: [],
        completedAt: null,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  if (!progressDoc.completedMilestones.includes(milestoneId)) {
    progressDoc.completedMilestones.push(milestoneId);
  }

  if (
    progressDoc.completedMilestones.length === totalMilestones &&
    !progressDoc.completedAt
  ) {
    progressDoc.completedAt = new Date();
  }

  progressDoc = await progressDoc.save();

  return NextResponse.json({
    progress: {
      completedMilestones: progressDoc.completedMilestones,
      completedAt: progressDoc.completedAt
        ? progressDoc.completedAt.toISOString()
        : null,
    },
  });
}
