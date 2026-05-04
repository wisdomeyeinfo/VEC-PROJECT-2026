import Link from "next/link";
import { ActivateForm } from "./ActivateForm";
import { ArrowLeft, ClipboardList } from "lucide-react";

export default function StudentActivatePage() {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center bg-[#FCFBFA] px-4 py-12 md:py-20 overflow-hidden selection:bg-primary/30">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 h-[400px] md:h-[600px] w-[400px] md:w-[600px] rounded-full bg-primary/5 blur-[80px] md:blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 h-[400px] md:h-[600px] w-[400px] md:w-[600px] rounded-full bg-secondary/5 blur-[80px] md:blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <main className="relative z-10 w-full max-w-lg">
        <Link 
          href="/" 
          className="group mb-6 md:mb-8 inline-flex items-center gap-3 text-[10px] md:text-xs font-black text-secondary/40 hover:text-primary transition-all uppercase tracking-widest"
        >
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl md:rounded-2xl bg-white border border-orange-100 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Return to Portal
        </Link>

        <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-3xl border border-orange-50 animate-in fade-in zoom-in-95 duration-700">
          {/* Form Header */}
          <div className="bg-secondary p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <ClipboardList className="h-32 w-32" />
            </div>
            <div className="flex items-center gap-4 md:gap-5 relative z-10">
              <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-xl border border-white/10">
                <ClipboardList className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              <div className="space-y-0.5 md:space-y-1">
                <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">Course Activation</h1>
                <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest">Verify enrollment to begin</p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8 md:p-10">
            <ActivateForm />
          </div>
        </div>

        <div className="mt-8 md:mt-10 flex flex-col items-center gap-2">
          <div className="h-1 w-8 bg-orange-100 rounded-full" />
          <p className="text-center text-[8px] md:text-[10px] font-black text-secondary/20 uppercase tracking-[0.25em]">
            National Value Education Contest 2026
          </p>
        </div>
      </main>
      
      {/* Footer Line */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-orange-500 to-secondary opacity-30" />
    </div>
  );
}
