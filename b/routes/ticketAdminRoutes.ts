import express from "express";
import { authenticateJWT, requireRole } from "../middleware/auth.js";
import { generateMockTickets } from "../controllers/ticketAdminController.js";

const router = express.Router();

// Sadece organizer/admin mock bilet üretebilir
router.post(
  "/events/:eventId/tickets/mock-generate",
  authenticateJWT,
  requireRole("organizer", "admin"),
  generateMockTickets
);

export default router;

