import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/student/session";

export async function POST() {
  const session = await getStudentSession();
  if (!session) return new NextResponse("Not signed in", { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data: attempt, error: attemptErr } = await admin
    .from("exam_attempts")
    .select("id, status")
    .eq("student_id", session.student_id)
    .maybeSingle();
  if (attemptErr) return new NextResponse(attemptErr.message, { status: 400 });
  if (!attempt) return new NextResponse("Attempt not started", { status: 400 });
  if (attempt.status === "submitted") return NextResponse.json({ ok: true, status: "submitted" });

  const { data: aq, error: aqErr } = await admin
    .from("exam_attempt_questions")
    .select("question_id, questions ( id, correct_option )")
    .eq("attempt_id", attempt.id);
  if (aqErr) return new NextResponse(aqErr.message, { status: 400 });

  const { data: ans, error: ansErr } = await admin
    .from("exam_attempt_answers")
    .select("question_id, chosen_option")
    .eq("attempt_id", attempt.id);
  if (ansErr) return new NextResponse(ansErr.message, { status: 400 });

  const chosen = new Map((ans ?? []).map((a) => [a.question_id as string, a.chosen_option as number]));
  let score = 0;
  let total = 0;
  for (const row of aq ?? []) {
    const q = row.questions as unknown as { id: string; correct_option: number };
    total += 1;
    const picked = chosen.get(q.id);
    if (picked !== undefined && picked === q.correct_option) score += 1;
  }

  const percentage = total ? Number(((score / total) * 100).toFixed(2)) : 0;

  const { error: updErr } = await admin
    .from("exam_attempts")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      score,
      total,
      percentage,
    })
    .eq("id", attempt.id)
    .eq("status", "in_progress");
  if (updErr) return new NextResponse(updErr.message, { status: 400 });

  return NextResponse.json({ ok: true, status: "submitted", score, total, percentage });
}

