-- Values For All (VEC) - initial schema
-- Apply this in Supabase SQL editor (or via Supabase CLI migrations later).

begin;

-- Extensions (safe if already enabled)
create extension if not exists pgcrypto;

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'team_role') then
    create type public.team_role as enum ('central_admin', 'leader', 'member');
  end if;

  if not exists (select 1 from pg_type where typname = 'school_status') then
    create type public.school_status as enum (
      'permission_pending',
      'announcement_done',
      'permission_granted',
      'distribution_pending',
      'distribution_completed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'activation_code_status') then
    create type public.activation_code_status as enum ('unused', 'redeemed', 'revoked');
  end if;

  if not exists (select 1 from pg_type where typname = 'stock_movement_reason') then
    create type public.stock_movement_reason as enum ('allocation', 'subteam_split', 'distribution', 'adjustment');
  end if;

  if not exists (select 1 from pg_type where typname = 'question_set_type') then
    create type public.question_set_type as enum ('fixed100', 'extra50');
  end if;
end $$;

-- Core tables
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city_region text,
  year int not null,
  whatsapp_invite_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  role public.team_role not null default 'member',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (user_id, team_id)
);

-- Helper functions for RLS (defined after team_members table exists)
create or replace function public.is_central_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.user_id = auth.uid()
      and tm.role = 'central_admin'::public.team_role
      and tm.status = 'active'
  );
$$;

create or replace function public.is_team_member(team_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.user_id = auth.uid()
      and tm.team_id = is_team_member.team_id
      and tm.status = 'active'
  );
$$;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  district text not null,
  taluka text,
  name text not null,
  principal_name text,
  principal_phone text,
  teacher_name text,
  teacher_phone text,
  remarks text,
  created_at timestamptz not null default now()
);

create table if not exists public.school_visits (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  status public.school_status not null default 'permission_pending',
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  unique (team_id, school_id)
);

create table if not exists public.kit_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  language_specific boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (name)
);

create table if not exists public.team_stock (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  item_id uuid not null references public.kit_items(id) on delete restrict,
  language text,
  qty_on_hand int not null default 0,
  updated_at timestamptz not null default now(),
  unique (team_id, item_id, language)
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  from_team_id uuid references public.teams(id) on delete set null,
  to_team_id uuid references public.teams(id) on delete set null,
  item_id uuid not null references public.kit_items(id) on delete restrict,
  language text,
  qty int not null check (qty > 0),
  reason public.stock_movement_reason not null,
  school_id uuid references public.schools(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.activation_codes (
  code text primary key,
  team_id uuid not null references public.teams(id) on delete cascade,
  year int not null,
  status public.activation_code_status not null default 'unused',
  redeemed_by_student_id uuid,
  redeemed_at timestamptz
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete restrict,
  activation_code text not null references public.activation_codes(code) on delete restrict,
  district text not null,
  school_id uuid references public.schools(id) on delete set null,
  name text not null,
  class text,
  division text,
  language text not null,
  mobile text,
  created_at timestamptz not null default now(),
  unique (activation_code)
);

create table if not exists public.exam_configs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  enabled_from timestamptz,
  enabled_to timestamptz,
  duration_minutes int not null default 240,
  rules_version int not null default 1,
  created_at timestamptz not null default now(),
  unique (team_id)
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  language text not null,
  question_text text not null,
  options jsonb not null,
  correct_option int not null check (correct_option between 0 and 3),
  tags text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.question_sets (
  id uuid primary key default gen_random_uuid(),
  language text not null,
  type public.question_set_type not null,
  name text,
  created_at timestamptz not null default now(),
  unique (language, type)
);

create table if not exists public.question_set_items (
  question_set_id uuid not null references public.question_sets(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  primary key (question_set_id, question_id)
);

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  status text not null default 'in_progress',
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  submitted_at timestamptz,
  seed text not null,
  unique (student_id)
);

create table if not exists public.exam_attempt_questions (
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  position int not null,
  primary key (attempt_id, question_id),
  unique (attempt_id, position)
);

create table if not exists public.exam_attempt_answers (
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  chosen_option int check (chosen_option between 0 and 3),
  answered_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

create table if not exists public.results_visibility (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  visible boolean not null default false,
  visible_from timestamptz,
  created_at timestamptz not null default now(),
  unique (team_id)
);

-- RLS
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.schools enable row level security;
alter table public.school_visits enable row level security;
alter table public.kit_items enable row level security;
alter table public.team_stock enable row level security;
alter table public.stock_movements enable row level security;
alter table public.activation_codes enable row level security;
alter table public.students enable row level security;
alter table public.exam_configs enable row level security;
alter table public.questions enable row level security;
alter table public.question_sets enable row level security;
alter table public.question_set_items enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_attempt_questions enable row level security;
alter table public.exam_attempt_answers enable row level security;
alter table public.results_visibility enable row level security;

-- teams: central admins can manage; team members can read their own team
drop policy if exists teams_select on public.teams;
create policy teams_select on public.teams
for select
using (
  public.is_central_admin()
  or exists (
    select 1 from public.team_members tm
    where tm.team_id = teams.id
      and tm.user_id = auth.uid()
      and tm.status = 'active'
  )
);

drop policy if exists teams_write on public.teams;
create policy teams_write on public.teams
for all
using (public.is_central_admin())
with check (public.is_central_admin());

-- team_members: central admins can manage; users can read their own memberships
drop policy if exists team_members_select on public.team_members;
create policy team_members_select on public.team_members
for select
using (public.is_central_admin() or user_id = auth.uid());

drop policy if exists team_members_write on public.team_members;
create policy team_members_write on public.team_members
for all
using (public.is_central_admin())
with check (public.is_central_admin());

-- schools: team members can read/write (scoped via school_visits); central admin full access.
-- To keep things simple initially, allow any authenticated staff to manage schools.
drop policy if exists schools_staff on public.schools;
create policy schools_staff on public.schools
for all
to authenticated
using (public.is_central_admin() or exists (select 1 from public.team_members tm where tm.user_id = auth.uid() and tm.status = 'active'))
with check (public.is_central_admin() or exists (select 1 from public.team_members tm where tm.user_id = auth.uid() and tm.status = 'active'));

-- school_visits: team-scoped
drop policy if exists school_visits_team on public.school_visits;
create policy school_visits_team on public.school_visits
for all
to authenticated
using (public.is_central_admin() or public.is_team_member(team_id))
with check (public.is_central_admin() or public.is_team_member(team_id));

-- kit_items: central manages; staff can read
drop policy if exists kit_items_select on public.kit_items;
create policy kit_items_select on public.kit_items
for select
to authenticated
using (true);

drop policy if exists kit_items_write on public.kit_items;
create policy kit_items_write on public.kit_items
for all
to authenticated
using (public.is_central_admin())
with check (public.is_central_admin());

-- team_stock: team-scoped read/write, central full
drop policy if exists team_stock_team on public.team_stock;
create policy team_stock_team on public.team_stock
for all
to authenticated
using (public.is_central_admin() or public.is_team_member(team_id))
with check (public.is_central_admin() or public.is_team_member(team_id));

-- stock_movements: team-scoped via from/to team
drop policy if exists stock_movements_team on public.stock_movements;
create policy stock_movements_team on public.stock_movements
for all
to authenticated
using (
  public.is_central_admin()
  or (from_team_id is not null and public.is_team_member(from_team_id))
  or (to_team_id is not null and public.is_team_member(to_team_id))
)
with check (
  public.is_central_admin()
  or (from_team_id is not null and public.is_team_member(from_team_id))
  or (to_team_id is not null and public.is_team_member(to_team_id))
);

-- activation_codes: central manages; team can read its codes
drop policy if exists activation_codes_select on public.activation_codes;
create policy activation_codes_select on public.activation_codes
for select
to authenticated
using (public.is_central_admin() or public.is_team_member(team_id));

drop policy if exists activation_codes_write on public.activation_codes;
create policy activation_codes_write on public.activation_codes
for all
to authenticated
using (public.is_central_admin())
with check (public.is_central_admin());

-- students: central or team members can read; writes happen via server with service role initially
drop policy if exists students_select on public.students;
create policy students_select on public.students
for select
to authenticated
using (public.is_central_admin() or public.is_team_member(team_id));

-- exam configs + results visibility: central manages; team reads
drop policy if exists exam_configs_select on public.exam_configs;
create policy exam_configs_select on public.exam_configs
for select
to authenticated
using (public.is_central_admin() or public.is_team_member(team_id));

drop policy if exists exam_configs_write on public.exam_configs;
create policy exam_configs_write on public.exam_configs
for all
to authenticated
using (public.is_central_admin())
with check (public.is_central_admin());

drop policy if exists results_visibility_select on public.results_visibility;
create policy results_visibility_select on public.results_visibility
for select
to authenticated
using (public.is_central_admin() or public.is_team_member(team_id));

drop policy if exists results_visibility_write on public.results_visibility;
create policy results_visibility_write on public.results_visibility
for all
to authenticated
using (public.is_central_admin())
with check (public.is_central_admin());

-- questions + sets: central manages; staff reads
drop policy if exists questions_select on public.questions;
create policy questions_select on public.questions
for select
to authenticated
using (true);

drop policy if exists questions_write on public.questions;
create policy questions_write on public.questions
for all
to authenticated
using (public.is_central_admin())
with check (public.is_central_admin());

drop policy if exists question_sets_select on public.question_sets;
create policy question_sets_select on public.question_sets
for select
to authenticated
using (true);

drop policy if exists question_sets_write on public.question_sets;
create policy question_sets_write on public.question_sets
for all
to authenticated
using (public.is_central_admin())
with check (public.is_central_admin());

drop policy if exists question_set_items_select on public.question_set_items;
create policy question_set_items_select on public.question_set_items
for select
to authenticated
using (true);

drop policy if exists question_set_items_write on public.question_set_items;
create policy question_set_items_write on public.question_set_items
for all
to authenticated
using (public.is_central_admin())
with check (public.is_central_admin());

commit;
