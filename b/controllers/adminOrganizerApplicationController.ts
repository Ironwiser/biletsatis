import { Request, Response } from "express";
import { query } from "../db.js";

export async function listOrganizerApplications(req: Request, res: Response) {
  const { status } = req.query as any;
  const hasStatus = status && ["pending", "approved", "rejected"].includes(status);

  const r = await query(
    `select oa.id, oa.user_id, oa.first_name, oa.last_name, oa.city, oa.phone, oa.email,
            oa.status, oa.admin_note, oa.created_at, oa.reviewed_at,
            u.username as user_username
     from organizer_applications oa
     join users u on u.id = oa.user_id
     ${hasStatus ? "where oa.status = $1" : ""}
     order by oa.created_at desc`,
    hasStatus ? [status] : []
  );

  return res.json({ applications: r.rows });
}

export async function approveOrganizerApplication(req: Request, res: Response) {
  const { id } = req.params;
  const { adminNote } = req.body ?? {};

  const appR = await query<{ user_id: string; status: string }>(
    "select user_id, status from organizer_applications where id = $1",
    [id]
  );
  if (appR.rows.length === 0) return res.status(404).json({ message: "Başvuru bulunamadı" });

  const app = appR.rows[0];
  if (app.status !== "pending") {
    return res.status(409).json({ message: "Bu başvuru zaten incelenmiş." });
  }

  await query(
    "update organizer_applications set status='approved', admin_note=$2, reviewed_at=now() where id=$1",
    [id, adminNote ?? null]
  );
  await query("update users set role='organizer', updated_at=now() where id=$1", [app.user_id]);

  return res.json({ ok: true });
}

export async function rejectOrganizerApplication(req: Request, res: Response) {
  const { id } = req.params;
  const { adminNote } = req.body ?? {};

  const appR = await query<{ status: string }>(
    "select status from organizer_applications where id = $1",
    [id]
  );
  if (appR.rows.length === 0) return res.status(404).json({ message: "Başvuru bulunamadı" });
  if (appR.rows[0].status !== "pending") {
    return res.status(409).json({ message: "Bu başvuru zaten incelenmiş." });
  }

  await query(
    "update organizer_applications set status='rejected', admin_note=$2, reviewed_at=now() where id=$1",
    [id, adminNote ?? null]
  );
  return res.json({ ok: true });
}

