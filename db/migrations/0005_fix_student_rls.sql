-- Fix RLS to allow students to see their own records
begin;

-- Allow students to read their own record in the students table
drop policy if exists students_self_select on public.students;
create policy students_self_select on public.students
for select
to authenticated
using (auth_user_id = auth.uid());

-- Allow students to read their own exam attempts
drop policy if exists exam_attempts_self_select on public.exam_attempts;
create policy exam_attempts_self_select on public.exam_attempts
for select
to authenticated
using (
  exists (
    select 1 from public.students s
    where s.id = exam_attempts.student_id
      and s.auth_user_id = auth.uid()
  )
);

commit;
