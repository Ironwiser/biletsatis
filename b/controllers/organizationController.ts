import { Request, Response } from "express";
import { query } from "../db.js";

export async function createOrganization(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { name, description, city, posterUrl, website, instagram } = req.body ?? {};
  if (!name || !city) {
    return res.status(400).json({ message: "İsim ve şehir zorunlu." });
  }

  const safePosterUrl =
    typeof posterUrl === "string" && posterUrl.startsWith("/uploads/") ? posterUrl : null;

  const created = await query(
    `insert into organizations (organizer_user_id, name, description, city, poster_url, website, instagram)
     values ($1,$2,$3,$4,$5,$6,$7)
     returning id, name, description, city, poster_url, website, instagram, created_at`,
    [
      req.user.userId,
      name,
      description ?? null,
      city,
      safePosterUrl,
      website ?? null,
      instagram ?? null,
    ]
  );

  return res.status(201).json({ organization: created.rows[0] });
}

export async function listOrganizations(_req: Request, res: Response) {
  try {
    const r = await query(
      `select o.id, o.name, o.description, o.city, o.poster_url, o.website, o.instagram, o.created_at,
            u.username as organizer_username
     from organizations o
     join users u on u.id = o.organizer_user_id
     where o.is_deleted = false and o.is_cancelled = false
     order by o.created_at desc`
    );
    return res.json({ organizations: r.rows });
  } catch (err) {
    console.error("[listOrganizations]", err);
    return res.status(500).json({ message: "Organizasyonlar yüklenemedi." });
  }
}

export async function listMyOrganizations(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const r = await query(
    `select id, name, description, city, poster_url, website, instagram, created_at, updated_at
     from organizations
     where organizer_user_id = $1
     order by created_at desc`,
    [req.user.userId]
  );
  return res.json({ organizations: r.rows });
}

