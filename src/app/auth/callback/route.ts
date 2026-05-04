import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { setStudentSession } from "@/lib/student/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const requestedNext = url.searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/student";

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

  const admin = createSupabaseAdminClient();

  // If next is staff related
  if (next.startsWith("/staff")) {
    const { data: member } = await admin
      .from("team_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    
    if (!member) {
      // SECURITY: If user is not a recognized staff member, sign them out immediately
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/staff/login?error=unauthorized", url.origin));
    }
    return NextResponse.redirect(new URL(next, url.origin));
  }

  // If this google user is already linked to a student, sign them into the student session.
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
      whatsapp_joined: true,
    });
    return NextResponse.redirect(new URL(next, url.origin));
  }

  // Not linked yet: ask for activation code once to link.
  return NextResponse.redirect(new URL("/student/link", url.origin));
}
