"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function recordStockAdjustment(teamId: string, formData: FormData) {
  const itemId = String(formData.get("item_id") || "").trim();
  const language = String(formData.get("language") || "").trim() || null;
  const direction = String(formData.get("direction") || "in");
  const qty = Number(formData.get("qty") || 0);

  if (!itemId) throw new Error("Item is required");
  if (!qty || qty <= 0 || Number.isNaN(qty)) throw new Error("Quantity must be > 0");

  const fromTeamId = direction === "out" ? teamId : null;
  const toTeamId = direction === "in" ? teamId : null;

  const supabase = await createSupabaseServerClient();

  const { error: mvErr } = await supabase.from("stock_movements").insert({
    from_team_id: fromTeamId,
    to_team_id: toTeamId,
    item_id: itemId,
    language,
    qty,
    reason: "adjustment",
  });
  if (mvErr) throw mvErr;

  const delta = direction === "out" ? -qty : qty;
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
      qty_on_hand: Math.max(0, delta),
    });
    if (insErr) throw insErr;
  } else {
    const nextQty = Math.max(0, Number(existing.qty_on_hand) + delta);
    const { error: upErr } = await supabase
      .from("team_stock")
      .update({ qty_on_hand: nextQty, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (upErr) throw upErr;
  }

  revalidatePath(`/staff/team/${teamId}/stock`);
}

export async function recordDistribution(teamId: string, formData: FormData) {
  const schoolId = String(formData.get("school_id") || "").trim();
  const itemId = String(formData.get("item_id") || "").trim();
  const language = String(formData.get("language") || "").trim() || null;
  const qty = Number(formData.get("qty") || 0);

  if (!schoolId) throw new Error("School is required");
  if (!itemId) throw new Error("Item is required");
  if (!qty || qty <= 0 || Number.isNaN(qty)) throw new Error("Quantity must be > 0");

  const supabase = await createSupabaseServerClient();

  const { error: mvErr } = await supabase.from("stock_movements").insert({
    from_team_id: teamId,
    to_team_id: null,
    item_id: itemId,
    language,
    qty,
    reason: "distribution",
    school_id: schoolId,
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

  const current = Number(existing?.qty_on_hand ?? 0);
  const nextQty = Math.max(0, current - qty);

  if (!existing) {
    const { error: insErr } = await supabase.from("team_stock").insert({
      team_id: teamId,
      item_id: itemId,
      language,
      qty_on_hand: 0,
    });
    if (insErr) throw insErr;
  } else {
    const { error: upErr } = await supabase
      .from("team_stock")
      .update({ qty_on_hand: nextQty, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (upErr) throw upErr;
  }

  revalidatePath(`/staff/team/${teamId}/stock`);
}

