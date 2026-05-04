"use client";

import { useState, useTransition } from "react";
import { Languages, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { code: "en", name: "English", label: "English" },
  { code: "hi", name: "Hindi", label: "हिन्दी" },
  { code: "mr", name: "Marathi", label: "मराठी" },
  { code: "gu", name: "Gujarati", label: "ગુજરાતી" },
  { code: "bn", name: "Bengali", label: "বাংলা" },
];

export function LanguageSelector({ currentLang }: { currentLang: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleLanguageChange(lang: string) {
    if (lang === currentLang) return;
    setOpen(false);
    
    // We'll use a fetch to a server action/api to update the session
    startTransition(async () => {
      try {
        await fetch("/api/student/update-lang", {
          method: "POST",
          body: JSON.stringify({ language: lang }),
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
        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-orange-100 shadow-sm transition-all hover:bg-white active:scale-95"
      >
        <Languages className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold text-secondary">
          {LANGUAGES.find((l) => l.code === currentLang)?.label || "Language"}
        </span>
        <ChevronDown className={`h-4 w-4 text-secondary/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-2xl shadow-orange-900/10 border border-orange-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left hover:bg-orange-50 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-secondary">{lang.label}</span>
                  <span className="text-[10px] font-medium text-secondary/40 uppercase tracking-wider">{lang.name}</span>
                </div>
                {currentLang === lang.code && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
