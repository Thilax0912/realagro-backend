import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createMessage,
  getMyMessages,
  adminListMessages,
  adminReply,
} from "../controllers/message.controller.js";

const router = Router();

// simple admin check using req.user.role
function requireAdmin(req, res, next) {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ error: "Forbidden" });
}

// user
router.post("/", requireAuth, createMessage);
router.get("/mine", requireAuth, getMyMessages);

// admin
router.get("/admin", requireAuth, requireAdmin, adminListMessages);
router.post("/:id/reply", requireAuth, requireAdmin, adminReply);

export default router;
