"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function inviteAndAssignStaff(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const teamId = String(formData.get("team_id") || "").trim();
  const role = String(formData.get("role") || "member").trim();

  if (!email) throw new Error("Email is required");
  if (!teamId) throw new Error("Team is required");
  if (!["central_admin", "leader", "member"].includes(role)) throw new Error("Invalid role");

  const admin = createSupabaseAdminClient();
  const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email);
  if (inviteErr) throw inviteErr;

  const userId = invited.user?.id;
  if (!userId) throw new Error("Invite succeeded but user id missing");

  const supabase = await createSupabaseServerClient();
  const { error: tmErr } = await supabase.from("team_members").upsert({
    user_id: userId,
    team_id: teamId,
    role,
    status: "active",
  });
  if (tmErr) throw tmErr;

  revalidatePath("/staff/central/members");
}

