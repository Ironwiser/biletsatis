import { Request, Response } from "express";
import { query } from "../db.js";

type EventRow = {
  id: string;
  organization_id: string;
  name: string;
  venue: string;
  city: string;
  poster_url: string | null;
  category: string | null;
  starts_at: string;
  is_approved: boolean;
  organization_name?: string;
};

/** Admin: tüm etkinlikler (onaylı/onaysız) */
export async function listAllEvents(req: Request, res: Response) {
  const r = await query<
    EventRow & { organization_name: string }
  >(
    `select
       e.id,
       e.organization_id,
       e.name,
       e.venue,
       e.city,
       e.poster_url,
       e.category,
       e.starts_at,
       e.is_approved,
       o.name as organization_name
     from events e
     join organizations o on o.id = e.organization_id and o.is_deleted = false
     where e.is_deleted = false
     order by e.is_approved asc, e.starts_at asc`
  );
  return res.json({ events: r.rows });
}

/** Admin: etkinliği onayla */
export async function approveEvent(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "event id zorunlu" });

  const r = await query<{ id: string }>(
    "update events set is_approved = true, updated_at = now() where id = $1 and is_deleted = false returning id",
    [id]
  );
  if (r.rows.length === 0) {
    return res.status(404).json({ message: "Etkinlik bulunamadı" });
  }
  return res.json({ message: "Etkinlik onaylandı" });
}

/** Admin: etkinlik onayını kaldır */
export async function rejectEvent(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "event id zorunlu" });

  const r = await query<{ id: string }>(
    "update events set is_approved = false, updated_at = now() where id = $1 and is_deleted = false returning id",
    [id]
  );
  if (r.rows.length === 0) {
    return res.status(404).json({ message: "Etkinlik bulunamadı" });
  }
  return res.json({ message: "Etkinlik onayı kaldırıldı" });
}

const FEATURED_POPUP_KEY = "featured_popup_event_id";

/** Admin: popup'ta gösterilecek etkinlik id'sini getir */
export async function getFeaturedPopupSetting(req: Request, res: Response) {
  const r = await query<{ value: string | null }>(
    "select value from site_settings where key = $1",
    [FEATURED_POPUP_KEY]
  );
  const value = r.rows[0]?.value ?? null;
  return res.json({ eventId: value });
}

/** Admin: popup'ta gösterilecek etkinliği seç (sadece onaylı etkinlikler geçerli) */
export async function setFeaturedPopupSetting(req: Request, res: Response) {
  const { eventId } = req.body ?? {};
  if (eventId === undefined || eventId === null) {
    await query(
      "insert into site_settings (key, value) values ($1, $2) on conflict (key) do update set value = $2",
      [FEATURED_POPUP_KEY, null]
    );
    return res.json({ message: "Popup etkinliği kaldırıldı", eventId: null });
  }
  if (typeof eventId !== "string") {
    return res.status(400).json({ message: "eventId string olmalı" });
  }

  const exists = await query<{ id: string }>(
    "select id from events where id = $1 and is_deleted = false and is_cancelled = false and is_approved = true",
    [eventId]
  );
  if (exists.rows.length === 0) {
    return res.status(400).json({ message: "Geçerli ve onaylı bir etkinlik id'si girin" });
  }

  await query(
    "insert into site_settings (key, value) values ($1, $2) on conflict (key) do update set value = $2",
    [FEATURED_POPUP_KEY, eventId]
  );
  return res.json({ message: "Popup etkinliği güncellendi", eventId });
}
