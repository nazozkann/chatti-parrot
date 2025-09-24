import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/db/mongoose";
import { User } from "@/app/models/User";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const u = (searchParams.get("u") || "").toLowerCase().trim();
  if (!u)
    return NextResponse.json({ ok: false, reason: "empty" }, { status: 400 });
  const exists = await User.findOne({ username: u }).lean();
  return NextResponse.json({ ok: !exists });
}
