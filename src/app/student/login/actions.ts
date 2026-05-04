"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { setStudentSession } from "@/lib/student/session";
import crypto from "crypto";

/**
 * Simple password hashing using pbkdf2
 */
function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || "vec-default-salt";
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

export async function studentLogin(formData: FormData) {
  const examId = String(formData.get("examId") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!examId || !password) {
    throw new Error("Exam ID and Password are required");
  }

  const admin = createSupabaseAdminClient();

  // 1. Fetch student by Exam ID
  const { data: student, error } = await admin
    .from("students")
    .select("id, exam_id, temp_password, password_hash, onboarding_completed, language, team_id")
    .eq("exam_id", examId)
    .maybeSingle();

  if (error) throw new Error("Database error occurred");
  if (!student) throw new Error("Invalid Exam ID or Password");

  // 2. Check password
  const isTempMatch = student.temp_password === password;
  const isHashMatch = student.password_hash === hashPassword(password);

  if (!isTempMatch && !isHashMatch) {
    throw new Error("Invalid Exam ID or Password");
  }

  // 3. Set Session
  await setStudentSession({
    student_id: student.id,
    team_id: student.team_id,
    language: student.language || "en",
  });

  // 4. Redirect based on onboarding status
  if (!student.onboarding_completed) {
    redirect("/student/onboarding");
  }

  redirect("/student");
}

export async function completeOnboarding(formData: FormData) {
  const admin = createSupabaseAdminClient();
  const { student_id } = await (await import("@/lib/student/session")).getStudentSession() || {};
  
  if (!student_id) throw new Error("Not authenticated");

  const newPassword = String(formData.get("newPassword") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const gender = String(formData.get("gender") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const district = String(formData.get("district") || "").trim();
  const schoolId = String(formData.get("schoolId") || "").trim();
  let schoolName = String(formData.get("schoolName") || "").trim();
  const schoolNameOther = String(formData.get("schoolNameOther") || "").trim();

  if (schoolName === "Other" && schoolNameOther) {
    schoolName = schoolNameOther;
  }
  const standard = String(formData.get("standard") || "").trim();
  const division = String(formData.get("division") || "").trim();
  const mobile = String(formData.get("mobile") || "").trim();
  const language = String(formData.get("language") || "").trim();

  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  if (!name || !email || !schoolName || !state || !district || !standard || !language) {
    throw new Error("Please fill in all required fields");
  }

  const password_hash = hashPassword(newPassword);

  const { error } = await admin
    .from("students")
    .update({
      password_hash,
      name,
      gender,
      email,
      school_id: schoolId === "Other" || !schoolId ? null : schoolId,
      school_name: schoolName,
      state,
      district,
      class: standard,
      division,
      mobile,
      language,
      onboarding_completed: true,
      // Clear temp password for security
      temp_password: null,
    })
    .eq("id", student_id);

  if (error) throw new Error(error.message);

  // Here you would send an email...
  // sendOnboardingEmail(email, newPassword);

  redirect("/student");
}
