import { Schema, Document, models, model } from "mongoose";

export const AVATARS = [
  "fox",
  "bear",
  "owl",
  "cat",
  "dog",
  "panda",
  "penguin",
  "tiger",
] as const;
export type Avatar = (typeof AVATARS)[number];

export interface IUser extends Document {
  email: string;
  name?: string;
  hashedPassword?: string;

  firstName?: string;
  lastName?: string;
  username?: string;
  age?: number;
  learningLanguages?: string[];
  knownLanguages?: string[];
  avatar?: Avatar;

  roles: string[];
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, index: true, required: true },
    name: String,
    hashedPassword: String,

    firstName: String,
    lastName: String,
    username: { type: String, unique: true, sparse: true, index: true },
    age: Number,
    learningLanguages: { type: [String], default: [] },
    knownLanguages: { type: [String], default: [] },
    avatar: { type: String, enum: AVATARS, default: "fox" },

    roles: { type: [String], default: ["student"] },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
