import mongoose, { Schema, Document, Types } from "mongoose";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface IWord extends Document {
  de: string;
  en?: string;
  tr?: string;
  artikel?: "der" | "die" | "das";
  plural?: string;
  examples?: string[];
  level: CEFRLevel;
  group: Types.ObjectId;
}

const WordSchema = new Schema<IWord>(
  {
    de: { type: String, required: true, trim: true },
    en: { type: String, trim: true },
    tr: { type: String, trim: true },
    artikel: { type: String, enum: ["der", "die", "das"] },
    plural: { type: String, trim: true },
    examples: [{ type: String }],
    level: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      required: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "WordGroup",
      required: true,
    },
  },
  { timestamps: true }
);

WordSchema.index({ level: 1, group: 1, de: 1 }, { unique: true });

export const Word =
  mongoose.models.Word || mongoose.model<IWord>("Word", WordSchema);
