import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db.js";

type EventOwnerRow = {
  id: string;
  organization_id: string;
  organizer_user_id: string;
};

export async function generateMockTickets(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { eventId } = req.params;
  let { count } = req.body ?? {};

  if (!eventId) {
    return res.status(400).json({ message: "eventId parametresi zorunlu." });
  }

  count = typeof count === "number" ? count : parseInt(count, 10);
  if (!Number.isFinite(count) || count <= 0) count = 1;
  if (count > 100) count = 100;

  // Etkinlik bu organizatöre mi ait? (admin ise atla)
  if (req.user.role !== "admin") {
    const ev = await query<EventOwnerRow>(
      `select e.id, e.organization_id, o.organizer_user_id
       from events e
       join organizations o on o.id = e.organization_id
       where e.id = $1 and o.is_deleted = false`,
      [eventId]
    );
    if (ev.rows.length === 0 || ev.rows[0].organizer_user_id !== req.user.userId) {
      return res.status(403).json({ message: "Bu etkinlik için bilet üretemezsin." });
    }
  }

  const tokens: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const token = uuidv4();
    tokens.push(token);
    await query(
      `insert into tickets (event_id, holder_email, holder_name, qr_token)
       values ($1,$2,$3,$4)`,
      [eventId, null, null, token]
    );
  }

  return res.status(201).json({
    message: "Mock biletler oluşturuldu",
    count,
    tokens,
  });
}

