import { Document, Schema, models, model } from "mongoose";

export interface IUserWordStat extends Document {
  user: Schema.Types.ObjectId;
  word: Schema.Types.ObjectId;
  totalAttempts: number;
  successCount: number;
  lastAttemptAt: Date;
}

const UserWordStatSchema = new Schema<IUserWordStat>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    word: { type: Schema.Types.ObjectId, ref: "Word", required: true, index: true },
    totalAttempts: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    lastAttemptAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserWordStatSchema.index({ user: 1, word: 1 }, { unique: true });

export const UserWordStat =
  models.UserWordStat || model<IUserWordStat>("UserWordStat", UserWordStatSchema);
