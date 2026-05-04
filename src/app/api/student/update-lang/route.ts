import { getStudentSession, setStudentSession } from "@/lib/student/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { language } = await request.json();
  const session = await getStudentSession();

  if (!session) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  // Update session cookie
  await setStudentSession({
    ...session,
    language,
  });

  // Update database record for persistence
  const admin = createSupabaseAdminClient();
  await admin
    .from("students")
    .update({ language })
    .eq("id", session.student_id);

  return NextResponse.json({ success: true });
}
