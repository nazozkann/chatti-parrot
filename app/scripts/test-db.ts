import "dotenv/config";
import { dbConnect } from "../lib/db/mongoose.ts";

async function main() {
  try {
    await dbConnect();
    console.log("Test script: MongoDB bağlantısı başarılı!");
  } catch (err) {
    console.error("Test script: MongoDB bağlantısı hatalı:", err);
  } finally {
    process.exit(0);
  }
}

main();
