"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  ClipboardList,
  Trophy,
  User,
} from "lucide-react";

const navItems = [
  { href: "/student",         label: "Home",    Icon: Home },
  { href: "/student/study",   label: "Study",   Icon: BookOpen },
  { href: "/student/exam",    label: "Exam",    Icon: ClipboardList },
  { href: "/student/results", label: "Results", Icon: Trophy },
  { href: "/student/profile", label: "Profile", Icon: User },
];

export function StudentBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav">
      {/* Frosted glass pill */}
      <div className="mx-3 mb-3 rounded-3xl bg-white/90 backdrop-blur-2xl border border-orange-100 shadow-2xl shadow-orange-900/20 px-2 py-2">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map(({ href, label, Icon }) => {
            const isActive =
              href === "/student"
                ? pathname === "/student"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-300/50 scale-105"
                    : "text-secondary/40 hover:text-secondary hover:bg-orange-50"
                }`}
              >
                <Icon className={`${isActive ? "h-5 w-5" : "h-5 w-5"}`} />
                <span className={`text-[9px] font-black uppercase tracking-widest leading-none ${isActive ? "text-white" : ""}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
