import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    priceLKR: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: ["ongoing", "sold"], default: "ongoing" },
    description: { type: String, default: "" },
    features: { type: [String], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);
