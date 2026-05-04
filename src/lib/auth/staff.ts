import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StaffMembership = {
  team_id: string;
  role: "central_admin" | "leader" | "member";
  status: string;
};

export async function requireStaffUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("Not authenticated");

  return { supabase, user };
}

export async function getMyStaffMemberships(): Promise<StaffMembership[]> {
  const { supabase } = await requireStaffUser();
  const { data, error } = await supabase
    .from("team_members")
    .select("team_id, role, status")
    .eq("status", "active");
  if (error) throw error;
  return (data ?? []) as StaffMembership[];
}

export async function isCentralAdmin(): Promise<boolean> {
  const memberships = await getMyStaffMemberships();
  return memberships.some((m) => m.role === "central_admin" && m.status === "active");
}

