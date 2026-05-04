"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function setResultsVisibility(formData: FormData) {
  const teamId = String(formData.get("team_id") || "").trim();
  // In a form submission, if checkbox is not checked, it's not in formData at all.
  // In our new auto-save logic, we'll pass it explicitly if needed.
  const visible = formData.get("visible") === "true" || formData.get("visible") === "on";

  if (!teamId) throw new Error("Team ID is missing");

  const supabase = await createSupabaseServerClient();
  
  try {
    const { error } = await supabase.from("results_visibility").upsert({
      team_id: teamId,
      visible: visible,
      visible_from: visible ? new Date().toISOString() : null,
    }, { onConflict: 'team_id' });
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('schema cache')) {
        throw new Error("Results table is not ready yet. Please contact technical support.");
      }
      throw error;
    }
  } catch (e: any) {
    console.error("Result Toggle Error:", e);
    throw new Error(e.message || "Failed to update visibility");
  }

  revalidatePath("/staff/central/results");
  return { success: true };
}
