import Image from "next/image";
import { LoginClient } from "./LoginClient";
import { Star, Sparkles } from "lucide-react";

export default function StudentLoginPage() {
  return (
    <div className="relative min-h-dvh bg-[#FFF8F0] flex flex-col overflow-hidden">

      {/* === Colourful top wave / hero strip === */}
      <div className="relative w-full bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 pt-12 pb-20 px-6 text-center overflow-hidden">
        {/* floating blobs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-4 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        {/* Stars decoration */}
        <div className="absolute top-6 left-6 opacity-60">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="absolute top-8 right-8 opacity-40">
          <Star className="h-4 w-4 text-yellow-200 fill-yellow-200" />
        </div>

        {/* Mascot */}
        <div className="relative mx-auto w-36 h-36 animate-float">
          <Image
            src="/assets/mascot_owl.png"
            alt="VEC Mascot"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        <h1 className="mt-4 text-3xl font-black text-white leading-tight tracking-tight">
          VEC 2026
        </h1>
        <p className="mt-1 text-orange-100 text-sm font-medium">
          Right Values • Bright Future
        </p>
      </div>

      {/* === Curved white card slide up over the hero === */}
      <div className="relative z-10 -mt-10 flex-1 bg-[#FFF8F0] rounded-t-[2.5rem] px-6 pt-8 pb-10 shadow-[0_-4px_30px_rgba(0,0,0,0.06)]">
        <LoginClient />

        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {[
              { emoji: "📚", label: "Learn Values" },
              { emoji: "🏆", label: "Win Prizes" },
              { emoji: "🌟", label: "Grow Wise" },
            ].map(({ emoji, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100">
                <span className="text-sm">{emoji}</span>
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
