import { createSupabaseServerClient } from "@/lib/supabase/server";
import { clearStudentSession } from "@/lib/student/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  // Check if we have a session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  // Also clear the custom student session cookie
  await clearStudentSession();

  return NextResponse.redirect(new URL("/", request.url), {
    status: 302,
  });
}
