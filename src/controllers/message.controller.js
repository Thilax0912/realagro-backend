import Message from "../models/Message.js";

// USER: create a new message (from Contact page)
export async function createMessage(req, res) {
  try {
    const { name, email } = req.body;
    const msg =
      (req.body.message ||
        req.body.text ||
        req.body.content ||
        req.body.msg ||
        req.body.body ||
        "") + "";

    const message = msg.trim();
    if (!message) return res.status(400).json({ error: "Message is required" });

    const doc = await Message.create({
      userId: req.user?.id, // user is logged in (you already require auth on /contact)
      name: (name || "").trim(),
      email: (email || "").trim(),
      message,
      thread: [{ sender: "user", text: message }],
      status: "open",
    });

    res.status(201).json({ ok: true, id: doc._id });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
}

// USER: get my messages
export async function getMyMessages(req, res) {
  try {
    const rows = await Message.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ messages: rows });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
}

// ADMIN: list all messages
export async function adminListMessages(req, res) {
  try {
    const rows = await Message.find({}).sort({ updatedAt: -1 }).lean();
    res.json({ messages: rows });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
}

// ADMIN: reply to a message
export async function adminReply(req, res) {
  try {
    const { id } = req.params;
    const text = ((req.body.text || req.body.message || "") + "").trim();
    if (!text) return res.status(400).json({ error: "Reply is required" });

    const doc = await Message.findById(id);
    if (!doc) return res.status(404).json({ error: "Message not found" });

    doc.thread.push({ sender: "admin", text });
    doc.status = "replied";
    await doc.save();

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
}
