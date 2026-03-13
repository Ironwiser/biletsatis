import express from "express";
import { scanTicket } from "../controllers/ticketScanController.js";

const router = express.Router();

// Kapıdan QR okuyan uygulama buraya POST atacak.
router.post("/scan", scanTicket);

export default router;

