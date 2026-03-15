import { getApiOrigin } from "./client";
import type { EventCard } from "../components/home/types";

/** Afişi olmayan etkinliklerde gösterilecek varsayılan görsel (f/public/placeholderposter.webp) */
const DEFAULT_POSTER = "/placeholderposter.webp";

/** Backend /api/events listesinden dönen tek etkinlik tipi */
export type ApiEvent = {
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
  price_display: string | null;
};

function formatDateText(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "short",
  });
}

function formatTimeText(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

/** API etkinliğini ana sayfa / detay için EventCard formatına çevirir */
export function mapApiEventToCard(e: ApiEvent): EventCard {
  const origin = getApiOrigin();
  const imageSrc = e.poster_url
    ? e.poster_url.startsWith("http")
      ? e.poster_url
      : `${origin}${e.poster_url}`
    : DEFAULT_POSTER;

  const tags: string[] = [];
  if (e.category) tags.push(e.category);
  if (e.event_type) {
    const parts = e.event_type.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
    tags.push(...parts);
  }
  if (tags.length === 0) tags.push("ETKİNLİK");

  const raw = e.price_display && e.price_display.trim() ? e.price_display.trim() : "";
  const priceText =
    raw === ""
      ? "₺ —"
      : /^[\d\s,.\-–—]/.test(raw)
        ? `₺ ${raw}`
        : raw;

  return {
    id: e.id,
    title: e.name,
    venue: e.venue,
    city: e.city,
    dateText: formatDateText(e.starts_at),
    timeText: formatTimeText(e.starts_at),
    tags,
    priceText,
    imageSrc,
  };
}
