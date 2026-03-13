import { Request, Response } from "express";
import { query } from "../db.js";

export async function createOrganizerApplication(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { firstName, lastName, city, phone } = req.body ?? {};
  if (!firstName || !lastName || !city || !phone) {
    return res.status(400).json({ message: "Tüm alanlar zorunlu." });
  }

  const existing = await query<{ id: string }>(
    "select id from organizer_applications where user_id = $1 and status = 'pending'",
    [req.user.userId]
  );
  if (existing.rows.length > 0) {
    return res.status(409).json({ message: "Zaten bekleyen bir başvurun var." });
  }

  const created = await query(
    `insert into organizer_applications
      (user_id, first_name, last_name, city, phone, email)
     values ($1,$2,$3,$4,$5,$6)
     returning id, status, created_at`,
    [req.user.userId, firstName, lastName, city, phone, req.user.email]
  );

  return res.status(201).json({ application: created.rows[0] });
}

export async function getMyOrganizerApplications(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const r = await query(
    `select id, first_name, last_name, city, phone, email, status, admin_note, created_at, reviewed_at
     from organizer_applications
     where user_id = $1
     order by created_at desc`,
    [req.user.userId]
  );
  return res.json({ applications: r.rows });
}

