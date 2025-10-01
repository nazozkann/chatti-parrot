import mongoose, { type ConnectOptions } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
const MONGODB_DB = process.env.MONGODB_DB || "test";

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in .env");
}

const connectionOptions: ConnectOptions = {
  dbName: MONGODB_DB,
  serverSelectionTimeoutMS: 12_000,
};

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, connectionOptions).then((mongooseInstance) => {
      console.log("✅ MongoDB connected successfully");
      return mongooseInstance;
    }).catch((error) => {
      cached.promise = null;
      console.error("❌ MongoDB connection failed", error);
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
