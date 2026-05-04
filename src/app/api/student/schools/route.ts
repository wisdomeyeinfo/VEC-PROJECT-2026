import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = String(searchParams.get("code") || "")
    .trim()
    .toUpperCase();
  const district = String(searchParams.get("district") || "").trim();

  if (!code || district.length < 2) {
    return NextResponse.json({ schools: [] });
  }

  const admin = createSupabaseAdminClient();

  const { data: codeRow, error: codeErr } = await admin
    .from("activation_codes")
    .select("team_id, status")
    .eq("code", code)
    .maybeSingle();
  if (codeErr) return new NextResponse(codeErr.message, { status: 400 });
  if (!codeRow) return new NextResponse("Invalid activation code", { status: 400 });

  const { data: visits, error: visitsErr } = await admin
    .from("school_visits")
    .select("schools ( id, name, district )")
    .eq("team_id", codeRow.team_id)
    .eq("schools.district", district)
    .limit(200);
  if (visitsErr) return new NextResponse(visitsErr.message, { status: 400 });

  const schools =
    (visits ?? [])
      .map((v) => v.schools as unknown as { id: string; name: string; district: string })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name)) ?? [];

  return NextResponse.json({ schools });
}

