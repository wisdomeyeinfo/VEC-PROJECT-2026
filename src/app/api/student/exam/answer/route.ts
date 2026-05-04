import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/student/session";

export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) return new NextResponse("Not signed in", { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { question_id?: string; chosen_option?: number }
    | null;
  const questionId = String(body?.question_id || "").trim();
  const chosenOption = body?.chosen_option;

  if (!questionId) return new NextResponse("question_id required", { status: 400 });
  if (typeof chosenOption !== "number" || chosenOption < 0 || chosenOption > 3) {
    return new NextResponse("chosen_option must be 0..3", { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: attempt, error: attemptErr } = await admin
    .from("exam_attempts")
    .select("id, status")
    .eq("student_id", session.student_id)
    .maybeSingle();
  if (attemptErr) return new NextResponse(attemptErr.message, { status: 400 });
  if (!attempt) return new NextResponse("Attempt not started", { status: 400 });
  if (attempt.status === "submitted") return new NextResponse("Attempt already submitted", { status: 409 });

  const { error } = await admin.from("exam_attempt_answers").upsert({
    attempt_id: attempt.id,
    question_id: questionId,
    chosen_option: chosenOption,
    answered_at: new Date().toISOString(),
  });
  if (error) return new NextResponse(error.message, { status: 400 });

  await admin
    .from("exam_attempts")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", attempt.id);

  return NextResponse.json({ ok: true });
}

