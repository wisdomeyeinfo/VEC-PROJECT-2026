import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function StaffLoginPage() {
  return (
    <div className="min-h-dvh bg-zinc-50 px-6 py-10 text-zinc-900">
      <main className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Staff login</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Use your staff email/password (Supabase Auth).
        </p>

        <Suspense fallback={<div className="mt-6 text-sm text-zinc-500">Loading…</div>}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 flex items-center justify-between">
          <Link className="text-sm font-semibold text-orange-700 hover:underline" href="/">
            Back
          </Link>
        </div>
      </main>
    </div>
  );
}

