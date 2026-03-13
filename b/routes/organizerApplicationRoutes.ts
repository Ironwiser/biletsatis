import express from "express";
import {
  createOrganizerApplication,
  getMyOrganizerApplications,
} from "../controllers/organizerApplicationController.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authenticateJWT, createOrganizerApplication);
router.get("/me", authenticateJWT, getMyOrganizerApplications);

export default router;

