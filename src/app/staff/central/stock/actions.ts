"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function allocateStockToTeam(formData: FormData) {
  const teamId = String(formData.get("team_id") || "").trim();
  const itemId = String(formData.get("item_id") || "").trim();
  const language = String(formData.get("language") || "").trim() || null;
  const qty = Number(formData.get("qty") || 0);

  if (!teamId) throw new Error("Team is required");
  if (!itemId) throw new Error("Item is required");
  if (!qty || qty <= 0 || Number.isNaN(qty)) throw new Error("Quantity must be > 0");

  const supabase = await createSupabaseServerClient();

  const { error: mvErr } = await supabase.from("stock_movements").insert({
    from_team_id: null,
    to_team_id: teamId,
    item_id: itemId,
    language,
    qty,
    reason: "allocation",
  });
  if (mvErr) throw mvErr;

  const { data: existing, error: exErr } = await supabase
    .from("team_stock")
    .select("id, qty_on_hand")
    .eq("team_id", teamId)
    .eq("item_id", itemId)
    .eq("language", language)
    .maybeSingle();
  if (exErr) throw exErr;

  if (!existing) {
    const { error: insErr } = await supabase.from("team_stock").insert({
      team_id: teamId,
      item_id: itemId,
      language,
      qty_on_hand: qty,
    });
    if (insErr) throw insErr;
  } else {
    const nextQty = Number(existing.qty_on_hand) + qty;
    const { error: upErr } = await supabase
      .from("team_stock")
      .update({ qty_on_hand: nextQty, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (upErr) throw upErr;
  }

  revalidatePath("/staff/central/stock");
}

