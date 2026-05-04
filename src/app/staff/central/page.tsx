import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { 
  Users, 
  School, 
  ClipboardCheck, 
  Trophy, 
  Globe, 
  ShieldCheck,
  TrendingUp,
  Map,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default async function CentralOverviewPage() {
  await requireStaffUser();
  const central = await isCentralAdmin();

  if (!central) {
    return (
      <div className="rounded-[3rem] bg-white p-12 text-center space-y-4 shadow-xl border border-zinc-100">
        <ShieldCheck className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-black text-zinc-900">Access Denied</h1>
        <p className="text-zinc-500 font-medium">You need central administrator privileges to view this portal.</p>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();

  // High-level Global Stats
  const { count: teamCount } = await supabase.from("teams").select("*", { count: "exact", head: true });
  const { count: studentCount } = await supabase.from("students").select("*", { count: "exact", head: true });
  const { count: schoolCount } = await supabase.from("schools").select("*", { count: "exact", head: true });
  const { count: submissionCount } = await supabase.from("exam_attempts").select("*", { count: "exact", head: true }).eq("status", "submitted");

  const stats = [
    { label: "Total Teams", value: teamCount || 0, icon: Users, color: "bg-blue-50 text-blue-600", link: "/staff/central/teams" },
    { label: "Students Registered", value: studentCount || 0, icon: Globe, color: "bg-primary/10 text-primary", link: "/staff/central/submissions" },
    { label: "Active Schools", value: schoolCount || 0, icon: School, color: "bg-orange-50 text-orange-600", link: "/staff/central/teams" },
    { label: "Exam Submissions", value: submissionCount || 0, icon: ClipboardCheck, color: "bg-green-50 text-green-600", link: "/staff/central/submissions" },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Global Hero */}
      <section className="relative overflow-hidden rounded-[3rem] bg-zinc-900 p-12 shadow-2xl">
        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
            <ShieldCheck className="h-3 w-3" /> Central Administration
          </div>
          <h1 className="text-5xl font-black text-white leading-tight">
            VEC 2026 <br />
            <span className="text-primary italic">Global Analytics</span>
          </h1>
          <p className="text-zinc-400 font-medium text-lg">
            Monitor the nationwide progress of the Value Education Contest. Manage core configurations, examine quality, and oversee all district operations.
          </p>
        </div>
        
        {/* Abstract Map Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Map className="h-64 w-64 text-white" />
        </div>
      </section>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link 
            key={i} 
            href={stat.link}
            className="group p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/20 space-y-4 hover:border-primary/20 transition-all"
          >
            <div className={`h-14 w-14 rounded-2xl ${stat.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-zinc-900">{stat.value}</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-primary transition-colors">
              View Details <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-10 rounded-[3rem] bg-orange-50 border border-orange-100 flex flex-col items-center text-center space-y-4">
          <Trophy className="h-12 w-12 text-orange-500" />
          <h3 className="text-2xl font-black text-orange-900">Results Management</h3>
          <p className="text-orange-700 font-medium text-sm">
            Generate merit lists, verify high scores, and prepare digital certificates for the winners.
          </p>
          <Link href="/staff/central/results" className="px-8 py-3 rounded-2xl bg-white border-2 border-orange-200 text-orange-700 font-bold text-sm hover:bg-orange-100 transition-all">
            Go to Results
          </Link>
        </div>

        <div className="p-10 rounded-[3rem] bg-blue-50 border border-blue-100 flex flex-col items-center text-center space-y-4">
          <TrendingUp className="h-12 w-12 text-blue-500" />
          <h3 className="text-2xl font-black text-blue-900">Submission Growth</h3>
          <p className="text-blue-700 font-medium text-sm">
            Track daily participation rates and district-wise competition levels in real-time.
          </p>
          <Link href="/staff/central/submissions" className="px-8 py-3 rounded-2xl bg-white border-2 border-blue-200 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-all">
            Open Submissions
          </Link>
        </div>
      </div>
    </div>
  );
}
