"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createTeam(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const year = Number(formData.get("year") || 0);
  const cityRegion = String(formData.get("city_region") || "").trim();
  const whatsappInviteUrl = String(formData.get("whatsapp_invite_url") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const district = String(formData.get("district") || "").trim();

  if (!name) throw new Error("Team name is required");
  if (!year || Number.isNaN(year)) throw new Error("Year is required");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("teams").insert({
    name,
    year,
    city_region: cityRegion || null,
    whatsapp_invite_url: whatsappInviteUrl || null,
    state: state || null,
    district: district || null,
  });
  if (error) throw error;

  revalidatePath("/staff/central/teams");
}

