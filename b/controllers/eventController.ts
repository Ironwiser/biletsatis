import { Request, Response } from "express";
import { query } from "../db.js";

type EventRow = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  venue: string;
  city: string;
  poster_url: string | null;
  category: string | null;
  event_type: string | null;
  address: string | null;
  age_limit: string | null;
  door_time: string | null;
  rules: string | null;
  social_instagram: string | null;
  social_website: string | null;
  starts_at: string;
  ends_at: string | null;
};

export async function createEvent(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const {
    organizationId,
    name,
    description,
    venue,
    city,
    startsAt,
    endsAt,
    posterUrl,
    category,
    eventType,
    address,
    ageLimit,
    doorTime,
    rules,
    socialInstagram,
    socialWebsite,
  } = req.body ?? {};

  if (!organizationId || !name || !venue || !city || !startsAt || !category) {
    return res
      .status(400)
      .json({ message: "organizationId, name, venue, city, category ve startsAt zorunlu." });
  }

  // Organizasyon bu organizatöre mi ait? (admin ise atla)
  if (req.user.role !== "admin") {
    const own = await query<{ id: string }>(
      `select id from organizations where id = $1 and organizer_user_id = $2 and is_deleted = false`,
      [organizationId, req.user.userId]
    );
    if (own.rows.length === 0) {
      return res.status(403).json({ message: "Bu organizasyonda etkinlik oluşturamazsın." });
    }
  }

  const created = await query<EventRow>(
    `insert into events (
       organization_id,
       name,
       description,
       venue,
       city,
       poster_url,
       category,
       event_type,
       address,
       age_limit,
       door_time,
       rules,
       social_instagram,
       social_website,
       starts_at,
       ends_at
     )
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     returning
       id,
       organization_id,
       name,
       description,
       venue,
       city,
       poster_url,
       category,
       event_type,
       address,
       age_limit,
       door_time,
       rules,
       social_instagram,
       social_website,
       starts_at,
       ends_at`,
    [
      organizationId,
      name,
      description ?? null,
      venue,
      city,
      posterUrl ?? null,
      category ?? null,
      eventType ?? null,
      address ?? null,
      ageLimit ?? null,
      doorTime ?? null,
      rules ?? null,
      socialInstagram ?? null,
      socialWebsite ?? null,
      startsAt,
      endsAt ?? null,
    ]
  );

  return res.status(201).json({ event: created.rows[0] });
}

export async function listEvents(req: Request, res: Response) {
  const { organizationId } = req.query;

  const params: any[] = [];
  let where = "where e.is_deleted = false and e.is_cancelled = false";
  if (organizationId && typeof organizationId === "string") {
    params.push(organizationId);
    where += ` and e.organization_id = $${params.length}`;
  }

  const r = await query<EventRow>(
    `select
       e.id,
       e.organization_id,
       e.name,
       e.description,
       e.venue,
       e.city,
       e.poster_url,
       e.category,
       e.event_type,
       e.address,
       e.age_limit,
       e.door_time,
       e.rules,
       e.social_instagram,
       e.social_website,
       e.starts_at,
       e.ends_at
     from events e
     ${where}
     order by e.starts_at asc`,
    params
  );

  return res.json({ events: r.rows });
}

export async function updateEvent(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "event id zorunlu" });

  // Etkinlik sahibi mi? (admin ise atla)
  if (req.user.role !== "admin") {
    const own = await query<{ id: string }>(
      `select e.id
       from events e
       join organizations o on o.id = e.organization_id
       where e.id = $1 and o.organizer_user_id = $2 and o.is_deleted = false`,
      [id, req.user.userId]
    );
    if (own.rows.length === 0) {
      return res.status(403).json({ message: "Bu etkinliği düzenleyemezsin." });
    }
  }

  const {
    name,
    description,
    venue,
    city,
    startsAt,
    endsAt,
    posterUrl,
    category,
    eventType,
    address,
    ageLimit,
    doorTime,
    rules,
    socialInstagram,
    socialWebsite,
  } = req.body ?? {};

  const r = await query<EventRow>(
    `update events
     set
       name = coalesce($1, name),
       description = $2,
       venue = coalesce($3, venue),
       city = coalesce($4, city),
       poster_url = $5,
       category = $6,
       event_type = $7,
       address = $8,
       age_limit = $9,
       door_time = $10,
       rules = $11,
       social_instagram = $12,
       social_website = $13,
       starts_at = coalesce($14, starts_at),
       ends_at = $15,
       updated_at = now()
     where id = $16
     returning
       id,
       organization_id,
       name,
       description,
       venue,
       city,
       poster_url,
       category,
       event_type,
       address,
       age_limit,
       door_time,
       rules,
       social_instagram,
       social_website,
       starts_at,
       ends_at`,
    [
      name ?? null,
      description ?? null,
      venue ?? null,
      city ?? null,
      posterUrl ?? null,
      category ?? null,
      eventType ?? null,
      address ?? null,
      ageLimit ?? null,
      doorTime ?? null,
      rules ?? null,
      socialInstagram ?? null,
      socialWebsite ?? null,
      startsAt ?? null,
      endsAt ?? null,
      id,
    ]
  );

  if (r.rows.length === 0) {
    return res.status(404).json({ message: "Etkinlik bulunamadı" });
  }

  return res.json({ event: r.rows[0] });
}

