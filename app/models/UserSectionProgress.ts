import { Schema, model, models, type Model } from "mongoose";

export type UserSectionProgressDocument = {
  userId: string;
  sectionId: string;
  completedMilestones: string[];
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const UserSectionProgressSchema = new Schema<UserSectionProgressDocument>(
  {
    userId: { type: String, required: true, index: true },
    sectionId: { type: String, required: true, index: true },
    completedMilestones: { type: [String], default: [] },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

UserSectionProgressSchema.index({ userId: 1, sectionId: 1 }, { unique: true });

const UserSectionProgressModel: Model<UserSectionProgressDocument> =
  models.UserSectionProgress ||
  model<UserSectionProgressDocument>("UserSectionProgress", UserSectionProgressSchema);

export default UserSectionProgressModel;
