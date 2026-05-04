import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { setStudentSession } from "@/lib/student/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const next = url.searchParams.get("next") || "/student";

  if (!code) {
    return NextResponse.redirect(new URL("/student/login?error=missing_code", url.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/student/login?error=${encodeURIComponent(error.message)}`, url.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/student/login?error=no_user", url.origin));
  }

  // If this google user is already linked to a student, sign them into the student session.
  const admin = createSupabaseAdminClient();
  const { data: student } = await admin
    .from("students")
    .select("id, team_id, language")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (student) {
    await setStudentSession({
      student_id: student.id,
      team_id: student.team_id,
      language: student.language,
      whatsapp_joined: true, // they must have joined once earlier; still gated by UI if needed
    });
    return NextResponse.redirect(new URL(next, url.origin));
  }

  // Not linked yet: ask for activation code once to link.
  return NextResponse.redirect(new URL("/student/link", url.origin));
}

