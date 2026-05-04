"use client";

import { useState, useTransition } from "react";
import { Languages, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { LANGUAGE_OPTIONS, langToCode, normalizeLang } from "@/lib/lang";

const NATIVE_LABELS: Record<string, string> = {
  English:  "English",
  Hindi:    "हिन्दी",
  Marathi:  "मराठी",
  Gujarati: "ગુજરાતી",
  Tamil:    "தமிழ்",
  Bengali:  "বাংলা",
  Kannada:  "ಕನ್ನಡ",
};

export function LanguageSelector({ currentLang }: { currentLang: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Normalize whatever comes in (could be "en" or "English")
  const normalizedCurrent = normalizeLang(currentLang);

  async function handleLanguageChange(langValue: string) {
    if (normalizeLang(langValue) === normalizedCurrent) { setOpen(false); return; }
    setOpen(false);
    startTransition(async () => {
      try {
        await fetch("/api/student/update-lang", {
          method: "POST",
          // Always send the full name (e.g. "English") to stay consistent with DB
          body: JSON.stringify({ language: langValue }),
          headers: { "Content-Type": "application/json" },
        });
        router.refresh();
      } catch (e) {
        console.error("Failed to change language", e);
      }
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-orange-100 shadow-sm transition-all hover:bg-white active:scale-95 disabled:opacity-60"
      >
        <Languages className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold text-secondary">
          {NATIVE_LABELS[normalizedCurrent] ?? normalizedCurrent}
        </span>
        <ChevronDown className={`h-4 w-4 text-secondary/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-2xl shadow-orange-900/10 border border-orange-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.value}
                onClick={() => handleLanguageChange(lang.value)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left hover:bg-orange-50 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-secondary">
                    {NATIVE_LABELS[lang.value] ?? lang.label}
                  </span>
                  <span className="text-[10px] font-medium text-secondary/40 uppercase tracking-wider">
                    {lang.label}
                  </span>
                </div>
                {normalizedCurrent === lang.value && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
