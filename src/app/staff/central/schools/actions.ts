"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createSchool(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const district = String(formData.get("district") || "").trim();
  const teamId = String(formData.get("teamId") || "").trim();

  if (!name || !state || !district) {
    throw new Error("Name, State, and District are required");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("schools").insert({
    name,
    state,
    district,
    team_id: teamId || null,
  });

  if (error) throw error;

  revalidatePath("/staff/central/schools");
}

export async function deleteSchool(schoolId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("schools").delete().eq("id", schoolId);
  if (error) throw error;
  revalidatePath("/staff/central/schools");
}
