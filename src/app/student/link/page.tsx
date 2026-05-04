import Link from "next/link";
import { LinkForm } from "./LinkForm";
import { Link as LinkIcon, ArrowLeft } from "lucide-react";

export default function StudentLinkPage() {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center bg-background px-4 py-12 overflow-hidden selection:bg-primary/30">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />

      <main className="relative z-10 w-full max-w-lg">
        <Link 
          href="/" 
          className="group mb-8 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-primary transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 group-hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Home
        </Link>

        <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-zinc-200/50 border border-zinc-100">
          {/* Form Header */}
          <div className="bg-gradient-to-br from-accent to-cyan-500 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <LinkIcon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-black">Link Account</h1>
                <p className="text-white/80 text-sm font-medium">Connect your kit to your Google account.</p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8 space-y-6">
            <p className="text-zinc-500 text-sm leading-relaxed">
              Enter your activation code once to link it with your Google account. This will let you sign in with one click next time!
            </p>

            <LinkForm />

            <div className="pt-4 flex flex-col gap-3">
              <Link className="text-center text-sm font-bold text-accent hover:underline" href="/student/activate">
                First-time activation? Register here
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

