import Link from "next/link";
import { ActivateForm } from "./ActivateForm";
import { GraduationCap, ArrowLeft, ClipboardList } from "lucide-react";

export default function StudentActivatePage() {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center bg-background px-4 py-12 overflow-hidden selection:bg-primary/30">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-secondary/10 blur-[120px]" />

      <main className="relative z-10 w-full max-w-lg">
        <Link 
          href="/" 
          className="group mb-8 inline-flex items-center gap-2 text-sm font-bold text-secondary/40 hover:text-primary transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/5 group-hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Main Portal
        </Link>

        <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-orange-900/5 border border-orange-100">
          {/* Form Header */}
          <div className="bg-gradient-to-br from-secondary to-secondary/90 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-black italic tracking-tight">Course Activation</h1>
                <p className="text-white/60 text-sm font-medium">Verify your enrollment code to begin.</p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8">
            <ActivateForm />
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] font-black text-secondary/20 uppercase tracking-[0.2em]">
          National Value Education Contest 2026
        </p>
      </main>
    </div>
  );
}
