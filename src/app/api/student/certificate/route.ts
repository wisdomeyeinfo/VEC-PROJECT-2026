import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/student/session";

export async function GET() {
  const session = await getStudentSession();
  if (!session) return new NextResponse("Not signed in", { status: 401 });

  const admin = createSupabaseAdminClient();

  const [{ data: vis }, { data: student }] = await Promise.all([
    admin
      .from("results_visibility")
      .select("visible")
      .eq("team_id", session.team_id)
      .maybeSingle(),
    admin
      .from("students")
      .select("id, name, team_id")
      .eq("id", session.student_id)
      .maybeSingle(),
  ]);

  if (!vis?.visible) return new NextResponse("Results not available", { status: 403 });
  if (!student) return new NextResponse("Student not found", { status: 400 });

  const { data: attempt } = await admin
    .from("exam_attempts")
    .select("status, score, total, percentage, submitted_at")
    .eq("student_id", student.id)
    .maybeSingle();

  if (!attempt || attempt.status !== "submitted") {
    return new NextResponse("Exam not submitted", { status: 400 });
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const title = "Certificate of Participation";
  const subtitle = "Values For All • Value Education Contest";
  const nameLine = student.name;
  const scoreLine =
    attempt.percentage !== null && attempt.percentage !== undefined
      ? `Score: ${attempt.score ?? 0}/${attempt.total ?? 0} (${attempt.percentage}%)`
      : "Score: -";

  page.drawRectangle({
    x: 36,
    y: 36,
    width: 595.28 - 72,
    height: 841.89 - 72,
    borderColor: rgb(0.95, 0.45, 0.1),
    borderWidth: 2,
  });

  page.drawText(title, {
    x: 80,
    y: 720,
    size: 28,
    font: fontBold,
    color: rgb(0.15, 0.15, 0.15),
  });
  page.drawText(subtitle, {
    x: 80,
    y: 690,
    size: 14,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });

  page.drawText("This certifies that", {
    x: 80,
    y: 610,
    size: 14,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(nameLine, {
    x: 80,
    y: 570,
    size: 24,
    font: fontBold,
    color: rgb(0.95, 0.45, 0.1),
  });

  page.drawText("has participated in the Values For All contest.", {
    x: 80,
    y: 535,
    size: 14,
    font,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(scoreLine, {
    x: 80,
    y: 490,
    size: 14,
    font: fontBold,
    color: rgb(0.15, 0.15, 0.15),
  });

  page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
    x: 80,
    y: 120,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  const bytes = await pdf.save();

  // Best-effort upload to Supabase Storage (bucket must exist or be created).
  const bucket = "certificates";
  try {
    await admin.storage.createBucket(bucket, { public: false }).catch(() => {});
    const path = `${session.team_id}/${student.id}.pdf`;
    await admin.storage.from(bucket).upload(path, bytes, {
      upsert: true,
      contentType: "application/pdf",
    });
  } catch {
    // Ignore storage errors; user can still download the generated PDF response.
  }

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename=\"VFA-Certificate-${student.id}.pdf\"`,
    },
  });
}

