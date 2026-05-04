import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireStaffUser } from "@/lib/auth/staff";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  School,
  Languages
} from "lucide-react";
import Link from "next/link";

export default async function TeamSubmissionsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  await requireStaffUser();
  const { teamId } = await params;

  const supabase = await createSupabaseServerClient();
  
  // Fetch students and their exam status for this team
  const { data: students, error } = await supabase
    .from("students")
    .select(`
      id,
      name,
      activation_code,
      language,
      school_id,
      schools (name),
      exam_attempts (
        status,
        started_at,
        submitted_at
      )
    `)
    .eq("team_id", teamId)
    .order("name", { ascending: true });

  const stats = {
    total: students?.length || 0,
    submitted: students?.filter(s => s.exam_attempts?.[0]?.status === 'submitted').length || 0,
    inProgress: students?.filter(s => s.exam_attempts?.[0]?.status === 'in_progress').length || 0,
    notStarted: students?.filter(s => !s.exam_attempts?.[0]).length || 0,
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Exam Submissions</h1>
          <p className="text-zinc-500 font-medium">Track which students have completed their wisdom quest.</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-zinc-100 shadow-sm">
          <Search className="h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="bg-transparent border-none outline-none text-sm font-medium w-48"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-[2rem] bg-white border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Registered</p>
          <p className="text-3xl font-black text-zinc-900">{stats.total}</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-green-50 border border-green-100 shadow-sm">
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Submitted</p>
          <p className="text-3xl font-black text-green-900">{stats.submitted}</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-orange-50 border border-orange-100 shadow-sm">
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">In Progress</p>
          <p className="text-3xl font-black text-orange-900">{stats.inProgress}</p>
        </div>
        <div className="p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Not Started</p>
          <p className="text-3xl font-black text-zinc-900">{stats.notStarted}</p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">School</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Language</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {students?.map((student) => {
                const attempt = student.exam_attempts?.[0];
                return (
                  <tr key={student.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-800">{student.name}</span>
                        <span className="text-xs font-mono text-zinc-400 uppercase tracking-tighter">{student.activation_code}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-zinc-500 font-medium text-sm">
                        <School className="h-4 w-4" />
                        {student.schools?.name || "Not Assigned"}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                        <Languages className="h-3 w-3" /> {student.language}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {!attempt ? (
                        <div className="inline-flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                          <AlertCircle className="h-4 w-4" /> Not Started
                        </div>
                      ) : attempt.status === 'submitted' ? (
                        <div className="inline-flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-wider">
                          <CheckCircle2 className="h-4 w-4" /> Submitted
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-wider">
                          <Clock className="h-4 w-4" /> In Progress
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {attempt?.submitted_at ? (
                        <span className="text-sm font-medium text-zinc-600">
                          {new Date(attempt.submitted_at).toLocaleDateString()} at {new Date(attempt.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {(!students || students.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Users className="h-12 w-12 text-zinc-100 mx-auto mb-4" />
                    <p className="text-zinc-400 font-bold">No students registered in this team yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
