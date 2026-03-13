-- biletsatis minimal şema (v1)

create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  username text not null,
  password_hash text not null,
  role text not null default 'user' check (role in ('user','organizer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organizer_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  city text not null,
  phone text not null,
  email text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create unique index if not exists organizer_applications_one_pending
on organizer_applications(user_id)
where status = 'pending';

create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  organizer_user_id uuid not null references users(id) on delete restrict,
  name text not null,
  description text,
  city text not null,
  poster_url text,
  website text,
  instagram text,
  is_cancelled boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mevcut kurulumlar için kolonların varlığını garanti altına al
alter table organizations
  add column if not exists is_cancelled boolean not null default false;

alter table organizations
  add column if not exists is_deleted boolean not null default false;

alter table organizations
  add column if not exists poster_url text;

alter table organizations
  add column if not exists website text;

alter table organizations
  add column if not exists instagram text;

-- Etkinlikler (organizasyona bağlı gerçek event'ler)
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete restrict,
  name text not null,
  description text,
  venue text not null,
  city text not null,
  poster_url text,
  category text,
  event_type text,
  address text,
  age_limit text,
  door_time text,
  rules text,
  social_instagram text,
  social_website text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  is_cancelled boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table events
  add column if not exists category text;

alter table events
  add column if not exists event_type text;

alter table events
  add column if not exists address text;

alter table events
  add column if not exists age_limit text;

alter table events
  add column if not exists door_time text;

alter table events
  add column if not exists rules text;

alter table events
  add column if not exists social_instagram text;

alter table events
  add column if not exists social_website text;

alter table events
  add column if not exists poster_url text;

-- Biletler (şimdilik satın alma yok; manuel insert veya admin aracıyla üretilecek)
create table if not exists tickets (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete restrict,
  holder_email text,
  holder_name text,
  qr_token text not null unique,
  status text not null default 'valid' check (status in ('valid','revoked')),
  first_scan_at timestamptz,
  created_at timestamptz not null default now()
);

-- Kapı okumaları (scan logları)
create table if not exists ticket_scans (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  scan_type text not null default 'entry' check (scan_type in ('entry','exit')),
  gate text,
  device_id text,
  scanned_at timestamptz not null default now()
);

create index if not exists idx_ticket_scans_event_id on ticket_scans(event_id);
create index if not exists idx_ticket_scans_ticket_id on ticket_scans(ticket_id);

