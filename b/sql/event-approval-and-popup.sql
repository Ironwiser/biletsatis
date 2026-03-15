-- Etkinlik onayı: sadece onaylanan etkinlikler ana sayfada listelenir
alter table events
  add column if not exists is_approved boolean not null default true;

-- Mevcut tüm etkinlikleri onaylı say (yeni eklenenler organizatör tarafından false ile gelecek)
update events set is_approved = true where is_deleted = false and is_cancelled = false;

-- Yeni eklenen etkinlikler varsayılan olarak onaysız (createEvent'te false set edilecek)
comment on column events.is_approved is 'Admin onayı; false ise ana sayfada listelenmez';

-- Popup'ta gösterilecek etkinlik: site ayarı
create table if not exists site_settings (
  key text primary key,
  value text
);

insert into site_settings (key, value) values ('featured_popup_event_id', null)
on conflict (key) do nothing;
