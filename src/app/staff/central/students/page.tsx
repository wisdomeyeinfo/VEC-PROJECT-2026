import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { generateStudents } from "./actions";
import { ResetPasswordButton, DeleteStudentButton } from "./StudentControls";
import { TeamFilter } from "./TeamFilter";
import { GraduationCap, Users, PlusCircle, Search, Filter } from "lucide-react";

export default async function CentralStudentsPage(props: {
  searchParams: Promise<{ teamId?: string }>;
}) {
  const searchParams = await props.searchParams;
  await requireStaffUser();
  if (!(await isCentralAdmin())) return <div>Access Denied</div>;

  const teamId = searchParams.teamId;
  const supabase = await createSupabaseServerClient();

  // 1. Fetch all teams for selection
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .order("name");

  // 2. Fetch students for the selected team
  let students: any[] = [];
  if (teamId) {
    const { data } = await supabase
      .from("students")
      .select("id, exam_id, temp_password, name, onboarding_completed, created_at")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });
    students = data || [];
  }

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tighter">Student Management</h1>
        <p className="text-zinc-500 font-medium">Generate IDs, manage credentials, and reset passwords.</p>
      </header>

      {/* Generation Tools */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <PlusCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">Generate IDs</h2>
          </div>
          
          <form action={generateStudents} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Target Team</label>
              <select name="teamId" defaultValue={teamId} required className="w-full h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-3 font-bold outline-none focus:border-orange-500 transition-all">
                <option value="">Select Team</option>
                {teams?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Batch Count</label>
              <input 
                name="count" 
                type="number" 
                min="1" 
                max="500" 
                defaultValue="10" 
                required 
                className="w-full h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-3 font-bold outline-none focus:border-orange-500 transition-all"
              />
            </div>
            <button className="w-full h-12 rounded-xl bg-zinc-900 text-white font-bold hover:bg-orange-600 transition-all shadow-lg shadow-zinc-900/10 active:scale-95">
              Generate Now
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 rounded-[2rem] border border-orange-100 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">Student Directory</h2>
            </div>
            
            <TeamFilter teams={teams || []} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] uppercase font-black tracking-[0.1em] text-zinc-400">
                <tr className="border-b border-zinc-50">
                  <th className="pb-4">Exam ID</th>
                  <th className="pb-4">Temp Pass</th>
                  <th className="pb-4">Name / Status</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id} className="group border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 font-black text-zinc-900">{st.exam_id}</td>
                    <td className="py-4 font-mono text-xs text-zinc-500">{st.temp_password || "••••••••"}</td>
                    <td className="py-4">
                      {st.onboarding_completed ? (
                        <div className="space-y-0.5">
                          <div className="font-bold text-zinc-900">{st.name}</div>
                          <div className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active</div>
                        </div>
                      ) : (
                        <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Pending Onboarding</div>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <ResetPasswordButton studentId={st.id} />
                        <DeleteStudentButton studentId={st.id} />
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-zinc-400 font-medium">
                      {teamId ? "No students found for this team." : "Please select a team to view students."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
