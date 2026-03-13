import express from "express";
import { createEvent, listEvents, updateEvent } from "../controllers/eventController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", listEvents);
router.post("/", authenticateJWT, requireRole("organizer", "admin"), createEvent);
router.put("/:id", authenticateJWT, requireRole("organizer", "admin"), updateEvent);

export default router;

