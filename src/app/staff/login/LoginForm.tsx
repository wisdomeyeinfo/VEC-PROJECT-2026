"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Lock, Mail, Loader2, Sparkles, AlertCircle } from "lucide-react";

function getSafeStaffNext(next: string | null) {
  if (!next?.startsWith("/staff")) return "/staff";
  if (next.startsWith("//")) return "/staff";
  return next;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => getSafeStaffNext(searchParams.get("next")), [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      router.replace(nextPath);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
          <Mail className="h-3 w-3" /> Email Address
        </label>
        <div className="relative group">
          <input
            className="w-full h-14 rounded-2xl bg-zinc-50 border-2 border-transparent px-5 outline-none focus:border-primary focus:bg-white transition-all font-bold text-zinc-800 shadow-inner"
            type="email"
            placeholder="guru@vec.org"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
          <Lock className="h-3 w-3" /> Admin Password
        </label>
        <div className="relative group">
          <input
            className="w-full h-14 rounded-2xl bg-zinc-50 border-2 border-transparent px-5 outline-none focus:border-primary focus:bg-white transition-all font-bold text-zinc-800 shadow-inner"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border-2 border-red-100 bg-red-50 p-4 flex items-start gap-3 animate-in shake duration-300">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-red-900 leading-relaxed">
            {error}
          </p>
        </div>
      )}

      <button
        className="w-full h-16 rounded-3xl bg-zinc-900 text-white font-black text-lg shadow-2xl shadow-zinc-900/20 transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3 group overflow-hidden relative"
        type="submit"
        disabled={submitting}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-orange-500 to-secondary opacity-0 group-hover:opacity-10 transition-opacity" />
        {submitting ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <>
            Sign into Mission Control
            <Sparkles className="h-5 w-5 text-primary group-hover:scale-125 transition-transform" />
          </>
        )}
      </button>

      <div className="text-center">
         <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-loose">
            Authorized Personnel Only <br />
            Security Level: Central Command
         </p>
      </div>
    </form>
  );
}
