"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createKitItem(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const languageSpecific = formData.get("language_specific") === "on";

  if (!name) throw new Error("Item name is required");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("kit_items").insert({
    name,
    category: category || null,
    language_specific: languageSpecific,
  });
  if (error) throw error;

  revalidatePath("/staff/central/items");
}

