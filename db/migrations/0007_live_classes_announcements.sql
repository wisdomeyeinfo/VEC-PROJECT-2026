-- Add gender to students and create live_classes/announcements
begin;

-- Update students table
alter table public.students add column if not exists gender text check (gender in ('Boy', 'Girl'));
alter table public.students add column if not exists custom_school_name text;

-- Create live_classes table
create table if not exists public.live_classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  zoom_link text not null,
  gender text check (gender in ('Boy', 'Girl', 'Both')) default 'Both',
  city text,
  area text,
  scheduled_at timestamptz not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Create announcements table
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  priority text default 'Normal',
  active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.live_classes enable row level security;
alter table public.announcements enable row level security;

-- Policies for students to read
create policy live_classes_student_read on public.live_classes
for select to authenticated using (active = true);

create policy announcements_student_read on public.announcements
for select to authenticated using (active = true);

-- Policies for central admins to manage
create policy live_classes_admin_all on public.live_classes
for all to authenticated using (public.is_central_admin());

create policy announcements_admin_all on public.announcements
for all to authenticated using (public.is_central_admin());

commit;
