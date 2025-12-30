import mongoose from "mongoose";

export default async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error("Missing Mongo URI. Set MONGODB_URI in backend/.env");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);
  console.log("✅ MongoDB connected");
}
