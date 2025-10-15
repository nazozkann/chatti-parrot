import { Schema, model, models, type Model } from "mongoose";

export type UserVocabularyStatDocument = {
  userId: string;
  vocabId: string;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const UserVocabularyStatSchema = new Schema<UserVocabularyStatDocument>(
  {
    userId: { type: String, required: true, index: true },
    vocabId: { type: Schema.Types.ObjectId, ref: "VocabularyEntry", required: true, index: true },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    lastReviewedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

UserVocabularyStatSchema.index({ userId: 1, vocabId: 1 }, { unique: true });

const UserVocabularyStatModel: Model<UserVocabularyStatDocument> =
  models.UserVocabularyStat ||
  model<UserVocabularyStatDocument>("UserVocabularyStat", UserVocabularyStatSchema);

export default UserVocabularyStatModel;
