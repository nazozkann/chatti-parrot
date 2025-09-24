import mongoose, { Schema, Document } from "mongoose";
import type { CEFRLevel } from "@/app/models/Word";

export interface IWordGroup extends Document {
  name: string;
  slug: string;
  description?: string;
  level: CEFRLevel;
}

const WordGroupSchema = new Schema<IWordGroup>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true },
    level: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      required: true,
    },
  },
  { timestamps: true }
);

WordGroupSchema.index({ slug: 1 }, { unique: true });
WordGroupSchema.index({ level: 1, name: 1 }, { unique: true });

export const WordGroup =
  mongoose.models.WordGroup || mongoose.model<IWordGroup>("WordGroup", WordGroupSchema);
