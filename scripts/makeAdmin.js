// scripts/makeAdmin.js
import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run make:admin -- user@example.com");
  process.exit(1);
}

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGODB_URI in .env");
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOneAndUpdate(
      { email },
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      console.error(`❌ No user found with email ${email}`);
      process.exit(1);
    }

    console.log("✅ Updated user:", {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error making admin:", err);
    process.exit(1);
  }
}

run();
