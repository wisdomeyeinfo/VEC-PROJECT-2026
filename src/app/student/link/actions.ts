"use server";

import { redirect } from "next/navigation";
import { requireStudentGoogleUser } from "@/lib/auth/studentGoogle";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { setStudentSession } from "@/lib/student/session";

export async function linkGoogleWithActivationCode(formData: FormData) {
  const code = String(formData.get("activation_code") || "")
    .trim()
    .toUpperCase();

  if (!code) throw new Error("Activation code is required");

  const {
    user,
  } = await requireStudentGoogleUser();

  const admin = createSupabaseAdminClient();

  // If this google account is already linked, just sign in.
  const { data: alreadyLinked } = await admin
    .from("students")
    .select("id, team_id, language")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (alreadyLinked) {
    await setStudentSession({
      student_id: alreadyLinked.id,
      team_id: alreadyLinked.team_id,
      language: alreadyLinked.language,
      whatsapp_joined: true,
    });
    redirect("/student");
  }

  // Find activation code
  const { data: codeRow, error: codeErr } = await admin
    .from("activation_codes")
    .select("code, team_id, status")
    .eq("code", code)
    .maybeSingle();
  if (codeErr) throw codeErr;
  if (!codeRow) throw new Error("Invalid activation code");

  // If code is unused, we cannot create a student without profile here.
  // Tell user to activate first time (or we could extend this form later).
  if (codeRow.status === "unused") {
    throw new Error("This code is not activated yet. Please activate first using the full form.");
  }

  if (codeRow.status !== "redeemed") {
    throw new Error("This activation code is revoked.");
  }

  // Link google to existing student by activation_code
  const { data: student, error: studentErr } = await admin
    .from("students")
    .select("id, team_id, language, auth_user_id")
    .eq("activation_code", codeRow.code)
    .maybeSingle();
  if (studentErr) throw studentErr;
  if (!student) throw new Error("Student record not found for this activation code");

  if (student.auth_user_id && student.auth_user_id !== user.id) {
    throw new Error("This activation code is already linked to another Google account.");
  }

  const { error: updErr } = await admin
    .from("students")
    .update({
      auth_user_id: user.id,
      email: user.email ?? null,
    })
    .eq("id", student.id);
  if (updErr) throw updErr;

  await setStudentSession({
    student_id: student.id,
    team_id: student.team_id,
    language: student.language,
    whatsapp_joined: true,
  });

  redirect("/student");
}

