begin;

alter table public.exam_attempts
  add column if not exists score int,
  add column if not exists total int,
  add column if not exists percentage numeric(5,2);

commit;

