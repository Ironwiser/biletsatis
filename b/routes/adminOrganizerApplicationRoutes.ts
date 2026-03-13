import express from "express";
import {
  approveOrganizerApplication,
  listOrganizerApplications,
  rejectOrganizerApplication,
} from "../controllers/adminOrganizerApplicationController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateJWT, requireRole("admin"), listOrganizerApplications);
router.post("/:id/approve", authenticateJWT, requireRole("admin"), approveOrganizerApplication);
router.post("/:id/reject", authenticateJWT, requireRole("admin"), rejectOrganizerApplication);

export default router;

