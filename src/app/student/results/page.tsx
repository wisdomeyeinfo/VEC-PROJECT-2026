import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/student/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { 
  Trophy, 
  Download, 
  ArrowLeft, 
  ShieldCheck, 
  Lock,
  Medal,
  Star,
  Users
} from "lucide-react";
import { LanguageSelector } from "@/components/layout/LanguageSelector";

export default async function StudentResultsPage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const admin = createSupabaseAdminClient();
  
  let vis: any = null;
  let attempt: any = null;
  let topStudents: any[] = [];

  try {
    const [visRes, attemptRes, topRes] = await Promise.all([
      admin.from("results_visibility").select("visible").eq("team_id", session.team_id).maybeSingle(),
      admin.from("exam_attempts").select("status, score, total, percentage, submitted_at").eq("student_id", session.student_id).maybeSingle(),
      admin.from("exam_attempts").select("score, students(name)").eq("status", "submitted").order("score", { ascending: false }).limit(5)
    ]);
    vis = visRes.data;
    attempt = attemptRes.data;
    topStudents = topRes.data || [];
  } catch (e) {
    // Graceful fallback if tables are missing
  }

  const visible = Boolean(vis?.visible);
  const lang = session.language;

  return (
    <div className="relative min-h-dvh bg-[#FDFCF8] selection:bg-primary/30 pb-20">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-xl border-b border-zinc-100">
        <div className="mx-auto max-w-2xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/student" 
              className="p-2 rounded-xl bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-black text-zinc-800 tracking-tight italic text-lg">VEC Results</span>
          </div>
          <LanguageSelector currentLang={lang} />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-4 pt-12 space-y-10">
        {/* Page Hero */}
        <div className="text-center space-y-4">
          <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mx-auto animate-bounce-subtle">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl font-black text-zinc-900 leading-tight">The Hall of <br/><span className="text-primary italic">Wisdom</span></h1>
          <p className="text-zinc-500 font-medium max-w-sm mx-auto">See your achievements and download your official participation certificate.</p>
        </div>

        {/* Visibility Logic */}
        {!visible ? (
          <div className="p-10 rounded-[3rem] bg-zinc-900 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-orange-500 to-accent" />
            <div className="h-20 w-20 bg-white/10 rounded-[1.5rem] flex items-center justify-center mx-auto">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Results are Locked</h3>
              <p className="text-zinc-400 font-medium">The central team is currently evaluating all quests. Results will be unlocked very soon!</p>
            </div>
            <Link href="/student" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-zinc-900 font-black text-lg transition-all active:scale-95">
              Check Later
            </Link>
          </div>
        ) : attempt?.status !== "submitted" ? (
          <div className="p-10 rounded-[3rem] bg-orange-50 border-2 border-dashed border-orange-200 text-center space-y-6">
            <div className="h-20 w-20 bg-orange-100 rounded-[1.5rem] flex items-center justify-center mx-auto text-orange-600">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-orange-900">Finish Your Quest</h3>
              <p className="text-orange-700 font-medium">You need to submit your contest exam before you can see your results.</p>
            </div>
            <Link href="/student/exam" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-orange-600 text-white font-black text-lg shadow-xl shadow-orange-600/20 active:scale-95">
              Go to Exam
            </Link>
          </div>
        ) : (
          <>
            {/* Score Achievement Card */}
            <section className="relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-[3rem] rotate-1" />
              <div className="relative p-10 rounded-[3rem] bg-white border border-zinc-100 shadow-2xl flex flex-col md:flex-row items-center gap-10">
                <div className="relative h-48 w-48 shrink-0">
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                  <div className="relative h-full w-full rounded-full bg-white border-[12px] border-primary flex flex-col items-center justify-center shadow-xl">
                    <span className="text-4xl font-black text-zinc-900">{attempt.percentage}%</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Wisdom Score</span>
                  </div>
                </div>

                <div className="space-y-6 text-center md:text-left flex-1">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest">
                      <Medal className="h-3 w-3" /> Quest Completed
                    </div>
                    <h2 className="text-3xl font-black text-zinc-900 leading-tight">Excellent Work!</h2>
                    <p className="text-zinc-500 font-medium leading-relaxed">
                      You answered <span className="text-zinc-900 font-bold">{attempt.score} out of {attempt.total}</span> questions correctly. You are truly a values champion!
                    </p>
                  </div>

                  <a
                    href="/api/student/certificate"
                    className="w-full h-16 rounded-[2rem] bg-zinc-900 text-white font-black text-lg shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Download className="h-6 w-6 text-primary" /> Download Certificate
                  </a>
                </div>
              </div>
            </section>

            {/* Leaderboard */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black text-zinc-800">Global Leaderboard</h2>
              </div>
              <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl overflow-hidden">
                {topStudents.map((top: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-6 border-b border-zinc-50 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black ${
                        i === 0 ? 'bg-yellow-100 text-yellow-600' :
                        i === 1 ? 'bg-zinc-100 text-zinc-500' :
                        i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-zinc-50 text-zinc-300'
                      }`}>
                        {i + 1}
                      </div>
                      <span className="font-bold text-zinc-800">{(top.students as any)?.name || "Unknown Warrior"}</span>
                    </div>
                    <div className="text-sm font-black text-primary uppercase tracking-widest">{top.score} pts</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Share Section */}
        <div className="p-8 rounded-[2.5rem] bg-secondary/5 border border-secondary/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-black text-secondary uppercase tracking-tight">Spread the Wisdom</h3>
            <p className="text-xs text-zinc-500 font-medium">Invite your friends to join the VEC 2026 quest!</p>
          </div>
          <button className="h-12 px-8 rounded-2xl bg-secondary text-white font-black text-sm shadow-lg shadow-secondary/20 flex items-center gap-2">
            <Users className="h-4 w-4" /> Share My Score
          </button>
        </div>
      </main>
      {/* Decorative Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-orange-500 to-secondary opacity-50" />
    </div>
  );
}
