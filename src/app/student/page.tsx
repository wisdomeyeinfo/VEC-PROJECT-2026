import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/student/session";
import { markWhatsappJoined, studentSignOut } from "./actions";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import {
  BookOpen, Trophy, LogOut, MessageCircle, ArrowRight,
  Video, Bell, Calendar, ExternalLink, ClipboardList,
  Star, Sparkles, Zap, Library, User
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

  let team: any = null;
  let announcements: any[] = [];
  let liveClasses: any[] = [];

  try { const { data } = await admin.from("teams").select("*").eq("id", session.team_id).maybeSingle(); team = data; } catch {}
  try { const { data } = await admin.from("announcements").select("*").eq("active", true).order("created_at", { ascending: false }).limit(4); announcements = data || []; } catch {}
  try { const { data } = await admin.from("live_classes").select("*").eq("active", true).order("scheduled_at", { ascending: true }); liveClasses = data || []; } catch {}

  const whatsappUrl = team?.whatsapp_invite_url || null;
  const lang = session.language;
  const firstName = student?.name?.split(" ")[0] || "Student";

  return (
    <div className="min-h-dvh bg-[#FFF8F0]">

      {/* ── Top header (mobile only – desktop has sidebar) ── */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-orange-100">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Star className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-black text-secondary text-sm">VEC 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector currentLang={lang} />
            <form action={studentSignOut}>
              <button className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Desktop page header ── */}
      <div className="hidden lg:flex items-center justify-between px-8 pt-8 pb-0">
        <div>
          <p className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em] mb-1">Dashboard</p>
          <h1 className="text-3xl font-black text-secondary">
            Namaste, <span className="text-gradient-primary italic">{firstName}! 🙏</span>
          </h1>
          <p className="text-secondary/40 font-medium text-sm mt-1">
            Ready to learn and grow today?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector currentLang={lang} />
          <form action={studentSignOut}>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all text-sm font-bold">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-5 space-y-6 max-w-5xl">

        {/* ── Mobile Welcome Hero ── */}
        <section className="lg:hidden relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 p-5 shadow-xl shadow-orange-400/25">
          <div className="absolute top-3 right-3 opacity-20"><Sparkles className="h-8 w-8 text-white" /></div>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <p className="text-orange-100 text-[10px] font-black uppercase tracking-[0.2em]">Namaste 🙏</p>
              <h2 className="text-2xl font-black text-white">{firstName}!</h2>
              {student?.class && (
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-[9px] font-black uppercase tracking-widest">
                  <Zap className="h-2.5 w-2.5" /> Class {student.class}{student.division ? ` – ${student.division}` : ""}
                </div>
              )}
            </div>
            <div className="relative w-20 h-20 shrink-0 animate-bounce-subtle">
              <Image src="/assets/mascot_owl.png" alt="Wisdom Owl" fill className="object-contain drop-shadow-2xl" />
            </div>
          </div>
        </section>

        {/* ── Desktop welcome card ── */}
        <section className="hidden lg:block relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 p-8 shadow-xl shadow-orange-400/20">
          <div className="absolute -right-10 -bottom-10 opacity-10"><Star className="h-64 w-64 text-white fill-white" /></div>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 shrink-0 animate-float">
              <Image src="/assets/mascot_owl.png" alt="Wisdom Owl" fill className="object-contain drop-shadow-2xl" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-3 mb-4">
                {student?.class && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                    <Zap className="h-3 w-3" /> Class {student.class}{student.division ? ` – ${student.division}` : ""}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                  <Star className="h-3 w-3 fill-white" /> {lang?.toUpperCase() || "EN"}
                </span>
              </div>
              <p className="text-orange-100 text-sm font-medium max-w-lg leading-relaxed">
                You&apos;re on your way to becoming a values champion! Complete your study modules and take the final assessment to earn your certificate.
              </p>
            </div>
          </div>
        </section>

        {/* ── 4 Action Cards ── */}
        <section className="space-y-4">
          <h2 className="text-[9px] font-black text-secondary/20 uppercase tracking-[0.3em] flex items-center gap-2">
             <Library className="h-3 w-3" /> Learning Portal
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[
              { href: "/student/study",   label: "Study Center", sub: "Interactive Modules", Icon: BookOpen,      img: "/assets/study_art.png",  colors: "from-purple-500 to-indigo-600", shadow: "shadow-purple-500/20" },
              { href: "/student/exam",    label: "Final Exam",   sub: "Take Assessment",   Icon: ClipboardList, img: "/assets/exam_art.png",   colors: "from-teal-400 to-emerald-600", shadow: "shadow-teal-500/20" },
              { href: "/student/results", label: "My Results",   sub: "Achievements",      Icon: Trophy,        img: "/assets/trophy_art.png", colors: "from-orange-400 to-rose-500", shadow: "shadow-orange-500/20" },
              { href: "/student/profile", label: "My Profile",   sub: "Account Settings",  Icon: User,          img: "/assets/mascot_owl.png", colors: "from-pink-400 to-pink-600",    shadow: "shadow-pink-500/20" },
            ].map(({ href, label, sub, Icon, img, colors, shadow }) => (
              <Link
                key={href}
                href={href}
                className={`group relative rounded-[2rem] overflow-hidden bg-gradient-to-br ${colors} p-4 md:p-6 shadow-2xl ${shadow} flex flex-col justify-between h-44 lg:h-56 transition-all hover:scale-[1.03] active:scale-95`}
              >
                <div className="absolute -bottom-4 -right-4 opacity-20 group-hover:opacity-40 transition-all group-hover:scale-110 duration-700">
                  <Image src={img} alt={label} width={100} height={100} className="object-contain" />
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div className="relative z-10">
                  <p className="text-white font-black text-sm md:text-xl leading-tight italic tracking-tighter">{label}</p>
                  <p className="text-white/60 text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-1">
                    {sub}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Two column on desktop: Announcements + Live Classes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Announcements */}
          <section className="space-y-3">
            <h2 className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em] flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-orange-400" /> Announcements
            </h2>
            {announcements.length > 0 ? (
              <div className="space-y-2">
                {announcements.map((msg: any) => (
                  <div key={msg.id} className="flex gap-3 p-4 rounded-[1.25rem] bg-white border border-orange-100 shadow-sm">
                    <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <MessageCircle className="h-4 w-4 text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-secondary text-sm truncate">{msg.title}</p>
                      <p className="text-secondary/40 text-xs font-medium mt-0.5 line-clamp-2">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-[1.5rem] bg-white border border-orange-100 text-center">
                <Bell className="h-8 w-8 text-orange-200 mx-auto mb-2" />
                <p className="text-secondary/30 text-sm font-bold">No announcements yet</p>
              </div>
            )}
          </section>

          {/* Live Classes */}
          <section className="space-y-3">
            <h2 className="text-[10px] font-black text-secondary/30 uppercase tracking-[0.2em] flex items-center gap-2">
              <Video className="h-3.5 w-3.5 text-pink-400" /> Live Sessions
            </h2>
            {liveClasses.length > 0 ? (
              <div className="space-y-2">
                {liveClasses.slice(0, 3).map((cls: any) => (
                  <a key={cls.id} href={cls.zoom_link} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-4 rounded-[1.25rem] bg-white border border-orange-100 shadow-sm hover:border-pink-200 transition-all group"
                  >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shrink-0">
                      <Video className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-secondary text-sm truncate">{cls.title}</p>
                      <div className="flex items-center gap-1 text-secondary/40 text-[10px] font-bold mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(cls.scheduled_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-orange-300 group-hover:text-orange-500 transition-colors" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-[1.5rem] bg-white border border-orange-100 text-center">
                <Video className="h-8 w-8 text-pink-200 mx-auto mb-2" />
                <p className="text-secondary/30 text-sm font-bold">No upcoming sessions</p>
              </div>
            )}
          </section>
        </div>

        {/* ── WhatsApp CTA ── */}
        {!session.whatsapp_joined && whatsappUrl && (
          <section className="rounded-[2rem] bg-gradient-to-br from-green-400 to-emerald-600 p-5 lg:p-6 shadow-xl shadow-green-400/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-black">Join Our WhatsApp Group!</p>
                  <p className="text-green-100 text-xs font-medium">Get instant updates and study support</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <a href={whatsappUrl}
                  className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-white text-green-700 font-black text-sm flex items-center justify-center shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Join Now
                </a>
                <form action={markWhatsappJoined}>
                  <button className="h-10 px-4 rounded-xl bg-white/20 text-white text-xs font-bold border border-white/30 hover:bg-white/30 transition-all">
                    Already In
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
