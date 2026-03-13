import express from "express";
import multer from "multer";
import { uploadPoster } from "../controllers/uploadController.js";
import { authenticateJWT, requireRole } from "../middleware/auth.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    if (!ok) return cb(new Error("Sadece jpeg/png/webp"));
    return cb(null, true);
  },
});

router.post(
  "/poster",
  authenticateJWT,
  requireRole("organizer", "admin"),
  upload.single("file"),
  uploadPoster
);

export default router;

