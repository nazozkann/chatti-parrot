import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/app/lib/db/mongoose";
import { User } from "@/app/models/User";

function composeDisplayName(user: {
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
}) {
  if (user.name && user.name.trim()) return user.name.trim();
  const composed = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  if (composed) return composed;
  return user.username ?? null;
}

/**
 * @openapi
 * /api/user/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User profile payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
    const userDoc = await User.findById(session.user.id).lean();

    if (!userDoc) {
      return NextResponse.json({ error: "User not found", details: null }, { status: 404 });
    }

    const profile = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      name: composeDisplayName(userDoc),
      username: userDoc.username ?? null,
      firstName: userDoc.firstName ?? null,
      lastName: userDoc.lastName ?? null,
      avatar: userDoc.avatar ?? "fox",
      roles: userDoc.roles ?? ["student"],
      learningLanguages: userDoc.learningLanguages ?? [],
      knownLanguages: userDoc.knownLanguages ?? [],
    };

    return NextResponse.json(profile);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load profile";
    return NextResponse.json(
      { error: message, details: null },
      { status: 500 }
    );
  }
}
