"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function generateCode() {
  // 10-char uppercase base32-ish (no confusing chars)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(10);
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

export async function generateActivationCodes(formData: FormData) {
  const teamId = String(formData.get("team_id") || "").trim();
  const year = Number(formData.get("year") || 0);
  const count = Number(formData.get("count") || 0);

  if (!teamId) throw new Error("Team is required");
  if (!year || Number.isNaN(year)) throw new Error("Year is required");
  if (!count || count <= 0 || count > 5000) throw new Error("Count must be between 1 and 5000");

  const codes = new Set<string>();
  while (codes.size < count) codes.add(generateCode());

  const rows = Array.from(codes).map((code) => ({
    code,
    team_id: teamId,
    year,
    status: "unused",
  }));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("activation_codes").insert(rows);
  if (error) throw error;

  revalidatePath("/staff/central/codes");
}

