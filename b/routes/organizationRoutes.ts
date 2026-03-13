import express from "express";
import {
  createOrganization,
  listMyOrganizations,
  listOrganizations,
} from "../controllers/organizationController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", listOrganizations);
router.get("/me", authenticateJWT, requireRole("organizer", "admin"), listMyOrganizations);
router.post("/", authenticateJWT, requireRole("organizer", "admin"), createOrganization);

export default router;

