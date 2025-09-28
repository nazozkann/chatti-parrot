import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/app/lib/db/mongoose";
import { UserWordStat } from "@/app/models/UserWordStat";
import { Word } from "@/app/models/Word";

type ResultType = "correct" | "incorrect";

const VALID_RESULTS = new Set<ResultType>(["correct", "incorrect"]);

/**
 * @openapi
 * /api/user/progress:
 *   post:
 *     summary: Kelime çalışma sonucunu kaydet
 *     description: Kullanıcının bir kelime alıştırmasındaki sonucunu kaydeder ve istatistikleri günceller.
 *     tags: [User Progress]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UserProgressPayload' }
 *     responses:
 *       200:
 *         description: Kayıt başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *               required: [ok]
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Kelime bulunamadı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             examples:
 *               missingWord:
 *                 summary: Kelime kaydı yok
 *                 value: { error: 'Word not found', details: null }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", details: null }, { status: 401 });
    }

    const payload = (await request.json().catch(() => null)) as
      | { wordId?: unknown; result?: unknown }
      | null;

    const wordId = typeof payload?.wordId === "string" ? payload.wordId : null;
    const result = typeof payload?.result === "string" ? (payload.result as ResultType) : null;

    if (!wordId || !Types.ObjectId.isValid(wordId) || !result || !VALID_RESULTS.has(result)) {
      return NextResponse.json(
        { error: "Invalid payload", details: null },
        { status: 400 }
      );
    }

    await dbConnect();

    const wordExists = await Word.exists({ _id: wordId });
    if (!wordExists) {
      return NextResponse.json({ error: "Word not found", details: null }, { status: 404 });
    }

    const isSuccess = result === "correct";

    await UserWordStat.findOneAndUpdate(
      { user: session.user.id, word: wordId },
      {
        $inc: {
          totalAttempts: 1,
          successCount: isSuccess ? 1 : 0,
        },
        $set: { lastAttemptAt: new Date() },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record progress";
    return NextResponse.json(
      { error: message, details: null },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/user/progress:
 *   get:
 *     summary: Kullanıcının kelime ilerlemesini getir
 *     description: Oturum açmış kullanıcının çalıştığı kelimeler ve başarı oranlarını listeler.
 *     tags: [User Progress]
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserProgressResponse' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", details: null }, { status: 401 });
    }

    await dbConnect();

    const stats = await UserWordStat.find({ user: session.user.id })
      .populate({
        path: "word",
        select: "de en tr artikel plural level",
        model: Word,
      })
      .sort({ lastAttemptAt: -1 })
      .lean();

    const learnedWords = stats
      .filter((entry) => entry.word && entry.totalAttempts > 0)
      .map((entry) => {
        const successRate =
          entry.totalAttempts > 0
            ? Math.round((entry.successCount / entry.totalAttempts) * 100)
            : 0;

        return {
          wordId: entry.word._id.toString(),
          de: entry.word.de,
          en: entry.word.en ?? null,
          tr: entry.word.tr ?? null,
          artikel: entry.word.artikel ?? null,
          plural: entry.word.plural ?? null,
          level: entry.word.level,
          totalAttempts: entry.totalAttempts,
          successCount: entry.successCount,
          successRate,
          lastAttemptAt: entry.lastAttemptAt,
        };
      })
      .sort((a, b) => b.successRate - a.successRate || b.totalAttempts - a.totalAttempts);

    return NextResponse.json({ learnedWords });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load progress";
    return NextResponse.json(
      { error: message, details: null },
      { status: 500 }
    );
  }
}
