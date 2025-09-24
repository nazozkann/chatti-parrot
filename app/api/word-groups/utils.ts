import mongoose from "mongoose";

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Level = (typeof LEVELS)[number];

export function slugify(input: string) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeLevel(level: unknown): Level | null {
  if (!level || typeof level !== "string") return null;
  const upper = level.toUpperCase();
  return LEVELS.includes(upper as Level) ? (upper as Level) : null;
}

export function assertValidObjectId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectId");
  }
}
