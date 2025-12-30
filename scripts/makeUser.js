// scripts/makeUser.js
import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run make:user -- <email>");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    const res = await User.updateOne({ email }, { $set: { role: "user" } });
    console.log("Update result:", res);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
