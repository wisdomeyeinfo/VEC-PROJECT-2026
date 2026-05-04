"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { studentLogin } from "./actions";
import { GraduationCap, Key, User, ArrowRight, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";

export function LoginClient() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await studentLogin(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid credentials");
      }
    });
  }

  return (
    <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-gradient-to-tr from-orange-500 to-amber-400 shadow-2xl shadow-orange-500/30">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-black tracking-tighter text-secondary mt-6">
          Welcome, <span className="text-gradient-primary italic">Learner!</span>
        </h2>
        <p className="text-secondary/50 font-medium">Enter your 10-digit Exam ID to start your journey.</p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-secondary/30 group-focus-within:text-orange-500 transition-colors">
              <User className="h-5 w-5" />
            </div>
            <input
              name="examId"
              type="text"
              placeholder="10-digit Exam ID"
              required
              maxLength={10}
              className="block w-full h-16 pl-14 pr-4 rounded-[1.75rem] border-2 border-orange-100 bg-white text-lg font-black text-secondary placeholder:text-secondary/20 placeholder:font-bold focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-secondary/30 group-focus-within:text-orange-500 transition-colors">
              <Key className="h-5 w-5" />
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your Password"
              required
              className="block w-full h-16 pl-14 pr-14 rounded-[1.75rem] border-2 border-orange-100 bg-white text-lg font-black text-secondary placeholder:text-secondary/20 placeholder:font-bold focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-5 text-secondary/20 hover:text-orange-500 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2 animate-in zoom-in-95 duration-300">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="relative group w-full h-16 flex items-center justify-center rounded-[1.75rem] bg-secondary text-white font-black text-xl shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative z-10 flex items-center gap-2">
            {isPending ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Login to Dashboard
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </button>
      </form>

      <div className="flex flex-col items-center gap-6 pt-4">
        <div className="flex items-center gap-2 text-secondary/20">
          <div className="h-px w-8 bg-orange-100" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Help & Support</span>
          <div className="h-px w-8 bg-orange-100" />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-white border border-orange-100 text-[10px] font-black text-secondary/40 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-orange-400" /> Stickers in kit
          </div>
          <div className="px-4 py-2 rounded-xl bg-white border border-orange-100 text-[10px] font-black text-secondary/40 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-teal-400" /> 10-digit ID
          </div>
        </div>

        {/* Discreet Staff Access */}
        <Link 
          href="/staff/login" 
          className="text-[9px] font-black text-secondary/10 uppercase tracking-[0.3em] hover:text-orange-300 transition-colors mt-4"
        >
          Administration
        </Link>
      </div>
    </div>
  );
}
