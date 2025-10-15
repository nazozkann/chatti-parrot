import { Schema, model, models, type Model } from "mongoose";

type VocabularyTranslationSchema = {
  locale: string;
  value: string;
};

export type VocabularyEntryDocument = {
  unitSlug: string;
  sectionSlug: string;
  sectionId: string;
  milestoneId: string;
  word: string;
  translations: VocabularyTranslationSchema[];
  audioUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const VocabularyEntrySchema = new Schema<VocabularyEntryDocument>(
  {
    unitSlug: { type: String, required: true, index: true },
    sectionSlug: { type: String, required: true, index: true },
    sectionId: { type: String, required: true, index: true },
    milestoneId: { type: String, required: true, index: true },
    word: { type: String, required: true },
    translations: [
      {
        locale: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    audioUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

VocabularyEntrySchema.index(
  { unitSlug: 1, sectionSlug: 1, milestoneId: 1, word: 1 },
  { unique: true }
);

const VocabularyEntryModel: Model<VocabularyEntryDocument> =
  models.VocabularyEntry ||
  model<VocabularyEntryDocument>("VocabularyEntry", VocabularyEntrySchema);

export default VocabularyEntryModel;
