"use client";

import { useState, useTransition } from "react";
import { studentLogin } from "./actions";
import { GraduationCap, Key, User, ArrowRight, Loader2, Sparkles } from "lucide-react";

export function LoginClient() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-tr from-orange-500 to-amber-400 shadow-2xl shadow-orange-500/20">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-black tracking-tighter text-zinc-900 mt-6">
          Welcome, <span className="text-orange-600 italic">Learner!</span>
        </h2>
        <p className="text-zinc-500 font-medium">Enter your 10-digit Exam ID to start your journey.</p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400 group-focus-within:text-orange-500 transition-colors">
              <User className="h-5 w-5" />
            </div>
            <input
              name="examId"
              type="text"
              placeholder="10-digit Exam ID"
              required
              maxLength={10}
              className="block w-full h-16 pl-12 pr-4 rounded-3xl border-2 border-zinc-100 bg-zinc-50/50 text-lg font-bold placeholder:text-zinc-400 placeholder:font-medium focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-400 group-focus-within:text-orange-500 transition-colors">
              <Key className="h-5 w-5" />
            </div>
            <input
              name="password"
              type="password"
              placeholder="Temporary Password"
              required
              className="block w-full h-16 pl-12 pr-4 rounded-3xl border-2 border-zinc-100 bg-zinc-50/50 text-lg font-bold placeholder:text-zinc-400 placeholder:font-medium focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
            />
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
          className="relative group w-full h-16 flex items-center justify-center rounded-3xl bg-zinc-900 text-white font-black text-xl shadow-2xl shadow-zinc-900/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100 overflow-hidden"
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

      <div className="flex flex-col items-center gap-4 pt-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="h-px w-8 bg-zinc-200" />
          <span className="text-xs font-black uppercase tracking-widest">Help & Support</span>
          <div className="h-px w-8 bg-zinc-200" />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-white border border-zinc-100 text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-orange-500" /> Stickers in kit
          </div>
          <div className="px-4 py-2 rounded-xl bg-white border border-zinc-100 text-[10px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-blue-500" /> 10-digit ID
          </div>
        </div>
      </div>
    </div>
  );
}
