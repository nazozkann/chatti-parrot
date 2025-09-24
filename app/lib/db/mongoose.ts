import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DB = process.env.MONGODB_DB || "test";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in .env");
}

let isConnected = false;

export async function dbConnect() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
    });
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    throw error;
  }
}
