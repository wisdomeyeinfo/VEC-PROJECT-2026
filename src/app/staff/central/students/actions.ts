"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateExamId, generateTempPassword } from "@/lib/student/auth-utils";
import { revalidatePath } from "next/cache";

/**
 * Generates a batch of students for a specific team
 */
export async function generateStudents(formData: FormData) {
  const teamId = String(formData.get("teamId") || "");
  const count = Number(formData.get("count") || 0);

  if (!teamId || count <= 0) {
    throw new Error("Invalid team ID or count");
  }

  const admin = createSupabaseAdminClient();
  const studentsToInsert = [];

  for (let i = 0; i < count; i++) {
    const examId = generateExamId();
    studentsToInsert.push({
      team_id: teamId,
      exam_id: examId,
      activation_code: examId, 
      temp_password: generateTempPassword(),
      onboarding_completed: false,
      // Placeholders to satisfy NOT NULL constraints until SQL is run
      district: "Pending",
      name: "New Student",
      language: "en",
    });
  }

  const { error } = await admin.from("students").insert(studentsToInsert);

  if (error) {
    // Handle collisions (retry or throw)
    if (error.code === "23505") {
      throw new Error("Collision detected. Please try generating again.");
    }
    throw new Error(error.message);
  }

  revalidatePath("/staff/central/students");
}

/**
 * Resets a student's password to a new temporary one
 */
export async function resetStudentPassword(studentId: string): Promise<{ newTempPassword: string }> {
  const admin = createSupabaseAdminClient();
  const newTempPassword = generateTempPassword();

  const { error } = await admin
    .from("students")
    .update({
      temp_password: newTempPassword,
      password_hash: null,
      onboarding_completed: false,
    })
    .eq("id", studentId);

  if (error) throw new Error(error.message);

  revalidatePath("/staff/central/students");
  return { newTempPassword };
}

/**
 * Deletes a student record
 */
export async function deleteStudent(studentId: string) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("students").delete().eq("id", studentId);

  if (error) throw new Error(error.message);

  revalidatePath("/staff/central/students");
  return { success: true };
}
