import express from "express";
import {
  createEvent,
  getEvent,
  getFeaturedPopup,
  listEvents,
  updateEvent,
} from "../controllers/eventController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", listEvents);
router.get("/featured-popup", getFeaturedPopup);
router.get("/:id", getEvent);
router.post("/", authenticateJWT, requireRole("organizer", "admin"), createEvent);
router.put("/:id", authenticateJWT, requireRole("organizer", "admin"), updateEvent);

export default router;

