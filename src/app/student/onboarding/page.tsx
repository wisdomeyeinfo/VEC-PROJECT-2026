import { OnboardingClient } from "./OnboardingClient";
import { getStudentSession } from "@/lib/student/session";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function OnboardingPage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const admin = createSupabaseAdminClient();
  const { data: student } = await admin
    .from("students")
    .select("id, name, email, district, state, school_name, class, division, mobile, language, gender, onboarding_completed")
    .eq("id", session.student_id)
    .single();

  const { data: locations } = await admin
    .from("teams")
    .select("state, district")
    .eq("active", true);

  const { data: schools } = await admin
    .from("schools")
    .select("id, name, district, state");

  return (
    <div className="min-h-dvh bg-[#FCFBFA] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      
      <main className="relative z-10 w-full flex justify-center">
        <OnboardingClient 
          initialData={student} 
          availableLocations={locations || []}
          availableSchools={schools || []}
        />
      </main>
    </div>
  );
}
