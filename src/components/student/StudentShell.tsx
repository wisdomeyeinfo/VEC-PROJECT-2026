"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  ClipboardList,
  Trophy,
  User,
  Star,
  LogOut,
  Sparkles,
} from "lucide-react";

// Pages that should NOT show any nav (login, onboarding, etc.)
const PUBLIC_PATHS = [
  "/student/login",
  "/student/activate",
  "/student/link",
  "/student/onboarding",
];

const navItems = [
  { href: "/student",         label: "Home",    Icon: Home,          color: "from-orange-400 to-orange-500" },
  { href: "/student/study",   label: "Study",   Icon: BookOpen,      color: "from-purple-500 to-violet-600" },
  { href: "/student/exam",    label: "Exam",    Icon: ClipboardList, color: "from-teal-400 to-teal-600" },
  { href: "/student/results", label: "Results", Icon: Trophy,        color: "from-amber-400 to-orange-500" },
  { href: "/student/profile", label: "Profile", Icon: User,          color: "from-pink-400 to-rose-500" },
];

export function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Public pages (login, activate, onboarding) — no chrome at all
  if (isPublic) {
    return <>{children}</>;
  }

  // Authenticated pages — sidebar on desktop, bottom nav on mobile
  return (
    <div className="flex min-h-dvh bg-[#FFF8F0] overflow-x-hidden">

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-40 bg-white border-r border-orange-100 shadow-xl shadow-orange-900/5">

        {/* Brand */}
        <div className="px-6 py-6 border-b border-orange-50">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-300/50 shrink-0">
              <Star className="h-5 w-5 text-white fill-white" />
            </div>
            <div className="leading-none">
              <span className="block font-black text-secondary text-lg tracking-tight">VEC 2026</span>
              <span className="text-[9px] font-black text-orange-400 uppercase tracking-[0.15em]">Value Education</span>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pt-2 pb-3 text-[9px] font-black text-secondary/30 uppercase tracking-[0.2em]">Navigation</p>
          {navItems.map(({ href, label, Icon, color }) => {
            const isActive = href === "/student"
              ? pathname === "/student"
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${color} text-white shadow-lg`
                    : "text-secondary/50 hover:text-secondary hover:bg-orange-50"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
                {isActive && <Sparkles className="h-3 w-3 ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-orange-50">
          <form action="/api/student/signout" method="POST">
            <Link
              href="/student/login"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black text-red-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Link>
          </form>
          <p className="mt-3 px-4 text-[9px] font-bold text-secondary/20 uppercase tracking-widest">
            © ISKCON VEC 2026
          </p>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 min-w-0 w-full lg:ml-64 min-h-dvh">
        {/* On mobile add substantial bottom padding so content isn't hidden behind bottom nav */}
        <div className="lg:pb-0 pb-36">
          {children}
        </div>
      </main>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="mx-4 mb-5 rounded-3xl bg-white/95 backdrop-blur-2xl border border-orange-100 shadow-2xl shadow-orange-900/30 px-2 py-1.5 pointer-events-auto">
          <div className="grid grid-cols-5 gap-1">
            {navItems.map(({ href, label, Icon, color }) => {
              const isActive = href === "/student"
                ? pathname === "/student"
                : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-br ${color} text-white shadow-lg scale-105 -translate-y-1`
                      : "text-secondary/40 hover:text-secondary hover:bg-orange-50/50"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`} />
                  <span className={`text-[7px] font-black uppercase tracking-widest leading-none ${isActive ? "text-white" : ""}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

    </div>
  );
}
