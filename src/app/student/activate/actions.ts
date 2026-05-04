"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setStudentSession } from "@/lib/student/session";

export async function redeemActivationCode(formData: FormData) {
  try {
    const code = String(formData.get("activation_code") || "")
      .trim()
      .toUpperCase();
    
    if (!code) throw new Error("Activation code is required");

    // Check if we have a Google user logged in
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const admin = createSupabaseAdminClient();

    // 0. If user is logged in, check if they already have a student profile
    if (user) {
      const { data: existingProfile } = await admin
        .from("students")
        .select("id, activation_code")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      
      if (existingProfile) {
         if (existingProfile.activation_code === code) {
           // Already registered and linked! Just log them in.
           const { data: st } = await admin.from("students").select("id, language, team_id").eq("id", existingProfile.id).single();
           if (st) {
              await setStudentSession({
                student_id: st.id,
                team_id: st.team_id,
                language: st.language,
                whatsapp_joined: false,
              });
              redirect("/student");
           }
         } else {
           throw new Error(`Your Google account is already linked to kit ${existingProfile.activation_code}. You cannot activate multiple kits.`);
         }
      }
    }

    // 1. Check the activation code status
    const { data: codeRow, error: codeErr } = await admin
      .from("activation_codes")
      .select("code, team_id, year, status, redeemed_by_student_id")
      .eq("code", code)
      .maybeSingle();
    
    if (codeErr) throw new Error(codeErr.message);
    if (!codeRow) throw new Error("Invalid activation code. Please check and try again.");
    
    if (codeRow.status === "revoked") {
      throw new Error("This activation code has been revoked.");
    }

    let studentId = "";
    let studentLang = "en";

    // 2. SCENARIO A: Code is already redeemed (Linking flow)
    if (codeRow.status === "redeemed") {
      const { data: existingStudent, error: studentErr } = await admin
        .from("students")
        .select("id, team_id, language, auth_user_id")
        .eq("activation_code", codeRow.code)
        .maybeSingle();

      if (studentErr || !existingStudent) {
        throw new Error("Activation record found but student profile is missing.");
      }

      // Check if it's already linked to someone else
      if (existingStudent.auth_user_id && existingStudent.auth_user_id !== user?.id) {
        throw new Error("This kit is already linked to another Google account.");
      }

      // If logged in, update the link
      if (user) {
        const { error: updErr } = await admin
          .from("students")
          .update({
            auth_user_id: user.id,
            email: user.email ?? null,
          })
          .eq("id", existingStudent.id);
        if (updErr) throw new Error(updErr.message);
      }

      studentId = existingStudent.id;
      studentLang = existingStudent.language;
    } 
    
    // 3. SCENARIO B: Code is brand new (Registration flow)
    else {
      const district = String(formData.get("district") || "").trim();
      const name = String(formData.get("name") || "").trim();
      const language = String(formData.get("language") || "").trim();
      const gender = String(formData.get("gender") || "").trim();
      
      if (!district || !name || !language || !gender) {
        throw new Error("Please fill in all required profile details for a new kit.");
      }

      const schoolId = String(formData.get("school_id") || "").trim();
      const customSchoolName = String(formData.get("custom_school_name") || "").trim();
      const studentClass = String(formData.get("class") || "").trim();
      const division = String(formData.get("division") || "").trim();
      const mobile = String(formData.get("mobile") || "").trim();

      const { data: newStudent, error: insertErr } = await admin
        .from("students")
        .insert({
          team_id: codeRow.team_id,
          activation_code: codeRow.code,
          district,
          school_id: schoolId === "other" || !schoolId ? null : schoolId,
          name,
          class: studentClass || null,
          division: division || null,
          language,
          mobile: mobile || null,
          auth_user_id: user?.id || null,
          email: user?.email || null,
        })
        .select("id, team_id, language")
        .single();

      if (insertErr) {
        if (insertErr.code === '23505') {
          throw new Error("This kit is already registered to someone else, or your account already has a kit.");
        }
        throw new Error(insertErr.message);
      }

      // Update code status
      const { error: codeUpdErr } = await admin
        .from("activation_codes")
        .update({
          status: "redeemed",
          redeemed_by_student_id: newStudent.id,
          redeemed_at: new Date().toISOString(),
        })
        .eq("code", codeRow.code);
      if (codeUpdErr) throw new Error(codeUpdErr.message);

      studentId = newStudent.id;
      studentLang = newStudent.language;
    }

    // 4. Set the student session and redirect
    await setStudentSession({
      student_id: studentId,
      team_id: codeRow.team_id,
      language: studentLang,
      whatsapp_joined: false,
    });
  } catch (e: any) {
    // If it's a redirect error, let Next.js handle it
    if (e.message === 'NEXT_REDIRECT') throw e;
    throw new Error(e.message || "An unexpected error occurred during activation.");
  }

  redirect("/student");
}
