import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "admin"], required: true },
    text: { type: String, required: true, trim: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },

    // First message from user (required)
    message: { type: String, required: true, trim: true },

    // Conversation thread
    thread: { type: [replySchema], default: [] },

    status: { type: String, enum: ["open", "replied"], default: "open" },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
