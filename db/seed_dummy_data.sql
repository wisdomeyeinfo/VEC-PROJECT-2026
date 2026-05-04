-- Dummy seed data for Values For All (VEC)
-- Run AFTER migrations:
--   - db/migrations/0001_init.sql
--   - db/migrations/0002_exam_scoring.sql
--
-- Notes:
-- - This seed does NOT create Supabase Auth users. Create staff users in Supabase Auth UI,
--   then insert matching rows into public.team_members manually.
-- - This seed creates a full English question bank so the exam can run:
--   100 fixed + 50 extra (150 total), and links them to question_sets.

begin;

-- Fixed IDs (so later inserts can reference them safely)
-- Teams
-- Pune team:   11111111-1111-1111-1111-111111111111
-- Nashik team: 22222222-2222-2222-2222-222222222222
-- Items
-- QB:         aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
-- Gita:       bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- Calendar:   cccccccc-cccc-cccc-cccc-cccccccccccc
-- Pen:        dddddddd-dddd-dddd-dddd-dddddddddddd
-- Schools
-- Hadapsar:   33333333-3333-3333-3333-333333333333
-- VidyaM:     44444444-4444-4444-4444-444444444444
-- NashikPub:  55555555-5555-5555-5555-555555555555
-- Question sets
-- fixed100:   eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee
-- extra50:    ffffffff-ffff-ffff-ffff-ffffffffffff

insert into public.teams (id, name, city_region, year, whatsapp_invite_url, active)
values
  ('11111111-1111-1111-1111-111111111111', 'VEC Team Pune', 'Pune', 2026, 'https://chat.whatsapp.com/EXAMPLE_PUNE', true),
  ('22222222-2222-2222-2222-222222222222', 'VEC Team Nashik', 'Nashik', 2026, 'https://chat.whatsapp.com/EXAMPLE_NASHIK', true)
on conflict (id) do update set
  name = excluded.name,
  city_region = excluded.city_region,
  year = excluded.year,
  whatsapp_invite_url = excluded.whatsapp_invite_url,
  active = excluded.active;

insert into public.kit_items (id, name, category, language_specific, active)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Value Education Question Bank', 'Books', true, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bhagavad Gita', 'Books', true, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Calendar', 'Merch', false, true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Pen', 'Merch', false, true)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  language_specific = excluded.language_specific,
  active = excluded.active;

insert into public.schools (
  id,
  district, taluka, name,
  principal_name, principal_phone,
  teacher_name, teacher_phone,
  remarks
)
values
  ('33333333-3333-3333-3333-333333333333', 'Pune', 'Haveli', 'ZP School Hadapsar', 'Mr. Patil', '9000000001', 'Mrs. Deshmukh', '9000000002', 'Visited once'),
  ('44444444-4444-4444-4444-444444444444', 'Pune', 'Mulshi', 'Shri Vidya Mandir', 'Mrs. Kulkarni', '9000000003', 'Mr. Jadhav', '9000000004', 'Permission pending'),
  ('55555555-5555-5555-5555-555555555555', 'Nashik', 'Nashik', 'Nashik Public School', 'Mr. Sharma', '9000000005', 'Mrs. Joshi', '9000000006', 'Announcement done')
on conflict (id) do update set
  district = excluded.district,
  taluka = excluded.taluka,
  name = excluded.name,
  principal_name = excluded.principal_name,
  principal_phone = excluded.principal_phone,
  teacher_name = excluded.teacher_name,
  teacher_phone = excluded.teacher_phone,
  remarks = excluded.remarks;

insert into public.school_visits (team_id, school_id, status)
select '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'permission_granted'
on conflict (team_id, school_id) do update set status = excluded.status, updated_at = now();

insert into public.school_visits (team_id, school_id, status)
select '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'permission_pending'
on conflict (team_id, school_id) do update set status = excluded.status, updated_at = now();

insert into public.school_visits (team_id, school_id, status)
select '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'announcement_done'
on conflict (team_id, school_id) do update set status = excluded.status, updated_at = now();

-- Stock allocation (ledger + on-hand)
insert into public.stock_movements (from_team_id, to_team_id, item_id, language, qty, reason)
values
  (null, '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'en', 500, 'allocation'),
  (null, '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'hi', 500, 'allocation'),
  (null, '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'en', 200, 'allocation'),
  (null, '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', null, 300, 'allocation'),
  (null, '11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', null, 600, 'allocation'),
  (null, '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'en', 400, 'allocation'),
  (null, '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', null, 500, 'allocation')
on conflict do nothing;

-- Team stock rows (simple on-hand snapshot)
insert into public.team_stock (team_id, item_id, language, qty_on_hand)
values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'en', 500),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'hi', 500),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'en', 200),
  ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', null, 300),
  ('11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', null, 600),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'en', 400),
  ('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', null, 500)
on conflict (team_id, item_id, language) do update set qty_on_hand = excluded.qty_on_hand, updated_at = now();

-- Activation codes (a small batch)
insert into public.activation_codes (code, team_id, year, status)
select
  'PUNE' || lpad(gs::text, 5, '0') as code,
  '11111111-1111-1111-1111-111111111111' as team_id,
  2026 as year,
  'unused'::public.activation_code_status as status
from generate_series(1, 20) gs
on conflict (code) do nothing;

-- Exam config (enabled now)
insert into public.exam_configs (team_id, enabled_from, enabled_to, duration_minutes)
values
  ('11111111-1111-1111-1111-111111111111', now() - interval '1 day', now() + interval '30 days', 240),
  ('22222222-2222-2222-2222-222222222222', now() - interval '1 day', now() + interval '30 days', 240)
on conflict (team_id) do update set
  enabled_from = excluded.enabled_from,
  enabled_to = excluded.enabled_to,
  duration_minutes = excluded.duration_minutes;

-- Results visibility (default hidden)
insert into public.results_visibility (team_id, visible, visible_from)
values
  ('11111111-1111-1111-1111-111111111111', false, null),
  ('22222222-2222-2222-2222-222222222222', false, null)
on conflict (team_id) do update set visible = excluded.visible, visible_from = excluded.visible_from;

-- Ensure question sets exist (fixed IDs)
insert into public.question_sets (id, language, type, name)
values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'en', 'fixed100', 'English Fixed 100'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'en', 'extra50', 'English Extra 50')
on conflict (id) do update set name = excluded.name;

-- Build an English question bank (150 total):
-- - fixed100: Q001..Q100
-- - extra50 : Q101..Q150
with q as (
  insert into public.questions (language, question_text, options, correct_option, tags, active)
  select
    'en' as language,
    format('Sample Question %s: What is the right value here?', lpad(gs::text, 3, '0')) as question_text,
    jsonb_build_array(
      'Option A',
      'Option B',
      'Option C',
      'Option D'
    ) as options,
    (gs % 4) as correct_option,
    array['sample']::text[] as tags,
    true as active
  from generate_series(1, 150) gs
  returning id, question_text
),
ordered as (
  select id, question_text
  from q
  order by question_text asc
),
fixed_questions as (
  select id from ordered limit 100
),
extra_questions as (
  select id from ordered offset 100 limit 50
)
insert into public.question_set_items (question_set_id, question_id)
select 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, id from fixed_questions
union all
select 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, id from extra_questions
on conflict do nothing;

commit;

