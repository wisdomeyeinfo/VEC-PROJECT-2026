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
  } catch (e) {}

  const visible = Boolean(vis?.visible);
  const lang = session.language;

  return (
    <div className="relative min-h-dvh bg-[#FDFCF8] selection:bg-primary/30 pb-20 md:pb-32">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[80%] md:w-[50%] h-[50%] rounded-full bg-primary/5 blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[80%] md:w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[80px] md:blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-xl border-b border-orange-100">
        <div className="mx-auto max-w-2xl px-4 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Link 
              href="/student" 
              className="h-10 w-10 rounded-xl bg-secondary/5 text-secondary/60 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-black text-secondary tracking-tight italic text-base md:text-xl uppercase">Quest Results</span>
          </div>
          <LanguageSelector currentLang={lang} />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-4 md:px-6 pt-8 md:pt-12 space-y-8 md:space-y-12">
        {/* Page Hero */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-[2rem] bg-primary/10 flex items-center justify-center mx-auto animate-bounce-subtle">
            <Trophy className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-secondary leading-tight tracking-tighter">The Hall of <br/><span className="text-gradient-primary italic">Wisdom</span></h1>
          <p className="text-sm md:text-lg text-secondary/50 font-medium max-w-xs md:max-w-sm mx-auto leading-relaxed">See your achievements and download your official participation certificate.</p>
        </div>

        {/* Visibility Logic */}
        {!visible ? (
          <div className="p-8 md:p-12 rounded-3xl md:rounded-[3rem] bg-secondary text-center space-y-6 md:space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-primary via-orange-500 to-accent" />
            <div className="h-16 w-16 md:h-20 md:w-20 bg-white/10 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-2xl md:text-3xl font-black text-white italic">Results Locked</h3>
              <p className="text-sm md:text-lg text-white/40 font-medium">The central team is currently evaluating all quests. Results will be unlocked very soon!</p>
            </div>
            <Link href="/student" className="inline-flex h-14 md:h-16 items-center justify-center px-10 rounded-xl md:rounded-2xl bg-white text-secondary font-black text-base md:text-lg transition-all active:scale-95 w-full sm:w-auto shadow-xl">
              Check Later
            </Link>
          </div>
        ) : attempt?.status !== "submitted" ? (
          <div className="p-8 md:p-12 rounded-3xl md:rounded-[3rem] bg-orange-50 border-2 border-dashed border-orange-200 text-center space-y-6 md:space-y-8">
            <div className="h-16 w-16 md:h-20 md:w-20 bg-orange-100 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center mx-auto text-orange-600">
              <ShieldCheck className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-2xl md:text-3xl font-black text-orange-900 italic">Finish Your Quest</h3>
              <p className="text-sm md:text-lg text-orange-700 font-medium">You need to submit your contest exam before you can see your results.</p>
            </div>
            <Link href="/student/exam" className="inline-flex h-14 md:h-16 items-center justify-center px-10 rounded-xl md:rounded-2xl bg-orange-600 text-white font-black text-base md:text-lg shadow-xl shadow-orange-600/20 active:scale-95 w-full sm:w-auto">
              Go to Exam
            </Link>
          </div>
        ) : (
          <>
            {/* Score Achievement Card */}
            <section className="relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] md:rounded-[3.5rem] rotate-1" />
              <div className="relative p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-white border border-orange-50 shadow-2xl flex flex-col items-center gap-8 md:gap-10">
                <div className="relative h-40 w-40 md:h-48 md:w-48 shrink-0">
                  <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                  <div className="relative h-full w-full rounded-full bg-white border-[10px] md:border-[12px] border-primary flex flex-col items-center justify-center shadow-xl">
                    <span className="text-3xl md:text-4xl font-black text-secondary italic tracking-tighter">{attempt.percentage}%</span>
                    <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Wisdom Score</span>
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8 text-center flex-1">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest mx-auto">
                      <Medal className="h-3 w-3" /> Quest Completed
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-secondary leading-tight italic tracking-tighter">Excellent Work!</h2>
                    <p className="text-sm md:text-lg text-secondary/40 font-medium leading-relaxed px-4">
                      You answered <span className="text-secondary font-black">{attempt.score} out of {attempt.total}</span> questions correctly. You are truly a values champion!
                    </p>
                  </div>

                  <a
                    href="/api/student/certificate"
                    className="w-full h-16 md:h-20 rounded-2xl md:rounded-[2rem] bg-secondary text-white font-black text-lg md:text-xl shadow-2xl shadow-secondary/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 flex items-center gap-3">
                      <Download className="h-6 w-6 text-primary group-hover:text-white transition-colors" /> Download Certificate
                    </span>
                  </a>
                </div>
              </div>
            </section>

            {/* Leaderboard */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 px-4">
                <Star className="h-5 w-5 text-primary" />
                <h2 className="text-lg md:text-xl font-black text-secondary uppercase tracking-tight">Global Leaderboard</h2>
              </div>
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-orange-50 shadow-xl overflow-hidden">
                {topStudents.map((top: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-5 md:p-6 border-b border-orange-50 last:border-0 group hover:bg-orange-50/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black italic shadow-sm ${
                        i === 0 ? 'bg-yellow-400 text-white' :
                        i === 1 ? 'bg-zinc-300 text-white' :
                        i === 2 ? 'bg-orange-400 text-white' : 'bg-orange-50 text-secondary/20'
                      }`}>
                        {i + 1}
                      </div>
                      <span className="font-bold text-secondary text-sm md:text-base">{(top.students as any)?.name || "Unknown Warrior"}</span>
                    </div>
                    <div className="text-xs md:text-sm font-black text-primary uppercase tracking-widest">{top.score} pts</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Share Section */}
        <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-black text-secondary uppercase tracking-tight text-sm">Spread the Wisdom</h3>
            <p className="text-[10px] md:text-xs text-secondary/40 font-medium">Invite your friends to join the VEC 2026 quest!</p>
          </div>
          <button className="h-12 px-8 rounded-xl md:rounded-2xl bg-secondary text-white font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg shadow-secondary/20 flex items-center gap-2 w-full md:w-auto justify-center hover:scale-[1.02] active:scale-95 transition-all">
            <Users className="h-4 w-4 text-primary" /> Share My Score
          </button>
        </div>
      </main>
      
      {/* Footer Line */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-orange-500 to-secondary opacity-30" />
    </div>
  );
}
