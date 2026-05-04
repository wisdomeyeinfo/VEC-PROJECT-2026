-- Fix RLS for exam attempts to allow staff visibility
begin;

-- exam_attempts: staff can read their team's attempts; central admins can read all
drop policy if exists exam_attempts_staff_select on public.exam_attempts;
create policy exam_attempts_staff_select on public.exam_attempts
for select to authenticated
using (
  public.is_central_admin() 
  or exists (
    select 1 from public.team_members tm 
    where tm.team_id = exam_attempts.team_id 
      and tm.user_id = auth.uid() 
      and tm.status = 'active'
  )
);

-- results_visibility: Fix upsert policy (already exists but ensuring it works for staff)
-- Central admins already have 'all' policy, but let's make sure it's robust.

commit;
