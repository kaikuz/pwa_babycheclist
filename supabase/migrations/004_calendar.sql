-- Camino a casa · migración 004: calendario de eventos del embarazo
--
-- Aditiva: no toca las migraciones 001-003 ni las tablas de checklist /
-- documentos. Añade event_types (catálogo de solo lectura) y events, con la
-- misma allowlist por RLS y realtime, para que los eventos que añada uno
-- aparezcan en el móvil del otro al instante.

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table event_types (
  id text primary key,       -- 'parto', 'cita', 'medicacion', 'tramite', 'otro'
  name text not null,
  color text not null,       -- hex (color en modo claro; el oscuro lo pone el cliente)
  icon text not null         -- un emoji
);

create table events (
  id uuid primary key default gen_random_uuid(),
  type_id text not null references event_types(id),
  title text not null,
  notes text,
  start_date date not null,
  end_date date,                            -- null = evento de un solo día
  all_day boolean not null default true,
  time text,                                -- 'HH:MM' opcional, para citas con hora
  recurrence text not null default 'none',  -- 'none' | 'daily' | 'weekly'
  recurrence_until date,                    -- hasta cuándo se repite (si recurrence != 'none')
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS: misma allowlist que el resto de tablas
-- ---------------------------------------------------------------------------

alter table event_types enable row level security;
alter table events enable row level security;

-- catálogo de tipologías: solo lectura para autenticados (se gestiona por migración)
create policy "event_types: allowlist select"
  on event_types for select
  to authenticated
  using (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "events: allowlist select"
  on events for select
  to authenticated
  using (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "events: allowlist insert"
  on events for insert
  to authenticated
  with check (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "events: allowlist update"
  on events for update
  to authenticated
  using (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "events: allowlist delete"
  on events for delete
  to authenticated
  using (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table events;

-- ---------------------------------------------------------------------------
-- Seed: tipologías y eventos iniciales
-- ---------------------------------------------------------------------------

insert into event_types (id, name, color, icon) values
  ('parto',      'Parto',                '#C0665A', '🎉'),
  ('cita',       'Cita médica',          '#7C9A83', '🩺'),
  ('medicacion', 'Medicación / vacunas', '#C98F3D', '💊'),
  ('tramite',    'Trámites',             '#6E7FB0', '📋'),
  ('otro',       'Otro',                 '#8B8B8B', '📌');

insert into events (type_id, title, notes, start_date, all_day, recurrence, recurrence_until, created_by)
values
  ('parto', 'Fecha probable de parto',
   'FPP. La fecha real puede variar ±2 semanas.',
   date '2026-10-04', true, 'none', null, 'seed'),
  ('medicacion', 'Heparina — inyección diaria',
   'Pauta y duración exacta las confirma tu hematólogo/matrona. Ajusta la fecha de fin si te indican otra cosa.',
   date '2026-07-14', true, 'daily', date '2026-10-04', 'seed');
