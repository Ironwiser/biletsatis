import express from "express";
import {
  login,
  logout,
  refresh,
  register,
  getProfile,
} from "../controllers/authController.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/profile", authenticateJWT, getProfile);

export default router;

