import { Router } from "express";
import { signup, login, me, updateMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.put("/me", requireAuth, updateMe);
router.patch("/me", requireAuth, updateMe);

export default router;
