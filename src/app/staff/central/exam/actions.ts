"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function upsertExamConfig(formData: FormData) {
  const teamId = String(formData.get("team_id") || "").trim();
  const enabledFrom = String(formData.get("enabled_from") || "").trim();
  const enabledTo = String(formData.get("enabled_to") || "").trim();
  const durationMinutes = Number(formData.get("duration_minutes") || 240);

  if (!teamId) throw new Error("Team is required");
  if (!durationMinutes || durationMinutes < 30 || durationMinutes > 600) {
    throw new Error("Duration must be between 30 and 600 minutes");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("exam_configs").upsert({
    team_id: teamId,
    enabled_from: enabledFrom ? new Date(enabledFrom).toISOString() : null,
    enabled_to: enabledTo ? new Date(enabledTo).toISOString() : null,
    duration_minutes: durationMinutes,
  });
  if (error) throw error;

  revalidatePath("/staff/central/exam");
}

