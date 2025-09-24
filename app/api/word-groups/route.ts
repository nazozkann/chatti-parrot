import { NextResponse } from "next/server";

import { dbConnect } from "@/app/lib/db/mongoose";
import { Word } from "@/app/models/Word";
import { WordGroup } from "@/app/models/WordGroup";
import { normalizeLevel, slugify } from "@/app/api/word-groups/utils";

type CreatePayload = {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  level?: unknown;
};

/**
 * @openapi
 * /api/word-groups:
 *   get:
 *     summary: List word groups
 *     tags: [Word Groups]
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [A1, A2, B1, B2, C1, C2]
 *       - in: query
 *         name: includeWords
 *         schema:
 *           type: boolean
 *         description: When true, includes the words that belong to the group
 *     responses:
 *       200:
 *         description: Word groups fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/WordGroup'
 *                   - $ref: '#/components/schemas/WordGroupWithWords'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const levelParam = searchParams.get("level");
    const includeWords = searchParams.get("includeWords") === "true";

    const level = normalizeLevel(levelParam);
    if (levelParam && !level) {
      return NextResponse.json(
        { error: "Invalid level", details: { level: "Unsupported level" } },
        { status: 400 }
      );
    }

    const match: Record<string, unknown> = {};
    if (level) match.level = level;

    const groups = await WordGroup.find(match)
      .sort({ level: 1, name: 1 })
      .lean();

    if (!includeWords) {
      return NextResponse.json(groups);
    }

    const groupIds = groups.map((group) => group._id);
    const words = await Word.find({ group: { $in: groupIds } })
      .sort({ level: 1, de: 1 })
      .lean();

    const byGroup = new Map<string, typeof words>();
    for (const word of words) {
      const key = word.group.toString();
      if (!byGroup.has(key)) {
        byGroup.set(key, []);
      }
      byGroup.get(key)!.push(word);
    }

    const result = groups.map((group) => ({
      ...group,
      words: byGroup.get(group._id.toString()) ?? [],
    }));

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to list groups";
    return NextResponse.json({ error: message, details: null }, { status: 500 });
  }
}

/**
 * @openapi
 * /api/word-groups:
 *   post:
 *     summary: Create a word group
 *     tags: [Word Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/WordGroupCreate' }
 *     responses:
 *       201:
 *         description: Word group created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/WordGroup' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: Word group already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = (await req.json()) as CreatePayload;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json(
        { error: "Invalid payload", details: { name: "Required" } },
        { status: 400 }
      );
    }

    const level = normalizeLevel(body.level);
    if (!level) {
      return NextResponse.json(
        { error: "Invalid payload", details: { level: "Required" } },
        { status: 400 }
      );
    }

    const description =
      typeof body.description === "string" ? body.description.trim() : undefined;

    const providedSlug =
      typeof body.slug === "string" && body.slug.trim() ? body.slug : undefined;
    const slug = slugify(providedSlug ?? name);
    if (!slug) {
      return NextResponse.json(
        { error: "Invalid payload", details: { slug: "Unable to derive slug" } },
        { status: 400 }
      );
    }

    const existing = await WordGroup.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Group already exists", details: { slug } },
        { status: 409 }
      );
    }

    const group = await WordGroup.create({ name, slug, description, level });
    return NextResponse.json(group, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/word-groups error:", err);
    const message = err instanceof Error ? err.message : "Failed to create group";
    return NextResponse.json({ error: message, details: null }, { status: 500 });
  }
}
