import Image from "next/image";
import Link from "next/link";
import { LoginClient } from "./LoginClient";
import { ChevronLeft } from "lucide-react";

export default function StudentLoginPage() {
  return (
    <div className="relative min-h-dvh bg-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />
      </div>

      <main className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Illustrative */}
        <div className="hidden lg:flex flex-col items-start space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-4">
            <h1 className="text-7xl font-black text-zinc-900 leading-tight tracking-tighter">
              Discover <br />
              <span className="text-orange-600 italic">Values</span> <br />
              For Life.
            </h1>
            <p className="text-xl text-zinc-500 font-medium max-w-md leading-relaxed">
              Join thousands of students in the 2026 Value Education Contest. Learn, grow, and lead with wisdom.
            </p>
          </div>
          
          <div className="relative aspect-square w-full max-w-sm rounded-[4rem] overflow-hidden bg-orange-50 border border-orange-100 p-8 group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Image 
              src="/assets/hero_wisdom.png" 
              alt="Wisdom" 
              fill 
              className="object-contain p-10 animate-float drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-col items-center">
          <LoginClient />
          
          <div className="mt-12 flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
            >
              <ChevronLeft className="h-4 w-4" />
              Back Home
            </Link>
          </div>
        </div>
      </main>

      {/* Mobile Footer Decor */}
      <div className="lg:hidden mt-12 opacity-30">
        <Image src="/assets/badge.png" alt="Badge" width={64} height={64} />
      </div>
    </div>
  );
}
