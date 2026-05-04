begin;

alter table public.students
  add column if not exists auth_user_id uuid,
  add column if not exists email text;

create unique index if not exists students_auth_user_id_unique
  on public.students(auth_user_id)
  where auth_user_id is not null;

commit;

