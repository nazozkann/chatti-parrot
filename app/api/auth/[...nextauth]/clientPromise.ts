import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

const clientPromise: Promise<MongoClient> = (() => {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
})();

export default clientPromise;
