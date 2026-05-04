-- Create study materials table
begin;

create table if not exists public.study_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null check (type in ('pdf', 'video', 'link', 'book')),
  url text not null,
  thumbnail_url text,
  language text not null,
  category text not null default 'General',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.study_materials enable row level security;

-- Allow everyone to read active materials
drop policy if exists study_materials_select on public.study_materials;
create policy study_materials_select on public.study_materials
for select
to authenticated
using (active = true);

-- Allow central admins to manage
drop policy if exists study_materials_admin on public.study_materials;
create policy study_materials_admin on public.study_materials
for all
to authenticated
using (public.is_central_admin())
with check (public.is_central_admin());

commit;
