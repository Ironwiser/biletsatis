import { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

export async function uploadPoster(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!req.file) return res.status(400).json({ message: "Dosya bulunamadı" });

  const uploadsRoot = path.join(__dirname, "..", "uploads");
  const postersDir = path.join(uploadsRoot, "posters");
  ensureDir(postersDir);

  const id = uuidv4();
  const outName = `${id}.webp`;
  const outPath = path.join(postersDir, outName);

  try {
    // Normalize + compress
    await sharp(req.file.buffer)
      .rotate()
      .resize(1200, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);

    const publicUrl = `/uploads/posters/${outName}`;
    return res.status(201).json({ url: publicUrl });
  } catch (e) {
    return res.status(500).json({ message: "Upload işlenemedi" });
  }
}

