import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";

import authRoutes from "./routes/authRoutes.js";
import organizerApplicationRoutes from "./routes/organizerApplicationRoutes.js";
import adminOrganizerApplicationRoutes from "./routes/adminOrganizerApplicationRoutes.js";
import adminEventRoutes from "./routes/adminEventRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import ticketScanRoutes from "./routes/ticketScanRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import ticketAdminRoutes from "./routes/ticketAdminRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(
  __dirname,
  process.env.NODE_ENV === "production" ? ".env.production" : ".env.development"
);
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req: Request, _res: Response, next) => {
  req.db = pool;
  next();
});

app.get("/api/health", async (_req, res) => {
  const r = await pool.query("select 1 as ok");
  res.json({ ok: r.rows[0].ok === 1 });
});

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", authRoutes);
app.use("/api/organizer-applications", organizerApplicationRoutes);
app.use("/api/admin/organizer-applications", adminOrganizerApplicationRoutes);
app.use("/api/admin", adminEventRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/tickets", ticketScanRoutes);
app.use("/api/events", eventRoutes);
app.use("/api", ticketAdminRoutes);

app.listen(PORT, () => {
  console.log(
    `[${new Date().toISOString()}] biletsatis backend ${PORT} portunda çalışıyor`
  );
});

export default app;

