import crypto from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/student/session";
import { mulberry32, shuffleInPlace } from "@/lib/exam/random";

async function getQuestionIdsForSet(admin: ReturnType<typeof createSupabaseAdminClient>, language: string, type: string) {
  const { data: setRow, error: setErr } = await admin
    .from("question_sets")
    .select("id")
    .eq("language", language)
    .eq("type", type)
    .maybeSingle();
  if (setErr) throw setErr;
  if (!setRow) return [];

  const { data: items, error: itemsErr } = await admin
    .from("question_set_items")
    .select("question_id")
    .eq("question_set_id", setRow.id);
  if (itemsErr) throw itemsErr;
  return (items ?? []).map((i) => i.question_id as string);
}

export async function GET() {
  const session = await getStudentSession();
  if (!session) return new NextResponse("Not signed in", { status: 401 });

  const admin = createSupabaseAdminClient();

  const { data: student, error: studentErr } = await admin
    .from("students")
    .select("id, team_id, language")
    .eq("id", session.student_id)
    .maybeSingle();
  if (studentErr) return new NextResponse(studentErr.message, { status: 400 });
  if (!student) return new NextResponse("Student not found", { status: 400 });

  const now = new Date();

  const { data: cfg } = await admin
    .from("exam_configs")
    .select("enabled_from, enabled_to, duration_minutes")
    .eq("team_id", student.team_id)
    .maybeSingle();

  const enabledFrom = cfg?.enabled_from ? new Date(cfg.enabled_from) : null;
  const enabledTo = cfg?.enabled_to ? new Date(cfg.enabled_to) : null;
  const durationMinutes = cfg?.duration_minutes ?? 240;

  const enabled =
    (!enabledFrom || now >= enabledFrom) && (!enabledTo || now <= enabledTo);
  if (!enabled) {
    return NextResponse.json({
      enabled: false,
      reason: "Exam is not enabled right now.",
    });
  }

  const { data: attemptExisting, error: attemptErr } = await admin
    .from("exam_attempts")
    .select("id, status, started_at, submitted_at, seed, score, total, percentage")
    .eq("student_id", student.id)
    .maybeSingle();
  if (attemptErr) return new NextResponse(attemptErr.message, { status: 400 });

  let attempt = attemptExisting;

  if (!attempt) {
    const seed = crypto.randomBytes(8).toString("hex");
    const seedNum = parseInt(seed.slice(0, 8), 16) >>> 0;
    const rand = mulberry32(seedNum);

    const fixedIds = await getQuestionIdsForSet(admin, student.language, "fixed100");
    const extraIds = await getQuestionIdsForSet(admin, student.language, "extra50");

    if (fixedIds.length < 100) {
      return NextResponse.json({
        enabled: false,
        reason: `Not enough fixed questions for ${student.language} (need 100).`,
      });
    }
    if (extraIds.length < 20) {
      return NextResponse.json({
        enabled: false,
        reason: `Not enough extra questions for ${student.language} (need at least 20).`,
      });
    }

    // Pick exactly 100 fixed (first 100 after shuffle) and 20 from extra
    shuffleInPlace(fixedIds, rand);
    shuffleInPlace(extraIds, rand);
    const selected = fixedIds.slice(0, 100).concat(extraIds.slice(0, 20));
    shuffleInPlace(selected, rand);

    let { data: created, error: createErr } = await admin
      .from("exam_attempts")
      .insert({
        student_id: student.id,
        team_id: student.team_id,
        status: "in_progress",
        seed,
      })
      .select("id, status, started_at, submitted_at, seed, score, total, percentage")
      .single();

    if (createErr) {
      // If it's a unique violation, someone else (or a previous request) created it
      if (createErr.code === '23505') {
        const { data: retry } = await admin
          .from("exam_attempts")
          .select("id, status, started_at, submitted_at, seed, score, total, percentage")
          .eq("student_id", student.id)
          .single();
        if (retry) {
          created = retry;
        } else {
          return new NextResponse("Concurrent creation failed", { status: 400 });
        }
      } else {
        return new NextResponse(createErr.message, { status: 400 });
      }
    }

    const attemptQuestions = selected.map((question_id, idx) => ({
      attempt_id: created!.id,
      question_id,
      position: idx,
    }));
    const { error: qErr } = await admin.from("exam_attempt_questions").insert(attemptQuestions);
    if (qErr) return new NextResponse(qErr.message, { status: 400 });

    attempt = created;
  }

  const startedAt = new Date(attempt.started_at);
  const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
  const remainingMs = Math.max(0, expiresAt.getTime() - now.getTime());
  const timeUp = remainingMs <= 0;

  if (attempt.status !== "submitted" && timeUp) {
    // Auto-submit (best-effort) when time is up.
    await admin
      .from("exam_attempts")
      .update({ status: "submitted", submitted_at: new Date().toISOString() })
      .eq("id", attempt.id)
      .eq("status", "in_progress");
    attempt = { ...attempt, status: "submitted", submitted_at: new Date().toISOString() } as typeof attempt;
  }

  const { data: aq, error: aqErr } = await admin
    .from("exam_attempt_questions")
    .select("question_id, position, questions ( id, question_text, options )")
    .eq("attempt_id", attempt.id)
    .order("position", { ascending: true });
  if (aqErr) return new NextResponse(aqErr.message, { status: 400 });

  const { data: ans, error: ansErr } = await admin
    .from("exam_attempt_answers")
    .select("question_id, chosen_option")
    .eq("attempt_id", attempt.id);
  if (ansErr) return new NextResponse(ansErr.message, { status: 400 });

  const answers: Record<string, number> = {};
  for (const a of ans ?? []) {
    if (a.chosen_option === null || a.chosen_option === undefined) continue;
    answers[a.question_id as string] = a.chosen_option as number;
  }

  const questions =
    (aq ?? []).map((row) => {
      const q = row.questions as unknown as { id: string; question_text: string; options: unknown };
      return {
        id: q.id,
        position: row.position,
        question_text: q.question_text,
        options: q.options,
      };
    }) ?? [];

  return NextResponse.json({
    enabled: true,
    attempt: {
      id: attempt.id,
      status: attempt.status,
      started_at: attempt.started_at,
      submitted_at: attempt.submitted_at,
      duration_minutes: durationMinutes,
      remaining_ms: remainingMs,
      score: attempt.score ?? null,
      total: attempt.total ?? null,
      percentage: attempt.percentage ?? null,
    },
    questions,
    answers,
  });
}

