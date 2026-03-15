-- Veritabanındaki ilk organizatör kullanıcısına ait organizasyon + 30 mock etkinlik.
-- En az bir role='organizer' kaydı olmalı (users tablosunda).

WITH first_organizer AS (
  SELECT id FROM users WHERE role = 'organizer' LIMIT 1
),
org AS (
  INSERT INTO organizations (organizer_user_id, name, description, city)
  SELECT id, 'Mock Events Organizasyonu', 'Mock etkinlikler için örnek organizasyon', 'İstanbul'
  FROM first_organizer
  RETURNING id
)

INSERT INTO events (
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
  ends_at,
  price_display
)
SELECT id, 'ZAMNA x MO Homecoming', NULL, 'Life Park', 'İstanbul', NULL, NULL, 'TECHNO, HOUSE', NULL, '18+', '17:00', NULL, NULL, NULL, '2026-06-06 17:00:00+03'::timestamptz, NULL::timestamptz, '₺ 199' FROM org
UNION ALL SELECT id, 'Istanbul Core Festival | Nico Moreno', NULL, 'İstanbul Congress Center', 'İstanbul', NULL, NULL, 'TECHNO', NULL, '18+', '21:00', NULL, NULL, NULL, '2026-06-19 21:00:00+03'::timestamptz, NULL::timestamptz, '₺ 349' FROM org
UNION ALL SELECT id, 'Black Coffee', NULL, 'Ataköy Marina Açık Hava', 'İstanbul', NULL, NULL, 'HOUSE', NULL, '18+', '16:00', NULL, NULL, NULL, '2026-06-05 16:00:00+03'::timestamptz, NULL::timestamptz, '₺ 449' FROM org
UNION ALL SELECT id, 'Sublime Music Festival', NULL, 'Life Park', 'İstanbul', NULL, NULL, 'HOUSE, DISCO', NULL, '18+', '12:00', NULL, NULL, NULL, '2026-05-22 12:00:00+03'::timestamptz, NULL::timestamptz, '₺ 299' FROM org
UNION ALL SELECT id, 'X by Adriatique', NULL, 'Ataköy Marina Arena', 'İstanbul', NULL, NULL, 'MELODIC', NULL, '18+', '21:00', NULL, NULL, NULL, '2026-05-09 21:00:00+03'::timestamptz, NULL::timestamptz, '₺ 279' FROM org
UNION ALL SELECT id, 'Nonstop Techno Presents: NOVAH', NULL, '7/4HALL', 'İstanbul', NULL, NULL, 'TECHNO', NULL, '18+', '22:00', NULL, NULL, NULL, '2026-04-11 22:00:00+03'::timestamptz, NULL::timestamptz, '₺ 149' FROM org
UNION ALL SELECT id, 'Blind Fest', NULL, 'Küçükçiftlik Park', 'İstanbul', NULL, NULL, 'HOUSE', NULL, '18+', '20:00', NULL, NULL, NULL, '2026-06-03 20:00:00+03'::timestamptz, NULL::timestamptz, '₺ 199' FROM org
UNION ALL SELECT id, 'Electronic Dreams', NULL, 'Volksgarten', 'Viyana', NULL, NULL, 'ELECTRONIC', NULL, '18+', '22:00', NULL, NULL, NULL, '2026-06-10 22:00:00+02'::timestamptz, NULL::timestamptz, '€ 45' FROM org
UNION ALL SELECT id, 'Cosmic Lights', NULL, 'Arena Berlin', 'Berlin', NULL, NULL, 'TECHNO', NULL, '18+', '23:00', NULL, NULL, NULL, '2026-06-18 23:00:00+02'::timestamptz, NULL::timestamptz, '€ 55' FROM org
UNION ALL SELECT id, 'Midnight Soul', NULL, 'Boğaz Konser Alanı', 'İstanbul', NULL, NULL, 'SOUL', NULL, '18+', '21:30', NULL, NULL, NULL, '2026-06-25 21:30:00+03'::timestamptz, NULL::timestamptz, '₺ 179' FROM org
UNION ALL SELECT id, 'Indie Waves', NULL, 'Parkorman', 'İstanbul', NULL, NULL, 'INDIE', NULL, '18+', '18:00', NULL, NULL, NULL, '2026-07-01 18:00:00+03'::timestamptz, NULL::timestamptz, '₺ 129' FROM org
UNION ALL SELECT id, 'Summer Vibrations', NULL, 'Çeşme Beach', 'İzmir', NULL, NULL, 'HOUSE', NULL, '18+', '16:00', NULL, NULL, NULL, '2026-07-08 16:00:00+03'::timestamptz, NULL::timestamptz, '₺ 249' FROM org
UNION ALL SELECT id, 'Lo-Fi Nights', NULL, 'Kadıköy Sahne', 'İstanbul', NULL, NULL, 'LO-FI', NULL, '18+', '21:00', NULL, NULL, NULL, '2026-07-12 21:00:00+03'::timestamptz, NULL::timestamptz, '₺ 99' FROM org
UNION ALL SELECT id, 'Neon City Festival', NULL, 'City Park', 'Amsterdam', NULL, NULL, 'TECHNO', NULL, '18+', '17:00', NULL, NULL, NULL, '2026-07-20 17:00:00+02'::timestamptz, NULL::timestamptz, '€ 50' FROM org
UNION ALL SELECT id, 'Analog Dreams', NULL, 'IF Performance', 'Ankara', NULL, NULL, 'MELODIC', NULL, '18+', '21:30', NULL, NULL, NULL, '2026-07-27 21:30:00+03'::timestamptz, NULL::timestamptz, '₺ 159' FROM org
UNION ALL SELECT id, 'Sunrise Session', NULL, 'Beach Club', 'Bodrum', NULL, NULL, 'HOUSE', NULL, '18+', '05:00', NULL, NULL, NULL, '2026-08-03 05:00:00+03'::timestamptz, NULL::timestamptz, '₺ 349' FROM org
UNION ALL SELECT id, 'Deep Forest', NULL, 'Orman Etkinlik Alanı', 'Sapanca', NULL, NULL, 'TECHNO', NULL, '18+', '19:00', NULL, NULL, NULL, '2026-08-10 19:00:00+03'::timestamptz, NULL::timestamptz, '₺ 189' FROM org
UNION ALL SELECT id, 'Urban Jazz Night', NULL, 'Jazz Hall', 'İstanbul', NULL, NULL, 'JAZZ', NULL, '18+', '21:00', NULL, NULL, NULL, '2026-08-15 21:00:00+03'::timestamptz, NULL::timestamptz, '₺ 199' FROM org
UNION ALL SELECT id, 'Rooftop Stories', NULL, 'Rooftop 360', 'İstanbul', NULL, NULL, 'HOUSE', NULL, '18+', '20:00', NULL, NULL, NULL, '2026-08-22 20:00:00+03'::timestamptz, NULL::timestamptz, '₺ 229' FROM org
UNION ALL SELECT id, 'Minimal Therapy', NULL, 'Underground Club', 'Berlin', NULL, NULL, 'MINIMAL', NULL, '18+', '23:30', NULL, NULL, NULL, '2026-08-29 23:30:00+02'::timestamptz, NULL::timestamptz, '€ 40' FROM org
UNION ALL SELECT id, 'Lake View Festival', NULL, 'Göl Kenarı', 'Bursa', NULL, NULL, 'FESTIVAL', NULL, '18+', '14:00', NULL, NULL, NULL, '2026-09-05 14:00:00+03'::timestamptz, NULL::timestamptz, '₺ 279' FROM org
UNION ALL SELECT id, 'Retro Disco Night', NULL, 'Retro Club', 'İstanbul', NULL, NULL, 'DISCO', NULL, '18+', '22:00', NULL, NULL, NULL, '2026-09-12 22:00:00+03'::timestamptz, NULL::timestamptz, '₺ 149' FROM org
UNION ALL SELECT id, 'Chill & Beats', NULL, 'Sea Lounge', 'Antalya', NULL, NULL, 'CHILL', NULL, '18+', '18:00', NULL, NULL, NULL, '2026-09-19 18:00:00+03'::timestamptz, NULL::timestamptz, '₺ 179' FROM org
UNION ALL SELECT id, 'Dark Rooms', NULL, 'Warehouse', 'İzmir', NULL, NULL, 'TECHNO', NULL, '18+', '23:00', NULL, NULL, NULL, '2026-09-26 23:00:00+03'::timestamptz, NULL::timestamptz, '₺ 159' FROM org
UNION ALL SELECT id, 'Lost in Mind', NULL, 'Open Air Stage', 'İstanbul', NULL, NULL, 'MELODIC', NULL, '18+', '20:30', NULL, NULL, NULL, '2026-10-03 20:30:00+03'::timestamptz, NULL::timestamptz, '₺ 199' FROM org
UNION ALL SELECT id, 'Neon Pulse', NULL, 'Warehouse Stage', 'İstanbul', NULL, NULL, 'ELECTRONIC', NULL, '18+', '22:30', NULL, NULL, NULL, '2026-10-10 22:30:00+03'::timestamptz, NULL::timestamptz, '₺ 169' FROM org
UNION ALL SELECT id, 'Midnight Circuit', NULL, 'Underground', 'Berlin', NULL, NULL, 'TECHNO', NULL, '18+', '23:30', NULL, NULL, NULL, '2026-10-17 23:30:00+02'::timestamptz, NULL::timestamptz, '€ 45' FROM org
UNION ALL SELECT id, 'Afterglow Session', NULL, 'Rooftop', 'İstanbul', NULL, NULL, 'HOUSE', NULL, '18+', '21:00', NULL, NULL, NULL, '2026-10-24 21:00:00+03'::timestamptz, NULL::timestamptz, '₺ 189' FROM org
UNION ALL SELECT id, 'Spectrum', NULL, 'City Hall', 'Amsterdam', NULL, NULL, 'MELODIC', NULL, '18+', '20:00', NULL, NULL, NULL, '2026-10-31 20:00:00+01'::timestamptz, NULL::timestamptz, '€ 50' FROM org
UNION ALL SELECT id, 'Noir Frequencies', NULL, 'Club Stage', 'İzmir', NULL, NULL, 'MINIMAL', NULL, '18+', '22:00', NULL, NULL, NULL, '2026-11-07 22:00:00+03'::timestamptz, NULL::timestamptz, '₺ 139' FROM org;
