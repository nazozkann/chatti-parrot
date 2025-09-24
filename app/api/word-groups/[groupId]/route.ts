import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { dbConnect } from "@/app/lib/db/mongoose";
import { Word } from "@/app/models/Word";
import { WordGroup } from "@/app/models/WordGroup";
import { normalizeLevel, slugify } from "@/app/api/word-groups/utils";

const OBJECT_ID_ERROR = { error: "Invalid groupId", details: { groupId: "Malformed ObjectId" } };

function validateGroupId(groupId: string) {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return false;
  }
  return true;
}

/**
 * @openapi
 * /api/word-groups/{groupId}:
 *   get:
 *     summary: Retrieve a word group
 *     tags: [Word Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeWords
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Word group retrieved
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/WordGroup'
 *                 - $ref: '#/components/schemas/WordGroupWithWords'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Word group not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(req: Request, { params }: { params: { groupId: string } }) {
  try {
    await dbConnect();
    const { groupId } = params;
    if (!validateGroupId(groupId)) {
      return NextResponse.json(OBJECT_ID_ERROR, { status: 400 });
    }

    const includeWords = new URL(req.url).searchParams.get("includeWords") === "true";

    const group = await WordGroup.findById(groupId).lean();
    if (!group) {
      return NextResponse.json({ error: "Group not found", details: null }, { status: 404 });
    }

    if (!includeWords) {
      return NextResponse.json(group);
    }

    const words = await Word.find({ group: group._id }).sort({ de: 1 }).lean();
    return NextResponse.json({ ...group, words });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to retrieve group";
    return NextResponse.json({ error: message, details: null }, { status: 500 });
  }
}

/**
 * @openapi
 * /api/word-groups/{groupId}:
 *   put:
 *     summary: Update a word group
 *     tags: [Word Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/WordGroupUpdate' }
 *     responses:
 *       200:
 *         description: Word group updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/WordGroup' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Word group not found
 *       409:
 *         description: Word group slug already exists
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function PUT(req: Request, { params }: { params: { groupId: string } }) {
  await dbConnect();
  const { groupId } = params;

  if (!validateGroupId(groupId)) {
    return NextResponse.json(OBJECT_ID_ERROR, { status: 400 });
  }

  try {
    const body = await req.json();
    const update: Record<string, unknown> = {};

    if (body.name) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          { error: "Invalid payload", details: { name: "Must be a non-empty string" } },
          { status: 400 }
        );
      }
      update.name = body.name.trim();
    }

    if (body.slug) {
      if (typeof body.slug !== "string" || !body.slug.trim()) {
        return NextResponse.json(
          { error: "Invalid payload", details: { slug: "Must be a non-empty string" } },
          { status: 400 }
        );
      }
      const slug = slugify(body.slug);
      if (!slug) {
        return NextResponse.json(
          { error: "Invalid payload", details: { slug: "Unable to derive slug" } },
          { status: 400 }
        );
      }
      update.slug = slug;
    }

    if (body.description !== undefined) {
      if (body.description !== null && typeof body.description !== "string") {
        return NextResponse.json(
          {
            error: "Invalid payload",
            details: { description: "Must be a string or null" },
          },
          { status: 400 }
        );
      }
      update.description = body.description ? body.description.trim() : undefined;
    }

    if (body.level) {
      const level = normalizeLevel(body.level);
      if (!level) {
        return NextResponse.json(
          { error: "Invalid payload", details: { level: "Unsupported level" } },
          { status: 400 }
        );
      }
      update.level = level;
    }

    const group = await WordGroup.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found", details: null }, { status: 404 });
    }

    const levelHasChanged =
      update.level && update.level !== group.level ? (update.level as string) : null;

    if (update.slug && update.slug !== group.slug) {
      const existingWithSlug = await WordGroup.findOne({
        _id: { $ne: group._id },
        slug: update.slug,
      }).lean();
      if (existingWithSlug) {
        return NextResponse.json(
          { error: "Group already exists", details: { slug: update.slug } },
          { status: 409 }
        );
      }
    }

    Object.assign(group, update);
    await group.save();

    if (levelHasChanged) {
      await Word.updateMany({ group: group._id }, { level: levelHasChanged });
    }

    return NextResponse.json(group);
  } catch (err: unknown) {
    console.error(`PUT /api/word-groups/${groupId} error:`, err);
    const message = err instanceof Error ? err.message : "Failed to update group";
    return NextResponse.json({ error: message, details: null }, { status: 500 });
  }
}

/**
 * @openapi
 * /api/word-groups/{groupId}:
 *   delete:
 *     summary: Delete a word group
 *     tags: [Word Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Word group removed and associated words reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deletedGroup:
 *                   type: boolean
 *                   example: true
 *                 removedWords:
 *                   type: integer
 *                   example: 12
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Word group not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { groupId: string } }
) {
  await dbConnect();
  const { groupId } = params;

  if (!validateGroupId(groupId)) {
    return NextResponse.json(OBJECT_ID_ERROR, { status: 400 });
  }

  try {
    const group = await WordGroup.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found", details: null }, { status: 404 });
    }

    const result = await Word.deleteMany({ group: group._id });
    await group.deleteOne();

    return NextResponse.json({ deletedGroup: true, removedWords: result.deletedCount ?? 0 });
  } catch (err: unknown) {
    console.error(`DELETE /api/word-groups/${groupId} error:`, err);
    const message = err instanceof Error ? err.message : "Failed to delete group";
    return NextResponse.json({ error: message, details: null }, { status: 500 });
  }
}
