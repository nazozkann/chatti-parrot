import { Schema, model, models, type Model } from "mongoose";

type DialogueLineSchema = {
  speaker: string;
  text: string;
};

export type DialogueExerciseDocument = {
  unitSlug: string;
  sectionSlug: string;
  sectionId: string;
  milestoneId: string;
  lines: DialogueLineSchema[];
  answers: string[];
  options: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

const DialogueExerciseSchema = new Schema<DialogueExerciseDocument>(
  {
    unitSlug: { type: String, required: true, index: true },
    sectionSlug: { type: String, required: true, index: true },
    sectionId: { type: String, required: true, index: true },
    milestoneId: { type: String, required: true, index: true },
    lines: [
      {
        speaker: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    answers: [{ type: String, required: true }],
    options: [{ type: String, required: true }],
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

DialogueExerciseSchema.index(
  { unitSlug: 1, sectionSlug: 1, milestoneId: 1, order: 1 },
  { name: "dialogue_order_index" }
);

const DialogueExerciseModel: Model<DialogueExerciseDocument> =
  models.DialogueExercise ||
  model<DialogueExerciseDocument>("DialogueExercise", DialogueExerciseSchema);

export default DialogueExerciseModel;
