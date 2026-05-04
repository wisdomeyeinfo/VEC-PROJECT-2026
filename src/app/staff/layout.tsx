import Link from "next/link";
import { staffSignOut } from "./actions";
import { GraduationCap, LogOut, ShieldCheck } from "lucide-react";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#FCFBFA] text-secondary selection:bg-primary/30">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-orange-100">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-3">
            <Link href="/staff" className="flex items-center gap-2 group">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-secondary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-secondary tracking-tight italic uppercase text-xs sm:text-base">VEC Administration</span>
                <span className="text-[8px] sm:text-[10px] font-black text-primary uppercase tracking-widest leading-none">Official Portal</span>
              </div>
            </Link>
          </div>

          <form action={staffSignOut}>
            <button
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-secondary/40 hover:text-red-500 hover:bg-red-50 transition-all font-black text-[10px] uppercase tracking-widest"
              type="submit"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-12">
        {children}
      </main>

      {/* Footer Line */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-primary to-secondary opacity-20" />
    </div>
  );
}
