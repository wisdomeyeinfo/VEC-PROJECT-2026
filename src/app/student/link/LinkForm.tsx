"use client";

import { useState, useTransition } from "react";
import { linkGoogleWithActivationCode } from "./actions";
import { Hash, Loader2, ArrowRight } from "lucide-react";

export function LinkForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await linkGoogleWithActivationCode(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to link account");
          }
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm font-bold text-zinc-600 flex items-center gap-2">
          <Hash className="h-4 w-4 text-accent" />
          Activation Code
        </label>
        <input
          className="w-full h-14 rounded-2xl border-2 border-zinc-100 bg-zinc-50 px-4 text-lg font-bold outline-none focus:border-accent focus:bg-white transition-all placeholder:font-medium uppercase"
          name="activation_code"
          placeholder="VEC-XXXX-XXXX"
          required
        />
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600 font-bold">
          {error}
        </div>
      )}

      <button
        className="w-full h-14 rounded-2xl bg-accent text-white font-black text-lg shadow-lg shadow-accent/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        type="submit"
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <>
            Link Account
            <ArrowRight className="h-6 w-6" />
          </>
        )}
      </button>
    </form>
  );
}
