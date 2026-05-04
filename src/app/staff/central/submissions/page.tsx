import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { 
  BarChart3, 
  Search, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Filter,
  Download,
  ChevronRight,
  TrendingUp,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";

export default async function CentralSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string; team?: string; status?: string; query?: string }>;
}) {
  await requireStaffUser();
  if (!(await isCentralAdmin())) return <div>Access Denied</div>;

  const filters = await searchParams;
  const supabase = createSupabaseAdminClient();

  // 1. Fetch all students with relations
  let dbQuery = supabase
    .from("students")
    .select(`
      id,
      name,
      language,
      activation_code,
      team_id,
      district,
      teams (id, name, city_region),
      exam_attempts (
        status,
        submitted_at,
        score
      )
    `);

  const { data: rawStudents } = await dbQuery.order("name", { ascending: true });
  
  // 2. Apply complex client-side filtering (more flexible for search/status)
  let students = (rawStudents || []).map(s => ({
    ...s,
    attempt: (s.exam_attempts as any)?.[0] || null,
    team: s.teams as any
  }));

  if (filters.district) {
    students = students.filter(s => s.team?.city_region === filters.district || s.district === filters.district);
  }

  if (filters.status) {
    if (filters.status === "submitted") students = students.filter(s => s.attempt?.status === "submitted");
    else if (filters.status === "in_progress") students = students.filter(s => s.attempt?.status === "in_progress");
    else if (filters.status === "none") students = students.filter(s => !s.attempt);
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    students = students.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.activation_code.toLowerCase().includes(q)
    );
  }

  // Stats for the top bar
  const total = students.length;
  const submitted = students.filter(s => s.attempt?.status === "submitted").length;
  const inProgress = students.filter(s => s.attempt?.status === "in_progress").length;

  // Get unique districts for filter
  const { data: teamsRaw } = await supabase.from("teams").select("city_region").not("city_region", "is", null);
  const districts = Array.from(new Set(teamsRaw?.map(t => t.city_region))).sort();

  return (
    <div className="space-y-10 pb-32">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <TrendingUp className="h-3 w-3" /> Live Insights
          </div>
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter italic leading-none">Global <span className="text-primary">Submissions.</span></h1>
          <p className="text-zinc-500 font-medium">Real-time analysis of student participation across all districts.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 pr-6 border-r border-zinc-100">
             <div className="text-right">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Students</p>
                <p className="text-2xl font-black text-zinc-900">{total}</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Submitted</p>
                <p className="text-2xl font-black text-green-600">{submitted}</p>
             </div>
          </div>
          <button className="h-14 px-8 rounded-2xl bg-zinc-900 text-white font-black text-sm flex items-center gap-2 hover:bg-black transition-all shadow-2xl active:scale-95">
            <Download className="h-5 w-5 text-primary" /> Export Data
          </button>
        </div>
      </div>

      {/* Advanced Filter Command Center */}
      <form className="p-8 rounded-[3rem] bg-white border border-zinc-100 shadow-3xl grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
             <MapPin className="h-3 w-3" /> District
          </label>
          <select 
            name="district"
            defaultValue={filters.district || ""}
            className="w-full h-14 pl-6 pr-10 rounded-2xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-primary font-black text-zinc-800 appearance-none shadow-inner"
          >
            <option value="">All Regions</option>
            {districts.map(d => <option key={d} value={d!}>{d}</option>)}
          </select>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
             <Filter className="h-3 w-3" /> Status
          </label>
          <select 
            name="status"
            defaultValue={filters.status || ""}
            className="w-full h-14 pl-6 pr-10 rounded-2xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-primary font-black text-zinc-800 appearance-none shadow-inner"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Completed</option>
            <option value="in_progress">Working</option>
            <option value="none">Not Started</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
             <Search className="h-3 w-3" /> Search Student
          </label>
          <div className="relative group">
            <input 
              type="text" 
              name="query"
              defaultValue={filters.query || ""}
              placeholder="Name or Kit Code..." 
              className="w-full h-14 pl-12 pr-24 rounded-2xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-primary font-black text-zinc-800 shadow-inner"
            />
            <button type="submit" className="absolute right-2 top-2 h-10 px-6 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
              Apply
            </button>
          </div>
        </div>
      </form>

      {/* Global Submissions Board */}
      <div className="bg-white rounded-[4rem] border border-zinc-100 shadow-3xl overflow-hidden relative">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-white">
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest">Student Identity</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-center">Team Info</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-center">Language</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-center">Progress</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-50 transition-all duration-300 group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                       <div className="h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center font-black text-zinc-300 group-hover:bg-primary group-hover:text-white transition-all text-xl">
                          {s.name[0]}
                       </div>
                       <div className="space-y-1">
                          <span className="block font-black text-zinc-900 text-xl tracking-tight leading-none">{s.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-zinc-400 uppercase bg-zinc-100 px-2 py-0.5 rounded tracking-tighter">{s.activation_code}</span>
                            <span className="text-[10px] font-black text-primary uppercase flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {s.team?.city_region || s.district || "Global"}
                            </span>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="inline-flex flex-col items-center">
                       <span className="text-sm font-black text-zinc-800">{s.team?.name || "Independent"}</span>
                       <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Team Link</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="h-8 px-3 rounded-lg bg-zinc-100 inline-flex items-center justify-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                       {s.language}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    {!s.attempt ? (
                      <span className="inline-flex items-center gap-2 text-zinc-300 font-black text-[10px] uppercase tracking-[0.1em]">
                        <AlertCircle className="h-3 w-3" /> Idle
                      </span>
                    ) : s.attempt.status === 'submitted' ? (
                      <span className="inline-flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.1em] px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm shadow-emerald-100/50">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Accomplished
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-[0.1em] px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 shadow-sm shadow-orange-100/50">
                        <Clock className="h-3.5 w-3.5" /> Underway
                      </span>
                    )}
                  </td>
                  <td className="px-10 py-8 text-right">
                    {s.attempt?.status === 'submitted' ? (
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                           <LayoutGrid className="h-4 w-4 text-primary" />
                           <span className="text-2xl font-black text-zinc-900 tracking-tighter">{s.attempt.score}</span>
                        </div>
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Final Wisdom Score</span>
                      </div>
                    ) : (
                      <span className="text-zinc-200">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                     <div className="space-y-4">
                        <Search className="h-16 w-16 text-zinc-100 mx-auto" />
                        <p className="text-zinc-400 font-black uppercase tracking-[0.2em] text-sm">No warriors found matching these filters.</p>
                     </div>
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
