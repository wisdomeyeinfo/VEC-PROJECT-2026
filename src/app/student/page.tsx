import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/student/session";
import { t } from "@/lib/i18n/student";
import { markWhatsappJoined, studentSignOut } from "./actions";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { 
  BookOpen, 
  Trophy, 
  Star, 
  LogOut, 
  MessageCircle, 
  GraduationCap,
  ArrowRight,
  User,
  Video,
  Bell,
  Calendar,
  ExternalLink,
  ChevronRight,
  LayoutDashboard,
  ClipboardList,
  Medal,
  Award,
  Book,
  FileText
} from "lucide-react";

export default async function StudentHomePage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const admin = createSupabaseAdminClient();
  
  // 1. Fetch student profile (Safely)
  const { data: student } = await admin.from("students")
    .select("id, name, district, school_id, class, division, language, mobile, activation_code, team_id")
    .eq("id", session.student_id)
    .single();

  // 2. Safely fetch data
  let team = null;
  let announcements = [];
  let liveClasses = [];

  try {
    const { data: tRow } = await admin.from("teams").select("*").eq("id", session.team_id).maybeSingle();
    team = tRow;
  } catch (e) {}

  try {
    const { data: aRows } = await admin.from("announcements").select("*").eq("active", true).order("created_at", { ascending: false }).limit(3);
    announcements = aRows || [];
  } catch (e) {}

  try {
    const { data: lRows } = await admin.from("live_classes").select("*").eq("active", true).order("scheduled_at", { ascending: true });
    liveClasses = lRows || [];
  } catch (e) {}

  const whatsappUrl = team?.whatsapp_invite_url || null;
  const lang = session.language;

  return (
    <div className="relative min-h-dvh bg-[#FCFBFA] selection:bg-primary/30 pb-32">
      {/* Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full glass border-b border-orange-100">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center shadow-2xl">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <div>
               <span className="block font-black text-2xl text-secondary tracking-tighter italic leading-none uppercase">VEC 2026</span>
               <span className="text-[10px] font-black text-primary uppercase tracking-widest">Student Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/student/profile"
              className="h-12 w-12 rounded-2xl bg-white border border-orange-100 flex items-center justify-center text-secondary hover:text-primary hover:bg-primary/5 transition-all shadow-sm"
            >
              <User className="h-6 w-6" />
            </Link>
            <LanguageSelector currentLang={lang} />
            <form action={studentSignOut}>
              <button className="h-12 w-12 rounded-2xl bg-white border border-orange-100 flex items-center justify-center text-secondary/40 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                <LogOut className="h-6 w-6" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-12 space-y-16">
        {/* Professional Welcome Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <ClipboardList className="h-4 w-4 fill-primary" /> {t(lang, "welcomeBack")}
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-secondary leading-[1.05] tracking-tighter">
              Namaste, <br />
              <span className="text-gradient-primary italic">{student?.name || "Student"}!</span>
            </h1>
            <p className="text-xl text-secondary/60 font-medium leading-relaxed max-w-xl">
              Your learning journey continues. Complete your study modules, attend official webinars, and prepare for the final assessment.
            </p>
            
            {/* Academic Stats */}
            <div className="flex flex-wrap gap-6 pt-4">
               <div className="flex items-center gap-4 p-4 rounded-3xl bg-white shadow-xl shadow-orange-900/5 border border-orange-100">
                  <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                     <Medal className="h-6 w-6" />
                  </div>
                  <div>
                     <span className="block font-black text-secondary">Verified Student</span>
                     <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Enrollment Status</span>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-4 rounded-3xl bg-white shadow-xl shadow-orange-900/5 border border-orange-100">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                     <Book className="h-6 w-6" />
                  </div>
                  <div>
                     <span className="block font-black text-secondary">Course Modules</span>
                     <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">In Progress</span>
                  </div>
               </div>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-primary/5 rounded-[4rem] rotate-6 scale-90 blur-xl opacity-50" />
            <div className="relative aspect-square rounded-[4rem] overflow-hidden bg-white shadow-3xl border border-orange-100 p-8">
              <Image 
                src="/assets/hero_wisdom.png" 
                alt="Value Education Dashboard" 
                fill 
                className="object-contain drop-shadow-2xl animate-float p-10"
              />
            </div>
          </div>
        </section>

        {/* Learning Center Hub */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-black text-secondary tracking-tighter italic uppercase">Learning Center</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Study Modules */}
            <Link
              href="/student/study"
              className="group relative overflow-hidden rounded-[4rem] bg-white border border-orange-100 p-10 shadow-2xl transition-all hover:-translate-y-2 hover:shadow-primary/20"
            >
              <div className="flex flex-col h-full justify-between relative z-10">
                <div className="space-y-6">
                  <div className="h-20 w-20 rounded-[2rem] bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner">
                    <BookOpen className="h-10 w-10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-secondary">Study Modules</h3>
                    <p className="text-secondary/60 font-medium leading-relaxed">Access comprehensive literature and story-based modules for character building.</p>
                  </div>
                </div>
                <div className="mt-10 flex items-center gap-3 text-xs font-black text-blue-600 uppercase tracking-[0.2em] group-hover:gap-5 transition-all">
                  Access Modules <ArrowRight className="h-5 w-5" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-48 h-full opacity-5 grayscale group-hover:grayscale-0 group-hover:opacity-30 transition-all scale-110 group-hover:scale-125 duration-700">
                <Image src="/assets/book_thumb.png" alt="Study" fill className="object-contain object-right" />
              </div>
            </Link>

            {/* National Examination */}
            <Link
              href="/student/exam"
              className="group relative overflow-hidden rounded-[4rem] bg-white border border-orange-100 p-10 shadow-2xl transition-all hover:-translate-y-2 hover:shadow-primary/20"
            >
              <div className="flex flex-col h-full justify-between relative z-10">
                <div className="space-y-6">
                  <div className="h-20 w-20 rounded-[2rem] bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
                    <FileText className="h-10 w-10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-secondary">Final Assessment</h3>
                    <p className="text-secondary/60 font-medium leading-relaxed">The official national examination to validate your learning and character development.</p>
                  </div>
                </div>
                <div className="mt-10 flex items-center gap-3 text-xs font-black text-orange-600 uppercase tracking-[0.2em] group-hover:gap-5 transition-all">
                  Take Final Exam <ArrowRight className="h-5 w-5" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-48 h-full opacity-5 grayscale group-hover:grayscale-0 group-hover:opacity-30 transition-all scale-110 group-hover:scale-125 duration-700">
                <Image src="/assets/badge.png" alt="Examination" fill className="object-contain object-right" />
              </div>
            </Link>
          </div>
        </section>

        {/* Notifications & Live Lectures */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Announcements Card */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-black text-secondary tracking-tighter uppercase italic">Important Announcements</h2>
            </div>
            <div className="grid gap-6">
              {announcements.map((msg: any) => (
                <div key={msg.id} className="p-8 rounded-[2.5rem] bg-white border border-orange-100 shadow-xl flex gap-8 group card-premium">
                  <div className="h-16 w-16 shrink-0 rounded-3xl bg-orange-50 flex items-center justify-center text-secondary/40 group-hover:bg-primary group-hover:text-white transition-colors">
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-secondary">{msg.title}</h3>
                    <p className="text-secondary/60 font-medium leading-relaxed line-clamp-2">{msg.content}</p>
                    <div className="flex items-center gap-2 pt-2">
                       <span className="text-[10px] font-black text-secondary/30 uppercase tracking-widest">{new Date(msg.created_at).toLocaleDateString()}</span>
                       <span className="h-1 w-1 rounded-full bg-orange-100" />
                       <span className="text-[10px] font-black text-primary uppercase tracking-widest">Official</span>
                    </div>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="p-16 text-center rounded-[3rem] bg-orange-50/30 border-2 border-dashed border-orange-100 space-y-4">
                  <Bell className="h-10 w-10 text-orange-200 mx-auto" />
                  <p className="text-secondary/40 font-bold">No new announcements at this time.</p>
                </div>
              )}
            </div>
          </div>

          {/* Live Lectures Card */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-3">
              <Video className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-black text-secondary tracking-tighter uppercase italic">Online Lectures</h2>
            </div>
            <div className="space-y-6">
              {liveClasses.map((cls: any) => (
                <div key={cls.id} className="p-10 rounded-[3rem] bg-secondary text-white space-y-6 shadow-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform scale-150">
                    <Video className="h-32 w-32" />
                  </div>
                  <div className="space-y-3 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-primary text-[10px] font-black uppercase tracking-widest border border-white/5">
                       <GraduationCap className="h-3 w-3" /> Live Session
                    </div>
                    <h3 className="text-2xl font-black leading-tight tracking-tight">{cls.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-white/60 text-sm font-bold relative z-10 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <Calendar className="h-5 w-5 text-primary" /> 
                    {new Date(cls.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <a 
                    href={cls.zoom_link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex h-16 items-center justify-center rounded-[1.5rem] bg-primary text-white font-black text-lg hover:scale-[1.02] transition-all relative z-10 shadow-2xl active:scale-95"
                  >
                    Join Lecture <ExternalLink className="h-5 w-5 ml-3" />
                  </a>
                </div>
              ))}
              {liveClasses.length === 0 && (
                <div className="p-16 rounded-[3rem] bg-orange-50/30 border-2 border-dashed border-orange-100 flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-xl">
                    <Video className="h-8 w-8 text-orange-200" />
                  </div>
                  <p className="text-sm font-bold text-secondary/40 px-6">New lecture schedules will be announced soon.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Results & Certification Section */}
        <section className="bg-secondary rounded-[4rem] p-12 overflow-hidden relative shadow-3xl group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-xl text-center lg:text-left">
              <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto lg:mx-0">
                 <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-5xl font-black text-white italic tracking-tighter leading-none">Results & Certificates</h2>
              <p className="text-white/60 text-lg font-medium leading-relaxed">Official national rankings, scoring reports, and certified achievements are managed here.</p>
              <Link 
                href="/student/results" 
                className="inline-flex h-20 px-14 rounded-3xl bg-primary text-white font-black text-xl items-center gap-4 shadow-2xl shadow-primary/40 transition-all hover:scale-[1.05] active:scale-95"
              >
                View My Results <ChevronRight className="h-6 w-6" />
              </Link>
            </div>
            <div className="relative h-72 w-72 md:h-80 md:w-80 group-hover:scale-110 transition-transform duration-700">
               <div className="absolute inset-0 bg-primary/10 rounded-full blur-[80px]" />
               <Image src="/assets/badge.png" alt="Official Certification" fill className="object-contain drop-shadow-3xl" />
            </div>
          </div>
          {/* Decoration */}
          <div className="absolute -bottom-20 -left-20 h-80 w-80 bg-orange-500/5 rounded-full blur-[100px]" />
        </section>

        {/* Community Engagement */}
        {!session.whatsapp_joined && (
          <section className="p-12 rounded-[4rem] bg-orange-50 border border-orange-100 flex flex-col lg:flex-row items-center gap-12 shadow-2xl shadow-orange-900/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5">
                <MessageCircle className="h-40 w-40 text-secondary" />
             </div>
             <div className="h-24 w-24 rounded-[2.5rem] bg-secondary flex items-center justify-center shadow-2xl shadow-secondary/30 shrink-0">
                <MessageCircle className="h-12 w-12 text-primary" />
             </div>
             <div className="space-y-2 flex-1 text-center lg:text-left relative z-10">
                <h2 className="text-4xl font-black text-secondary tracking-tighter italic">Official Student Group</h2>
                <p className="text-secondary/60 font-medium text-lg">Join the official WhatsApp group for instant notifications and study support.</p>
             </div>
             <div className="flex flex-col gap-4 shrink-0 w-full lg:w-auto relative z-10">
               <a href={whatsappUrl || "#"} className="h-16 px-12 rounded-[1.5rem] bg-secondary text-white font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-secondary/30 hover:scale-[1.02] active:scale-95 transition-all">
                 Join Group
               </a>
               <form action={markWhatsappJoined}>
                  <button className="text-secondary/30 text-xs font-black uppercase tracking-[0.2em] hover:text-secondary transition-colors">I'm already in the group</button>
               </form>
             </div>
          </section>
        )}
      </main>

      {/* Footer Line */}
      <div className="fixed bottom-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-orange-400 to-secondary opacity-60" />
    </div>
  );
}
