import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/student/session";
import { ExamClient } from "./ExamClient";
import { ClipboardList, X } from "lucide-react";

export default async function StudentExamPage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  return (
    <div className="relative min-h-dvh bg-[#FCFBFA] selection:bg-primary/30 overflow-x-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[80%] md:w-[50%] h-[50%] rounded-full bg-primary/5 blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[80%] md:w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[80px] md:blur-[120px]" />
      </div>

      {/* Mode Header */}
      <header className="sticky top-0 z-50 w-full p-3 md:p-8 bg-white/40 backdrop-blur-md border-b border-orange-50 md:bg-transparent md:backdrop-blur-none md:border-none">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-secondary flex items-center justify-center shadow-xl">
              <ClipboardList className="h-5 w-5 md:h-7 md:w-7 text-primary" />
            </div>
            <div>
              <h1 className="font-black text-secondary tracking-tight text-base md:text-xl italic uppercase leading-none">Exam Portal</h1>
              <p className="hidden sm:block text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mt-1 md:mt-2">National Assessment 2026 • Official Session</p>
              <p className="sm:hidden text-[7px] font-black text-primary uppercase tracking-[0.1em] mt-1">VEC 2026 Official</p>
            </div>
          </div>

          <Link 
            href="/student"
            className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-white border border-orange-100 flex items-center justify-center text-secondary/30 hover:text-red-500 hover:bg-red-50 transition-all shadow-lg md:shadow-xl group"
          >
            <X className="h-5 w-5 md:h-7 md:w-7 transition-transform group-hover:rotate-90" />
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <ExamClient />
      </main>

      {/* Decorative Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-primary to-secondary opacity-30" />
    </div>
  );
}
