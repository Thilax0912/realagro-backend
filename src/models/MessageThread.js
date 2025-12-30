// src/models/MessageThread.js
import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "admin"], required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const ThreadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "" },
    subject: { type: String, default: "" },
    items: { type: [ItemSchema], default: [] },
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true }
);

export default mongoose.model("MessageThread", ThreadSchema);
