import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/student/session";
import { markWhatsappJoined, studentSignOut } from "./actions";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import {
  BookOpen,
  Trophy,
  LogOut,
  MessageCircle,
  ArrowRight,
  Video,
  Bell,
  Calendar,
  ExternalLink,
  ClipboardList,
  Star,
  Sparkles,
  Zap,
} from "lucide-react";

export default async function StudentHomePage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const admin = createSupabaseAdminClient();

  const { data: student } = await admin
    .from("students")
    .select("id, name, district, school_id, class, division, language, mobile, activation_code, team_id")
    .eq("id", session.student_id)
    .single();

  let team = null;
  let announcements: any[] = [];
  let liveClasses: any[] = [];

  try {
    const { data } = await admin.from("teams").select("*").eq("id", session.team_id).maybeSingle();
    team = data;
  } catch {}

  try {
    const { data } = await admin.from("announcements").select("*").eq("active", true).order("created_at", { ascending: false }).limit(3);
    announcements = data || [];
  } catch {}

  try {
    const { data } = await admin.from("live_classes").select("*").eq("active", true).order("scheduled_at", { ascending: true });
    liveClasses = data || [];
  } catch {}

  const whatsappUrl = team?.whatsapp_invite_url || null;
  const lang = session.language;
  const firstName = student?.name?.split(" ")[0] || "Student";

  return (
    <div className="relative min-h-dvh bg-[#FFF8F0] overflow-x-hidden">

      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-400/10 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-purple-400/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 right-10 w-72 h-72 bg-teal-400/10 rounded-full blur-[80px]" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 w-full bg-white/80 backdrop-blur-xl border-b border-orange-100 sticky top-0">
        <div className="mx-auto max-w-2xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-300/50">
              <Star className="h-5 w-5 text-white fill-white" />
            </div>
            <div className="leading-none">
              <span className="block font-black text-secondary text-base tracking-tight">VEC 2026</span>
              <span className="text-[9px] font-black text-orange-400 uppercase tracking-[0.2em]">Value Education</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector currentLang={lang} />
            <form action={studentSignOut}>
              <button className="h-9 w-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-5 py-6 space-y-7">

        {/* ── Welcome Hero ── */}
        <section className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 p-6 shadow-2xl shadow-orange-400/30">
          {/* Decorative stars */}
          <div className="absolute top-4 right-4 opacity-30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="absolute bottom-4 left-32 opacity-20">
            <Star className="h-6 w-6 text-white fill-white" />
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <p className="text-orange-100 text-xs font-black uppercase tracking-[0.2em] mb-1">Namaste 🙏</p>
              <h1 className="text-3xl font-black text-white leading-tight">
                {firstName}!
              </h1>
              <p className="text-orange-100 text-sm font-medium mt-1 leading-relaxed">
                Ready to learn &amp; grow today?
              </p>
              {student?.class && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                  <Zap className="h-3 w-3" /> Class {student.class}
                  {student.division ? ` – ${student.division}` : ""}
                </div>
              )}
            </div>
            <div className="relative w-28 h-28 shrink-0 animate-float-slow">
              <Image
                src="/assets/mascot_owl.png"
                alt="Wisdom Owl"
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* ── Main Action Cards ── */}
        <section className="space-y-3">
          <h2 className="text-xs font-black text-secondary/40 uppercase tracking-[0.2em] px-1">Your Learning Zone</h2>
          <div className="grid grid-cols-2 gap-4">

            {/* Study */}
            <Link href="/student/study" className="group relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-purple-500 to-violet-700 p-5 shadow-xl shadow-purple-400/30 flex flex-col justify-between h-44 transition-all hover:scale-[1.02] active:scale-95">
              <div className="absolute -bottom-4 -right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <BookOpen className="h-24 w-24 text-white" />
              </div>
              <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg leading-tight">Study<br />Modules</h3>
                <div className="flex items-center gap-1 mt-1 text-purple-200 text-[10px] font-black uppercase tracking-widest">
                  Start <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>

            {/* Exam */}
            <Link href="/student/exam" className="group relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-teal-400 to-teal-600 p-5 shadow-xl shadow-teal-400/30 flex flex-col justify-between h-44 transition-all hover:scale-[1.02] active:scale-95">
              <div className="absolute -bottom-4 -right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <ClipboardList className="h-24 w-24 text-white" />
              </div>
              <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg leading-tight">Final<br />Exam</h3>
                <div className="flex items-center gap-1 mt-1 text-teal-100 text-[10px] font-black uppercase tracking-widest">
                  Attempt <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>

            {/* Results */}
            <Link href="/student/results" className="group relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 p-5 shadow-xl shadow-amber-400/30 flex flex-col justify-between h-44 transition-all hover:scale-[1.02] active:scale-95">
              <div className="absolute -bottom-4 -right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <Trophy className="h-24 w-24 text-white" />
              </div>
              <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg leading-tight">My<br />Results</h3>
                <div className="flex items-center gap-1 mt-1 text-orange-100 text-[10px] font-black uppercase tracking-widest">
                  View <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>

            {/* Live Classes */}
            <div className="group relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-pink-400 to-rose-600 p-5 shadow-xl shadow-pink-400/30 flex flex-col justify-between h-44">
              <div className="absolute -bottom-4 -right-4 opacity-20">
                <Video className="h-24 w-24 text-white" />
              </div>
              <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg leading-tight">Live<br />Classes</h3>
                <div className="text-pink-100 text-[10px] font-black uppercase tracking-widest mt-1">
                  {liveClasses.length > 0 ? `${liveClasses.length} Upcoming` : "Coming Soon"}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── Live Classes List ── */}
        {liveClasses.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-black text-secondary/40 uppercase tracking-[0.2em] px-1">Upcoming Live Sessions</h2>
            <div className="space-y-3">
              {liveClasses.slice(0, 3).map((cls: any) => (
                <a
                  key={cls.id}
                  href={cls.zoom_link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-white border border-orange-100 shadow-md shadow-orange-100/30 hover:shadow-lg hover:border-orange-200 transition-all group"
                >
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-300/30 shrink-0">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-secondary text-sm truncate">{cls.title}</p>
                    <div className="flex items-center gap-1 text-secondary/40 text-[10px] font-bold mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(cls.scheduled_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-orange-400 shrink-0 group-hover:text-orange-600 transition-colors" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── Announcements ── */}
        {announcements.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-black text-secondary/40 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-orange-400" /> Announcements
            </h2>
            <div className="space-y-3">
              {announcements.map((msg: any) => (
                <div key={msg.id} className="flex gap-4 p-4 rounded-[1.5rem] bg-white border border-orange-100 shadow-md shadow-orange-100/30">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-secondary text-sm">{msg.title}</p>
                    <p className="text-secondary/50 text-xs font-medium mt-0.5 line-clamp-2">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── WhatsApp CTA ── */}
        {!session.whatsapp_joined && whatsappUrl && (
          <section className="rounded-[2rem] bg-gradient-to-br from-green-400 to-emerald-600 p-6 shadow-xl shadow-green-400/20 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg">Join Our Group!</h3>
                <p className="text-green-100 text-xs font-medium">Get instant updates on WhatsApp</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={whatsappUrl}
                className="flex-1 h-12 rounded-2xl bg-white text-green-700 font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
              >
                Join WhatsApp
              </a>
              <form action={markWhatsappJoined}>
                <button className="h-12 px-4 rounded-2xl bg-white/20 text-white font-bold text-xs border border-white/30 hover:bg-white/30 transition-all">
                  Already In
                </button>
              </form>
            </div>
          </section>
        )}

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Verified", value: "✓", color: "from-green-400 to-emerald-500" },
            { label: lang?.toUpperCase() || "EN", value: "Lang", color: "from-blue-400 to-blue-600" },
            { label: "2026", value: "VEC", color: "from-orange-400 to-orange-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl bg-gradient-to-br ${color} p-3 text-center shadow-lg`}>
              <div className="text-white font-black text-lg leading-none">{value}</div>
              <div className="text-white/80 text-[9px] font-black uppercase tracking-widest mt-1">{label}</div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
