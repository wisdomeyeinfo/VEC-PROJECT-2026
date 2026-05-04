import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireStaffUser } from "@/lib/auth/staff";
import { 
  Users, 
  School, 
  ClipboardCheck, 
  TrendingUp, 
  MessageCircle, 
  LayoutDashboard,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default async function TeamOverviewPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  await requireStaffUser();
  const { teamId } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();

  if (!team) return <div>Team not found</div>;

  // Quick Stats
  const { count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  const { count: schoolCount } = await supabase
    .from("school_visits")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  const { count: submissionCount } = await supabase
    .from("exam_attempts")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId)
    .eq("status", "submitted");

  const cards = [
    { 
      title: "Students", 
      value: studentCount || 0, 
      icon: Users, 
      color: "bg-blue-50 text-blue-600",
      link: `/staff/team/${teamId}/submissions`
    },
    { 
      title: "Schools", 
      value: schoolCount || 0, 
      icon: School, 
      color: "bg-orange-50 text-orange-600",
      link: `/staff/team/${teamId}/schools`
    },
    { 
      title: "Submissions", 
      value: submissionCount || 0, 
      icon: ClipboardCheck, 
      color: "bg-green-50 text-green-600",
      link: `/staff/team/${teamId}/submissions`
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Welcome */}
      <section className="relative overflow-hidden rounded-[3rem] bg-zinc-900 p-10 shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
            <LayoutDashboard className="h-3 w-3" /> Team Dashboard
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Namaste, <br />
            Team <span className="text-primary italic">{team.name}</span>
          </h1>
          <p className="text-zinc-400 font-medium">
            Manage your team's kit distribution, school relationships, and track student exam progress.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            {team.whatsapp_invite_url && (
              <a
                href={team.whatsapp_invite_url}
                target="_blank"
                rel="noreferrer"
                className="h-12 px-6 rounded-xl bg-green-600 text-white font-bold text-sm flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-900/20"
              >
                <MessageCircle className="h-5 w-5" /> Team WhatsApp
              </a>
            )}
            <div className="h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Year {team.year}
            </div>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="h-48 w-48 text-white" />
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <Link 
            key={i} 
            href={card.link}
            className="group p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/20 space-y-4 hover:border-primary/20 transition-all"
          >
            <div className={`h-14 w-14 rounded-2xl ${card.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
              <card.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{card.title}</p>
              <p className="text-3xl font-black text-zinc-900">{card.value}</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-primary transition-colors">
              Manage {card.title} <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions / Recent Activity Placeholder */}
      <div className="p-10 rounded-[3rem] bg-blue-50 border-2 border-dashed border-blue-100 flex flex-col items-center text-center space-y-4">
        <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
          <TrendingUp className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-blue-900">Team Progress</h3>
          <p className="text-blue-700 font-medium max-w-md mx-auto">
            You have {submissionCount || 0} students who have completed the exam. Boost your numbers by visiting more schools!
          </p>
        </div>
        <Link 
          href={`/staff/team/${teamId}/schools`}
          className="px-8 py-3 rounded-2xl bg-white border-2 border-blue-200 text-blue-700 font-bold text-sm hover:bg-blue-100 transition-all"
        >
          View School Status
        </Link>
      </div>
    </div>
  );
}
