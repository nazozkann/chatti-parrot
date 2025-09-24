import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db/mongoose";
import { Word } from "@/app/models/Word";
import { WordGroup } from "@/app/models/WordGroup";
import { normalizeLevel } from "@/app/api/word-groups/utils";

import mongoose from "mongoose";

const ARTIKEL_VALUES = ["der", "die", "das"] as const;
type Artikel = (typeof ARTIKEL_VALUES)[number];

function isMongooseValidationError(
  e: unknown
): e is mongoose.Error.ValidationError {
  return e instanceof mongoose.Error.ValidationError;
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
 * /api/words:
 *   get:
 *     summary: List vocabulary words
 *     tags: [Words]
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [A1, A2, B1, B2, C1, C2]
 *         description: Filter words by CEFR level
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: Filter words by group ObjectId
 *       - in: query
 *         name: includeGroup
 *         schema:
 *           type: boolean
 *         description: Populate group metadata for the word
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Word' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");
    const groupId = searchParams.get("groupId");
    const includeGroup = searchParams.get("includeGroup") === "true";

    const filter: Record<string, unknown> = {};
    if (level) {
      const normalizedLevel = normalizeLevel(level);
      if (!normalizedLevel) {
        return NextResponse.json(
          { error: "Invalid level", details: { level: "Unsupported level" } },
          { status: 400 }
        );
      }
      filter.level = normalizedLevel;
    }

    if (groupId) {
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return NextResponse.json(
          { error: "Invalid groupId", details: { groupId: "Malformed ObjectId" } },
          { status: 400 }
        );
      }
      filter.group = groupId;
    }

    let query = Word.find(filter).sort({ level: 1, de: 1 });
    if (includeGroup) {
      query = query.populate("group");
    }

    const words = await query.lean();
    return NextResponse.json(words);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "List failed";
    return NextResponse.json(
      { error: message, details: null },
      { status: 500 }
    );
  }
}
/**
 * @openapi
 * /api/words:
 *   post:
 *     summary: Yeni kelime oluştur
 *     tags: [Words]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/WordCreate' }
 *     responses:
 *       201:
 *         description: Oluşturuldu
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Word' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Word group not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();

    if (!body?.de || typeof body.de !== "string" || !body.de.trim()) {
      return NextResponse.json(
        { error: "Invalid payload", details: { de: "Required" } },
        { status: 400 }
      );
    }

    const normalizedLevel = normalizeLevel(body?.level);
    if (!normalizedLevel) {
      const detailMessage = body?.level ? "Unsupported level" : "Required";
      return NextResponse.json(
        { error: "Invalid payload", details: { level: detailMessage } },
        { status: 400 }
      );
    }

    if (!body?.groupId || typeof body.groupId !== "string") {
      return NextResponse.json(
        { error: "Invalid payload", details: { groupId: "Required" } },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(body.groupId)) {
      return NextResponse.json(
        { error: "Invalid payload", details: { groupId: "Malformed ObjectId" } },
        { status: 400 }
      );
    }

    const group = await WordGroup.findById(body.groupId);
    if (!group) {
      return NextResponse.json(
        { error: "Group not found", details: { groupId: body.groupId } },
        { status: 404 }
      );
    }

    if (group.level !== normalizedLevel) {
      return NextResponse.json(
        {
          error: "Level mismatch",
          details: { level: "Word level must match group level" },
        },
        { status: 400 }
      );
    }

    const exists = await Word.findOne({
      de: body.de.trim(),
      group: group._id,
    });
    if (exists) {
      return NextResponse.json(
        { error: "Word already exists", details: null },
        { status: 422 }
      );
    }

    let artikel: Artikel | undefined;
    if (body.artikel !== undefined && body.artikel !== null) {
      if (typeof body.artikel !== "string") {
        return NextResponse.json(
          { error: "Invalid payload", details: { artikel: "Must be a string" } },
          { status: 400 }
        );
      }
      const normalizedArtikel = body.artikel.toLowerCase();
      if (!ARTIKEL_VALUES.includes(normalizedArtikel as Artikel)) {
        return NextResponse.json(
          { error: "Invalid payload", details: { artikel: "Unsupported value" } },
          { status: 400 }
        );
      }
      artikel = normalizedArtikel as Artikel;
    }

    if (body.examples !== undefined) {
      const normalizedExamples = filterExamples(body.examples);
      if (normalizedExamples === null) {
        return NextResponse.json(
          { error: "Invalid payload", details: { examples: "Must be an array of strings" } },
          { status: 400 }
        );
      }
      body.examples = normalizedExamples;
    }

    const payload = {
      de: body.de.trim(),
      en: typeof body.en === "string" && body.en.trim() ? body.en.trim() : undefined,
      tr: typeof body.tr === "string" && body.tr.trim() ? body.tr.trim() : undefined,
      artikel,
      plural:
        typeof body.plural === "string" && body.plural.trim()
          ? body.plural.trim()
          : undefined,
      examples: Array.isArray(body.examples) ? body.examples : undefined,
      level: normalizedLevel,
      group: group._id,
    };

    const word = await Word.create(payload);
    return NextResponse.json(word, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/words error:", err);

    if (isMongooseValidationError(err)) {
      const details = Object.fromEntries(
        Object.entries(err.errors).map(([key, val]) => {
          const v = val as
            | mongoose.Error.ValidatorError
            | mongoose.Error.CastError;
          return [key, v.message];
        })
      );

      return NextResponse.json(
        { error: "Validation failed", details },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json(
      { error: message, details: null },
      { status: 500 }
    );
  }
}
