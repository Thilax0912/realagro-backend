import { Router } from "express";
import {
  list,
  create,
  markSold,
  update,
  remove,
} from "../controllers/listing.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", list); // public read
router.post("/", requireAuth, requireAdmin, create); // admin create
router.patch("/:id", requireAuth, requireAdmin, update); // admin update
router.delete("/:id", requireAuth, requireAdmin, remove); // admin delete
router.patch("/:id/sold", requireAuth, requireAdmin, markSold);

export default router;
