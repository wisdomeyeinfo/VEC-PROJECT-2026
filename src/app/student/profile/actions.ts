"use server";

import { getStudentSession } from "@/lib/student/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateStudentProfile(formData: FormData) {
  const session = await getStudentSession();
  if (!session) throw new Error("Not authenticated");

  const name = formData.get("name") as string;
  const gender = formData.get("gender") as string;
  const class_name = formData.get("class") as string;
  const division = formData.get("division") as string;
  const mobile = formData.get("mobile") as string;
  const custom_school_name = formData.get("custom_school_name") as string;

  const admin = createSupabaseAdminClient();
  
  // Create a payload dynamically to avoid crashing on missing columns
  const payload: any = {
    name,
    class: class_name || null,
    division: division || null,
    mobile: mobile || null,
  };

  // Only add these if they are likely in the DB or we want to try
  // We'll use a safer approach: try updating with all, if fails, update with minimal
  try {
    const { error: fullError } = await admin
      .from("students")
      .update({
        ...payload,
        gender,
        custom_school_name: custom_school_name || null
      })
      .eq("id", session.student_id);

    if (fullError) {
      if (fullError.message.includes("column") || fullError.message.includes("schema cache")) {
        // Fallback to minimal payload
        const { error: minError } = await admin
          .from("students")
          .update(payload)
          .eq("id", session.student_id);
        if (minError) throw minError;
      } else {
        throw fullError;
      }
    }
  } catch (e: any) {
    console.error("Profile Update Error:", e);
    throw new Error(e.message || "Failed to update profile");
  }

  revalidatePath("/student");
  revalidatePath("/student/profile");
}
