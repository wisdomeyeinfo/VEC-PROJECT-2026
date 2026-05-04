-- Fix RLS recursion causing stack depth errors.
-- Problem: is_central_admin() queries team_members, but team_members policy also calls is_central_admin().
-- Solution: make helper functions SECURITY DEFINER and temporarily disable row security inside.

begin;

create or replace function public.is_central_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform set_config('row_security', 'off', true);
  return exists (
    select 1
    from public.team_members tm
    where tm.user_id = auth.uid()
      and tm.role = 'central_admin'::public.team_role
      and tm.status = 'active'
  );
end;
$$;

create or replace function public.is_team_member(team_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform set_config('row_security', 'off', true);
  return exists (
    select 1
    from public.team_members tm
    where tm.user_id = auth.uid()
      and tm.team_id = is_team_member.team_id
      and tm.status = 'active'
  );
end;
$$;

commit;

