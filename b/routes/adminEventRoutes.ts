import express from "express";
import {
  approveEvent,
  getFeaturedPopupSetting,
  listAllEvents,
  rejectEvent,
  setFeaturedPopupSetting,
} from "../controllers/adminEventController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateJWT, requireRole("admin"));

router.get("/events", listAllEvents);
router.put("/events/:id/approve", approveEvent);
router.put("/events/:id/reject", rejectEvent);
router.get("/settings/featured-popup", getFeaturedPopupSetting);
router.put("/settings/featured-popup", setFeaturedPopupSetting);

export default router;
