import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { ShieldCheck, GraduationCap, ArrowLeft, Sparkles } from "lucide-react";

export default function StaffLoginPage() {
  return (
    <div className="min-h-dvh bg-[#FCFBFA] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden selection:bg-primary/30">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <main className="relative z-10 w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-[2rem] bg-secondary flex items-center justify-center shadow-2xl shadow-secondary/20">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
             <h1 className="text-3xl font-black text-secondary italic tracking-tighter uppercase leading-none">Administration</h1>
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Secure Staff Portal</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-orange-100 shadow-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-700">
           {/* Primary Login Option */}
           <div className="p-8 md:p-10 space-y-6">
              <div className="space-y-2 text-center">
                 <h2 className="text-xl font-black text-secondary italic">Restricted Access</h2>
                 <p className="text-xs text-secondary/40 font-medium">Please sign in with your official account.</p>
              </div>

              <GoogleLoginButton />

              <div className="relative flex items-center gap-4 py-2">
                 <div className="h-px flex-1 bg-orange-100" />
                 <span className="text-[8px] font-black text-secondary/20 uppercase tracking-widest">or use credentials</span>
                 <div className="h-px flex-1 bg-orange-100" />
              </div>

              <Suspense fallback={<div className="text-center py-4 text-xs font-bold text-secondary/20 animate-pulse">Initializing Security...</div>}>
                <LoginForm />
              </Suspense>
           </div>
           
           {/* Footer Security Note */}
           <div className="bg-zinc-50 p-6 flex items-center justify-center gap-3 border-t border-orange-50">
              <ShieldCheck className="h-4 w-4 text-teal-500" />
              <span className="text-[9px] font-bold text-secondary/30 uppercase tracking-widest">Enterprise Grade Authentication</span>
           </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-3 text-[10px] font-black text-secondary/40 hover:text-primary transition-all uppercase tracking-widest"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-orange-100 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Back to Home
          </Link>

          <div className="flex items-center gap-2 text-secondary/10">
             <Sparkles className="h-3 w-3" />
             <span className="text-[8px] font-black uppercase tracking-[0.3em]">VEC 2026 Admin System</span>
          </div>
        </div>
      </main>
      
      {/* Footer Line */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-orange-400 to-secondary opacity-30" />
    </div>
  );
}
