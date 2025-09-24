import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { dbConnect } from "@/app/lib/db/mongoose";
import { Word } from "@/app/models/Word";
import { WordGroup } from "@/app/models/WordGroup";
import { normalizeLevel } from "@/app/api/word-groups/utils";

type UpdatePayload = {
  de?: unknown;
  en?: unknown;
  tr?: unknown;
  artikel?: unknown;
  plural?: unknown;
  examples?: unknown;
  level?: unknown;
  groupId?: unknown;
};

const ARTIKEL_VALUES = ["der", "die", "das"] as const;

type Artikel = (typeof ARTIKEL_VALUES)[number];

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

function filterExamples(examples: unknown): string[] | null {
  if (examples === null) return [];
  if (!Array.isArray(examples)) return null;
  const filtered = examples
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
  return filtered;
}

/**
 * @openapi
 * /api/words/{wordId}:
 *   get:
 *     summary: Retrieve a single word
 *     tags: [Words]
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeGroup
 *         schema:
 *           type: boolean
 *         description: When true, populates the related group document
 *     responses:
 *       200:
 *         description: Word retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Word' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Word not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(req: Request, { params }: { params: { wordId: string } }) {
  const { wordId } = params;
  if (!isValidObjectId(wordId)) {
    return NextResponse.json(
      { error: "Invalid wordId", details: { wordId: "Malformed ObjectId" } },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const includeGroup = new URL(req.url).searchParams.get("includeGroup") === "true";
    let query = Word.findById(wordId);
    if (includeGroup) {
      query = query.populate("group");
    }
    const word = await query.lean();
    if (!word) {
      return NextResponse.json({ error: "Word not found", details: null }, { status: 404 });
    }

    return NextResponse.json(word);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch word";
    return NextResponse.json({ error: message, details: null }, { status: 500 });
  }
}

/**
 * @openapi
 * /api/words/{wordId}:
 *   put:
 *     summary: Update an existing word
 *     tags: [Words]
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/WordUpdate' }
 *     responses:
 *       200:
 *         description: Word updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Word' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Word or group not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Conflict with existing word in the target group
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function PUT(req: Request, { params }: { params: { wordId: string } }) {
  const { wordId } = params;
  if (!isValidObjectId(wordId)) {
    return NextResponse.json(
      { error: "Invalid wordId", details: { wordId: "Malformed ObjectId" } },
      { status: 400 }
    );
  }

  await dbConnect();
  const existing = await Word.findById(wordId);
  if (!existing) {
    return NextResponse.json({ error: "Word not found", details: null }, { status: 404 });
  }

  try {
    const body = (await req.json()) as UpdatePayload;
    const update: Record<string, unknown> = {};

    if (body.de !== undefined) {
      if (typeof body.de !== "string" || !body.de.trim()) {
        return NextResponse.json(
          { error: "Invalid payload", details: { de: "Must be a non-empty string" } },
          { status: 400 }
        );
      }
      update.de = body.de.trim();
    }

    if (body.en !== undefined) {
      if (body.en !== null && typeof body.en !== "string") {
        return NextResponse.json(
          { error: "Invalid payload", details: { en: "Must be a string or null" } },
          { status: 400 }
        );
      }
      update.en = body.en ? body.en.trim() : undefined;
    }

    if (body.tr !== undefined) {
      if (body.tr !== null && typeof body.tr !== "string") {
        return NextResponse.json(
          { error: "Invalid payload", details: { tr: "Must be a string or null" } },
          { status: 400 }
        );
      }
      update.tr = body.tr ? body.tr.trim() : undefined;
    }

    if (body.plural !== undefined) {
      if (body.plural !== null && typeof body.plural !== "string") {
        return NextResponse.json(
          { error: "Invalid payload", details: { plural: "Must be a string or null" } },
          { status: 400 }
        );
      }
      update.plural = body.plural ? body.plural.trim() : undefined;
    }

    if (body.artikel !== undefined) {
      if (body.artikel !== null && typeof body.artikel !== "string") {
        return NextResponse.json(
          { error: "Invalid payload", details: { artikel: "Must be a string or null" } },
          { status: 400 }
        );
      }
      const artikel = body.artikel?.toString().toLowerCase();
      if (artikel && !ARTIKEL_VALUES.includes(artikel as Artikel)) {
        return NextResponse.json(
          { error: "Invalid payload", details: { artikel: "Unsupported value" } },
          { status: 400 }
        );
      }
      update.artikel = artikel ?? undefined;
    }

    if (body.examples !== undefined) {
      const examples = filterExamples(body.examples);
      if (examples === null) {
        return NextResponse.json(
          { error: "Invalid payload", details: { examples: "Must be an array of strings" } },
          { status: 400 }
        );
      }
      update.examples = examples ?? [];
    }

    const requestedLevel =
      body.level !== undefined ? normalizeLevel(body.level) : existing.level;
    if (body.level !== undefined && !requestedLevel) {
      return NextResponse.json(
        { error: "Invalid payload", details: { level: "Unsupported level" } },
        { status: 400 }
      );
    }

    const requestedGroupIdRaw =
      body.groupId !== undefined ? body.groupId : existing.group.toString();
    const requestedGroupId =
      typeof requestedGroupIdRaw === "string" ? requestedGroupIdRaw.trim() : requestedGroupIdRaw;

    if (typeof requestedGroupId !== "string" || !isValidObjectId(requestedGroupId)) {
      return NextResponse.json(
        { error: "Invalid payload", details: { groupId: "Malformed ObjectId" } },
        { status: 400 }
      );
    }

    const group = await WordGroup.findById(requestedGroupId);
    if (!group) {
      return NextResponse.json(
        { error: "Group not found", details: { groupId: requestedGroupId } },
        { status: 404 }
      );
    }

    const targetLevel = requestedLevel ?? group.level;
    if (group.level !== targetLevel) {
      return NextResponse.json(
        {
          error: "Level mismatch",
          details: { level: "Word level must match group level" },
        },
        { status: 400 }
      );
    }

    update.level = targetLevel;
    update.group = group._id;

    const deForUniq = (update.de as string | undefined) ?? existing.de;
    const duplicate = await Word.findOne({
      _id: { $ne: existing._id },
      de: deForUniq,
      group: group._id,
    }).lean();

    if (duplicate) {
      return NextResponse.json(
        { error: "Word already exists in group", details: { de: deForUniq } },
        { status: 409 }
      );
    }

    Object.assign(existing, update);
    await existing.save();

    return NextResponse.json(existing);
  } catch (err: unknown) {
    console.error(`PUT /api/words/${wordId} error:`, err);
    const message = err instanceof Error ? err.message : "Failed to update word";
    return NextResponse.json({ error: message, details: null }, { status: 500 });
  }
}

/**
 * @openapi
 * /api/words/{wordId}:
 *   delete:
 *     summary: Delete a word
 *     tags: [Words]
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Word deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:
 *                   type: boolean
 *                   example: true
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Word not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { wordId: string } }
) {
  const { wordId } = params;
  if (!isValidObjectId(wordId)) {
    return NextResponse.json(
      { error: "Invalid wordId", details: { wordId: "Malformed ObjectId" } },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const result = await Word.findByIdAndDelete(wordId);
    if (!result) {
      return NextResponse.json({ error: "Word not found", details: null }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch (err: unknown) {
    console.error(`DELETE /api/words/${wordId} error:`, err);
    const message = err instanceof Error ? err.message : "Failed to delete word";
    return NextResponse.json({ error: message, details: null }, { status: 500 });
  }
}
