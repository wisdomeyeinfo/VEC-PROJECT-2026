"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createSchoolAndVisit(teamId: string, formData: FormData) {
  const district = String(formData.get("district") || "").trim();
  const taluka = String(formData.get("taluka") || "").trim();
  const name = String(formData.get("name") || "").trim();

  const principalName = String(formData.get("principal_name") || "").trim();
  const principalPhone = String(formData.get("principal_phone") || "").trim();
  const teacherName = String(formData.get("teacher_name") || "").trim();
  const teacherPhone = String(formData.get("teacher_phone") || "").trim();
  const remarks = String(formData.get("remarks") || "").trim();

  if (!district) throw new Error("District is required");
  if (!name) throw new Error("School name is required");

  const supabase = await createSupabaseServerClient();

  const { data: school, error: schoolErr } = await supabase
    .from("schools")
    .insert({
      district,
      taluka: taluka || null,
      name,
      principal_name: principalName || null,
      principal_phone: principalPhone || null,
      teacher_name: teacherName || null,
      teacher_phone: teacherPhone || null,
      remarks: remarks || null,
    })
    .select("id")
    .single();
  if (schoolErr) throw schoolErr;

  const { error: visitErr } = await supabase.from("school_visits").upsert({
    team_id: teamId,
    school_id: school.id,
    status: "permission_pending",
  });
  if (visitErr) throw visitErr;

  revalidatePath(`/staff/team/${teamId}/schools`);
}

export async function updateVisitStatus(teamId: string, schoolId: string, status: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("school_visits")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("team_id", teamId)
    .eq("school_id", schoolId);
  if (error) throw error;
  revalidatePath(`/staff/team/${teamId}/schools`);
}

