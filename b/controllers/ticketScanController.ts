import { Request, Response } from "express";
import { query } from "../db.js";

type TicketRow = {
  id: string;
  event_id: string;
  qr_token: string;
  status: "valid" | "revoked";
  first_scan_at: string | null;
};

export async function scanTicket(req: Request, res: Response) {
  const { token, gate, deviceId, type } = req.body ?? {};
  if (!token || typeof token !== "string") {
    return res.status(400).json({ ok: false, message: "Geçersiz istek: token zorunlu." });
  }

  const scanType = type === "exit" ? "exit" : "entry";

  const tRes = await query<TicketRow>(
    `select id, event_id, qr_token, status, first_scan_at
     from tickets
     where qr_token = $1`,
    [token]
  );

  if (tRes.rows.length === 0) {
    return res.status(404).json({ ok: false, message: "Bilet bulunamadı" });
  }

  const ticket = tRes.rows[0];

  if (ticket.status !== "valid") {
    return res.status(409).json({ ok: false, message: "Bu bilet artık geçerli değil." });
  }

  // scan kaydını oluştur
  const scanInsert = await query<{ id: string; scanned_at: string }>(
    `insert into ticket_scans (ticket_id, event_id, scan_type, gate, device_id)
     values ($1,$2,$3,$4,$5)
     returning id, scanned_at`,
    [ticket.id, ticket.event_id, scanType, gate ?? null, deviceId ?? null]
  );

  // ilk entry için first_scan_at'i güncelle
  let firstScanAt = ticket.first_scan_at;
  if (!firstScanAt && scanType === "entry") {
    const upd = await query<{ first_scan_at: string }>(
      `update tickets
       set first_scan_at = $1
       where id = $2
       returning first_scan_at`,
      [scanInsert.rows[0].scanned_at, ticket.id]
    );
    firstScanAt = upd.rows[0]?.first_scan_at ?? firstScanAt;
  }

  // toplam kaç kez okunmuş?
  const countRes = await query<{ c: number }>(
    `select count(*)::int as c from ticket_scans where ticket_id = $1`,
    [ticket.id]
  );

  return res.json({
    ok: true,
    ticket: {
      id: ticket.id,
      eventId: ticket.event_id,
      firstScanAt,
    },
    scan: {
      id: scanInsert.rows[0].id,
      type: scanType,
      gate: gate ?? null,
      deviceId: deviceId ?? null,
      scannedAt: scanInsert.rows[0].scanned_at,
    },
    stats: {
      totalScansForTicket: countRes.rows[0].c,
    },
  });
}

