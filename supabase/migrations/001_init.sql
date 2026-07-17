-- Canastilla · migración 001: esquema, RLS, storage y realtime

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

-- Usuarios permitidos (los emails se insertan a mano desde el panel)
create table allowed_users (
  email text primary key
);

-- Secciones fijas de la checklist
create table sections (
  id text primary key,          -- 'hosp', 'dorm', 'alim', 'hig', 'pan', 'paseo', 'casa'
  name text not null,
  emoji text not null,
  sort int not null
);

-- Ítems (los de serie + los que añadamos nosotros)
create table items (
  id uuid primary key default gen_random_uuid(),
  section_id text not null references sections(id),
  name text not null,
  essential boolean not null default true,   -- true = básico, false = nice to have
  products jsonb not null default '[]',      -- [{n: nombre, p: precio orientativo, u: url}]
  is_custom boolean not null default false,
  created_by text,                           -- email de quien lo añadió
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- Estado de marcado, con atribución (quién lo consiguió)
create table item_checks (
  item_id uuid primary key references items(id) on delete cascade,
  checked_by text not null,                  -- email
  checked_at timestamptz not null default now()
);

-- Documentos (plan de parto y lo que venga)
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'general',  -- 'parto', 'medico', 'tramites', 'general'
  storage_path text not null,
  uploaded_by text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS: solo los emails de allowed_users pueden leer/escribir
-- ---------------------------------------------------------------------------

alter table allowed_users enable row level security;
alter table sections enable row level security;
alter table items enable row level security;
alter table item_checks enable row level security;
alter table documents enable row level security;

-- Cada usuario autenticado solo puede comprobar si su propio email está en la lista
create policy "allowed_users: leer tu propia fila"
  on allowed_users for select
  to authenticated
  using (email = (auth.jwt() ->> 'email'));

create policy "sections: allowlist select"
  on sections for select
  to authenticated
  using (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "items: allowlist select"
  on items for select
  to authenticated
  using (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "items: allowlist insert"
  on items for insert
  to authenticated
  with check (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "items: allowlist update"
  on items for update
  to authenticated
  using (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "items: allowlist delete"
  on items for delete
  to authenticated
  using (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "item_checks: allowlist select"
  on item_checks for select
  to authenticated
  using (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "item_checks: allowlist insert"
  on item_checks for insert
  to authenticated
  with check (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "item_checks: allowlist delete"
  on item_checks for delete
  to authenticated
  using (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "documents: allowlist select"
  on documents for select
  to authenticated
  using (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "documents: allowlist insert"
  on documents for insert
  to authenticated
  with check (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

create policy "documents: allowlist delete"
  on documents for delete
  to authenticated
  using (exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email')));

-- ---------------------------------------------------------------------------
-- Storage: bucket privado 'docs' con la misma allowlist
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('docs', 'docs', false)
on conflict (id) do nothing;

create policy "docs: allowlist select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'docs'
    and exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email'))
  );

create policy "docs: allowlist insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'docs'
    and exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email'))
  );

create policy "docs: allowlist delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'docs'
    and exists (select 1 from allowed_users a where a.email = (auth.jwt() ->> 'email'))
  );

-- ---------------------------------------------------------------------------
-- Realtime: cambios en items e item_checks llegan al otro móvil al instante
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table items;
alter publication supabase_realtime add table item_checks;
