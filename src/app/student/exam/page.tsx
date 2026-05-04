import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/student/session";
import { ExamClient } from "./ExamClient";
import { GraduationCap, X, ClipboardList } from "lucide-react";

export default async function StudentExamPage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  return (
    <div className="relative min-h-dvh bg-[#FCFBFA] selection:bg-primary/30 overflow-x-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      {/* Mode Header */}
      <header className="relative z-10 w-full p-4 md:p-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center shadow-2xl">
              <ClipboardList className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="font-black text-secondary tracking-tight text-xl italic uppercase">Examination Portal</h1>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mt-1">National Assessment 2026 • Official Session</p>
            </div>
          </div>

          <Link 
            href="/student"
            className="h-14 w-14 rounded-2xl bg-white border border-orange-100 flex items-center justify-center text-secondary/30 hover:text-red-500 hover:bg-red-50 transition-all shadow-xl group"
          >
            <X className="h-7 w-7 transition-transform group-hover:rotate-90" />
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <ExamClient />
      </main>

      {/* Decorative Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-primary to-secondary opacity-30" />
    </div>
  );
}
