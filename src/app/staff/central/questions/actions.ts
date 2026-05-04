"use server";

import { parse } from "csv-parse/sync";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeCorrectOption(value: string): number {
  const v = value.trim();
  if (!v) return 0;
  if (/^\d+$/.test(v)) return Math.max(0, Math.min(3, Number(v)));
  const upper = v.toUpperCase();
  const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  if (upper in map) return map[upper];
  return 0;
}

export async function importQuestionsCsv(formData: FormData) {
  const language = String(formData.get("language") || "").trim();
  const setType = String(formData.get("set_type") || "").trim();
  const file = formData.get("file");

  if (!language) throw new Error("Language is required");
  if (!["fixed100", "extra50"].includes(setType)) throw new Error("Set type must be fixed100 or extra50");
  if (!(file instanceof File)) throw new Error("CSV file is required");

  const csvText = new TextDecoder().decode(await file.arrayBuffer());
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;

  if (records.length === 0) throw new Error("CSV is empty");
  if (records.length > 5000) throw new Error("Too many rows (max 5000 per import)");

  const supabase = await createSupabaseServerClient();

  const { data: setRow, error: setErr } = await supabase
    .from("question_sets")
    .upsert({ language, type: setType })
    .select("id")
    .single();
  if (setErr) throw setErr;

  const toInsert = records.map((r) => {
    const question_text = r.question_text || r.question || "";
    const options = [
      r.option_a || r.a || "",
      r.option_b || r.b || "",
      r.option_c || r.c || "",
      r.option_d || r.d || "",
    ];
    const correct_option = normalizeCorrectOption(r.correct_option || r.correct || "A");
    return { language, question_text, options, correct_option, active: true };
  });

  const { data: inserted, error: insErr } = await supabase
    .from("questions")
    .insert(toInsert)
    .select("id");
  if (insErr) throw insErr;

  const items = (inserted ?? []).map((q) => ({
    question_set_id: setRow.id,
    question_id: q.id,
  }));
  if (items.length) {
    const { error: linkErr } = await supabase.from("question_set_items").insert(items);
    if (linkErr) throw linkErr;
  }

  revalidatePath("/staff/central/questions");
}

