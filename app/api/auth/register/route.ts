import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db/mongoose";
import { User } from "@/app/models/User";
import bcrypt from "bcryptjs";

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Üye ol (email/kullanıcı adı/şifre)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               username: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               age: { type: number }
 *               learningLanguages: { type: array, items: { type: string } }
 *               knownLanguages: { type: array, items: { type: string } }
 *               avatar: { type: string, enum: [fox,bear,owl,cat,dog,panda,penguin,tiger] }
 *     responses:
 *       201: { description: Oluşturuldu }
 *       400: { description: Eksik alanlar }
 *       422: { description: Email/Kullanıcı adı kullanılıyor }
 *       500: { description: Sunucu hatası }
 */

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();

    const {
      email,
      password,
      firstName,
      lastName,
      username,
      age,
      learningLanguages = [],
      knownLanguages = [],
      avatar = "fox",
    } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedUsername =
      typeof username === "string"
        ? username
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_\.]/g, "")
        : undefined;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 422 }
      );
    }

    if (normalizedUsername) {
      const existingUsername = await User.findOne({
        username: normalizedUsername,
      });
      if (existingUsername) {
        return NextResponse.json(
          { error: "This username is already taken." },
          { status: 422 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const created = await User.create({
      email,
      hashedPassword,
      firstName,
      lastName,
      username: normalizedUsername,
      age,
      learningLanguages,
      knownLanguages,
      avatar,
      roles: ["student"],
    });

    return NextResponse.json(
      { id: created._id, email: created.email, username: created.username },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("REGISTER error:", err);
    return NextResponse.json(
      { error: (err as Error)?.message ?? "Register failed" },
      { status: 500 }
    );
  }
}
