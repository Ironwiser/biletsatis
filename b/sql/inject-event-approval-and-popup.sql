-- PostgreSQL'e doğrudan yapıştırıp çalıştır (psql, pgAdmin, DBeaver vb.)
-- Etkinlik onayı + popup ayarı + mevcut etkinlikleri onaylı yap

alter table events
  add column if not exists is_approved boolean not null default true;

update events set is_approved = true where is_deleted = false and is_cancelled = false;

comment on column events.is_approved is 'Admin onayı; false ise ana sayfada listelenmez';

create table if not exists site_settings (
  key text primary key,
  value text
);

insert into site_settings (key, value) values ('featured_popup_event_id', null)
on conflict (key) do nothing;
