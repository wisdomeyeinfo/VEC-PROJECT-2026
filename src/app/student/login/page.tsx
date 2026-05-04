import Image from "next/image";
import { LoginClient } from "./LoginClient";
import { Star, Sparkles, BookOpen, Trophy, Users } from "lucide-react";
import { getStudentSession } from "@/lib/student/session";
import { redirect } from "next/navigation";

export default async function StudentLoginPage() {
  // If already logged in, redirect to dashboard
  const session = await getStudentSession();
  if (session) redirect("/student");

  return (
    <div className="min-h-dvh flex lg:flex-row flex-col bg-[#FFF8F0]">

      {/* ===== LEFT PANEL — Branding (desktop only) ===== */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 relative overflow-hidden">

        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl" />

        {/* Logo */}
        <div className="px-10 pt-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Star className="h-6 w-6 text-white fill-white" />
            </div>
            <div>
              <span className="block font-black text-white text-xl tracking-tight">VEC 2026</span>
              <span className="text-orange-100 text-[10px] font-black uppercase tracking-[0.2em]">Value Education Contest</span>
            </div>
          </div>
        </div>

        {/* Mascot + tagline */}
        <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
          <div className="relative w-56 h-56 animate-float">
            <Image
              src="/assets/mascot_owl.png"
              alt="VEC Mascot"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          <h1 className="mt-6 text-4xl font-black text-white leading-tight tracking-tight">
            Right Values,<br />
            <span className="text-yellow-200">Bright Future</span>
          </h1>
          <p className="mt-3 text-orange-100 text-base font-medium leading-relaxed max-w-xs">
            Join thousands of students across India in the National Value Education Contest 2026.
          </p>

          {/* Stats pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              { Icon: Users, label: "10,000+ Students" },
              { Icon: BookOpen, label: "Multi-Language" },
              { Icon: Trophy, label: "National Prizes" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20">
                <Icon className="h-3.5 w-3.5 text-white" />
                <span className="text-white text-[11px] font-black uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 text-center">
          <p className="text-orange-200 text-[10px] font-bold uppercase tracking-widest">
            Powered by ISKCON Education • valuesforall.com
          </p>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Login Form ===== */}
      <div className="flex-1 flex flex-col">

        {/* Mobile hero strip */}
        <div className="lg:hidden relative bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 pt-12 pb-16 px-6 text-center overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative mx-auto w-28 h-28 animate-float">
            <Image src="/assets/mascot_owl.png" alt="VEC Mascot" fill className="object-contain drop-shadow-2xl" priority />
          </div>
          <h1 className="mt-3 text-2xl font-black text-white">VEC 2026</h1>
          <p className="text-orange-100 text-sm font-medium">Right Values • Bright Future</p>
        </div>

        {/* Form container — slides up over mobile hero */}
        <div className="flex-1 lg:flex lg:items-center lg:justify-center bg-[#FFF8F0] lg:bg-transparent rounded-t-[2.5rem] lg:rounded-none -mt-8 lg:mt-0 relative z-10 shadow-[0_-8px_40px_rgba(0,0,0,0.06)] lg:shadow-none px-6 pt-8 pb-10">
          <div className="w-full max-w-md mx-auto">

            {/* Desktop-only heading */}
            <div className="hidden lg:block mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 mb-4">
                <Sparkles className="h-4 w-4 text-orange-400" />
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Student Portal</span>
              </div>
              <h2 className="text-4xl font-black text-secondary leading-tight">
                Welcome back,<br />
                <span className="text-gradient-primary italic">Learner! 🌟</span>
              </h2>
              <p className="mt-3 text-secondary/50 font-medium">Enter your Exam ID and password to continue.</p>
            </div>

            <LoginClient />

            {/* Help chips */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {[
                { emoji: "📚", label: "Learn Values" },
                { emoji: "🏆", label: "Win Prizes" },
                { emoji: "🌟", label: "Grow Wise" },
                { emoji: "🇮🇳", label: "National Contest" },
              ].map(({ emoji, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100">
                  <span className="text-sm">{emoji}</span>
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
