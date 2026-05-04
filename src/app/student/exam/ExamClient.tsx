"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Trophy, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Loader2,
  Home,
  Menu,
  X,
  LayoutGrid,
  Info
} from "lucide-react";
import Link from "next/link";

type ExamState =
  | { enabled: false; reason: string }
  | {
      enabled: true;
      attempt: {
        id: string;
        status: string;
        started_at: string;
        submitted_at: string | null;
        duration_minutes: number;
        remaining_ms: number;
      };
      questions: Array<{
        id: string;
        position: number;
        question_text: string;
        options: string[];
      }>;
      answers: Record<string, number>;
    };

export function ExamClient() {
  const [state, setState] = useState<ExamState | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [visited, setVisited] = useState<Set<string>>(new Set());

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/exam/state", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const body = (await res.json()) as ExamState;
      setState(body);
      
      if (body.enabled && body.questions?.length) {
        const firstUnanswered = body.questions.findIndex(q => !body.answers?.[q.id]);
        if (firstUnanswered !== -1) setCurrentIdx(firstUnanswered);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load exam");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (state?.enabled && state.questions?.[currentIdx]) {
      setVisited(prev => new Set(prev).add(state.questions[currentIdx].id));
    }
  }, [currentIdx, state]);

  useEffect(() => {
    if (!state || !state.enabled || !state.attempt) return;
    if (state.attempt.status === "submitted") return;

    const t = setInterval(() => {
      setState((prev) => {
        if (!prev || !prev.enabled || !prev.attempt) return prev;
        const next = Math.max(0, prev.attempt.remaining_ms - 1000);
        return {
          ...prev,
          attempt: { ...prev.attempt, remaining_ms: next },
        };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [state?.enabled, (state as any)?.attempt?.status]);

  const current = useMemo(() => {
    if (!state || !state.enabled || !state.questions) return null;
    return state.questions[currentIdx] ?? null;
  }, [state, currentIdx]);

  const remainingTime = useMemo(() => {
    if (!state || !state.enabled || !state.attempt) return { h: "00", m: "00", s: "00", isLow: false };
    const ms = state.attempt.remaining_ms;
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return {
      h: h.toString().padStart(2, "0"),
      m: m.toString().padStart(2, "0"),
      s: s.toString().padStart(2, "0"),
      isLow: totalSeconds < 300
    };
  }, [state]);

  async function choose(questionId: string, chosenOption: number) {
    if (!state || !state.enabled || !state.attempt) return;
    if (state.attempt.status === "submitted") return;

    setSaving(true);
    setState({
      ...state,
      answers: { ...state.answers, [questionId]: chosenOption },
    });

    try {
      const res = await fetch("/api/student/exam/answer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question_id: questionId, chosen_option: chosenOption }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e) {
      console.error("Failed to save answer", e);
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  }

  async function submit() {
    if (!state || !state.enabled) return;
    
    const answeredCount = Object.keys(state.answers || {}).length;
    const total = state.questions?.length || 0;
    
    let msg = "Are you sure you want to submit your final answers?\n\nOnce submitted, you cannot change them.";
    if (answeredCount < total) {
      msg = `Warning: You have ${total - answeredCount} unanswered questions.\n\n` + msg;
    }

    if (!confirm(msg)) return;
    
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/student/exam/submit", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 md:py-32 space-y-4">
        <Loader2 className="h-10 w-10 md:h-12 md:w-12 text-primary animate-spin" />
        <p className="text-secondary/40 font-black uppercase tracking-widest text-[8px] md:text-xs">Loading Secure Environment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border-2 border-red-100 bg-red-50 p-6 md:p-8 text-center space-y-4">
        <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-red-500 mx-auto" />
        <h2 className="font-black text-red-900 text-lg md:text-xl uppercase">System Error</h2>
        <p className="text-red-700 text-xs md:text-sm font-medium">{error}</p>
        <button onClick={load} className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg">Retry Connection</button>
      </div>
    );
  }

  if (!state) return null;

  if (!state.enabled) {
    return (
      <div className="rounded-[2.5rem] bg-white p-8 md:p-12 text-center space-y-6 shadow-xl border border-orange-50">
        <Trophy className="h-12 w-12 md:h-16 md:w-16 text-primary mx-auto" />
        <h2 className="text-2xl md:text-3xl font-black text-secondary italic tracking-tighter">Quest Unavailable</h2>
        <p className="text-sm md:text-base text-secondary/50 font-medium">{state.reason}</p>
        <Link href="/student" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-secondary text-white font-black text-sm md:text-lg shadow-xl shadow-secondary/20">
          <Home className="h-5 w-5" /> Back Home
        </Link>
      </div>
    );
  }

  const answeredCount = Object.keys(state.answers || {}).length;
  const total = state.questions?.length || 0;
  const skippedCount = visited.size - answeredCount;

  if (state.attempt?.status === "submitted") {
    return (
      <div className="rounded-[2.5rem] md:rounded-[3rem] bg-secondary p-8 md:p-12 text-center space-y-6 md:space-y-8 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-orange-500 to-accent" />
        <CheckCircle2 className="h-16 w-16 md:h-20 md:w-20 text-primary mx-auto animate-bounce-subtle" />
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">Quest Completed!</h2>
          <p className="text-sm md:text-lg text-white/40 font-medium">Your wisdom has been recorded. Good luck with the results!</p>
        </div>
        <Link href="/student" className="inline-flex items-center gap-2 px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[2rem] bg-primary text-white font-black text-base md:text-xl shadow-xl shadow-primary/20">
          <Home className="h-5 w-5 md:h-6 md:w-6" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 max-w-7xl mx-auto items-start relative pb-20 lg:pb-0">
      
      {/* Question Palette Drawer (Mobile) / Sidebar (Desktop) */}
      <aside className={`fixed inset-y-0 right-0 z-[60] w-72 md:w-80 bg-white shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none lg:border lg:border-orange-50 lg:rounded-[2.5rem] lg:w-96 flex flex-col ${showPalette ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 md:p-6 border-b border-orange-50 flex items-center justify-between bg-zinc-50 lg:bg-transparent">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <span className="font-black text-secondary uppercase tracking-tighter text-sm">Quest Map</span>
          </div>
          <button onClick={() => setShowPalette(false)} className="lg:hidden p-2 text-secondary/20 hover:text-red-500 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-5 md:p-6 flex-1 overflow-y-auto space-y-6">
          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {[
              { label: "Done", val: answeredCount, bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
              { label: "Skipped", val: Math.max(0, skippedCount), bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" },
              { label: "Remaining", val: total - visited.size, bg: "bg-zinc-50", text: "text-zinc-400", border: "border-zinc-100" },
              { label: "Total", val: total, bg: "bg-primary/5", text: "text-primary", border: "border-primary/10" }
            ].map((stat, i) => (
              <div key={i} className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${stat.bg} border ${stat.border}`}>
                <p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-secondary/30 mb-0.5">{stat.label}</p>
                <p className={`text-base md:text-xl font-black italic tracking-tighter ${stat.text}`}>{stat.val}</p>
              </div>
            ))}
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2">
            {(state.questions || []).map((q, i) => {
              const isCurrent = currentIdx === i;
              const isAnswered = !!state.answers?.[q.id];
              const isVisited = visited.has(q.id);

              let statusColor = "bg-zinc-50 border-zinc-100 text-zinc-300 hover:border-orange-200";
              if (isAnswered) statusColor = "bg-green-500 border-green-600 text-white shadow-sm shadow-green-100";
              else if (isVisited) statusColor = "bg-orange-400 border-orange-500 text-white shadow-sm shadow-orange-100";
              if (isCurrent) statusColor = "bg-primary border-primary text-white shadow-lg shadow-primary/20 ring-4 ring-primary/10";

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIdx(i);
                    if (window.innerWidth < 1024) setShowPalette(false);
                  }}
                  className={`h-9 md:h-10 w-full rounded-lg md:rounded-xl border flex items-center justify-center font-black text-xs md:text-sm transition-all active:scale-90 ${statusColor}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-5 md:p-6 border-t border-orange-50">
          <button
            onClick={submit}
            disabled={saving}
            className="w-full h-14 rounded-xl md:rounded-2xl bg-secondary text-white font-black text-sm md:text-base shadow-xl shadow-secondary/10 hover:bg-black transition-all flex items-center justify-center gap-2 group uppercase tracking-widest"
          >
            <Send className="h-4 w-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> Finish Quest
          </button>
        </div>
      </aside>

      {/* Main Examination Area */}
      <main className="flex-1 space-y-4 md:space-y-6 w-full">
        {/* Sticky Header with Timer */}
        <div className="sticky top-[72px] md:top-24 z-30 flex items-center justify-between bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-2xl md:rounded-3xl border border-orange-50 shadow-xl shadow-orange-900/5">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setShowPalette(true)}
              className="lg:hidden h-10 w-10 rounded-lg md:rounded-xl bg-primary text-white shadow-lg flex items-center justify-center"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[7px] md:text-[9px] font-black text-secondary/30 uppercase tracking-[0.2em] leading-none mb-1">Current Progress</span>
              <span className="font-black text-secondary text-xs md:text-base italic tracking-tight">Q{currentIdx + 1} <span className="text-secondary/20">/</span> {total}</span>
            </div>
          </div>

          <div className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-1.5 md:py-2 rounded-xl md:rounded-2xl border-2 transition-all ${remainingTime.isLow ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-orange-50/30 border-orange-100'}`}>
            <Timer className={`h-4 w-4 md:h-5 md:w-5 ${remainingTime.isLow ? 'text-red-600' : 'text-primary'}`} />
            <span className={`font-mono font-black text-lg md:text-xl ${remainingTime.isLow ? 'text-red-600' : 'text-secondary'}`}>
              {remainingTime.h}:{remainingTime.m}:{remainingTime.s}
            </span>
          </div>
        </div>

        {/* Question Display Card */}
        {current && (
          <div className="relative animate-in slide-in-from-right-4 duration-300">
            <div className="p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-white border border-orange-50 shadow-3xl space-y-6 md:space-y-10">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-primary font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em]">
                  <HelpCircle className="h-3 w-3 md:h-4 md:w-4" /> Academic Assessment
                </div>
                <h2 className="text-xl md:text-3xl font-black text-secondary leading-tight italic tracking-tighter">
                  {current.question_text}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {current.options.map((opt, i) => {
                  const isSelected = state.answers?.[current.id] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => choose(current.id, i)}
                      className={`group relative h-auto min-h-[4rem] md:min-h-[5rem] px-5 py-3 rounded-xl md:rounded-2xl border-2 flex items-center gap-4 transition-all active:scale-95 ${
                        isSelected 
                          ? "border-primary bg-primary text-white shadow-xl shadow-primary/20" 
                          : "border-orange-50 hover:border-orange-200 hover:bg-orange-50/30 text-secondary/70"
                      }`}
                    >
                      <div className={`h-8 w-8 md:h-10 md:w-10 shrink-0 rounded-lg md:rounded-xl flex items-center justify-center font-black transition-colors shadow-sm ${
                        isSelected ? "bg-white/20 text-white" : "bg-orange-50 text-primary"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="font-bold text-sm md:text-lg text-left leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center justify-between pt-6 md:pt-8 border-t border-orange-50 gap-4">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(i => i - 1)}
                  className="h-12 md:h-14 px-5 md:px-8 rounded-xl md:rounded-2xl bg-orange-50 text-primary font-black text-[10px] md:text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-orange-100 disabled:opacity-30 transition-all active:scale-95"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>

                <div className="hidden sm:flex items-center gap-2">
                  {saving && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                  <span className="text-[7px] font-black text-secondary/20 uppercase tracking-[0.2em]">Auto-Save Active</span>
                </div>

                <button
                  disabled={currentIdx === total - 1}
                  onClick={() => setCurrentIdx(i => i + 1)}
                  className="h-12 md:h-14 px-5 md:px-8 rounded-xl md:rounded-2xl bg-secondary text-white font-black text-[10px] md:text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-black shadow-lg shadow-secondary/10 disabled:opacity-30 transition-all active:scale-95"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legend / Info */}
        <div className="p-5 md:p-6 rounded-2xl md:rounded-[2.5rem] bg-teal-50/50 border border-teal-100/50 flex items-start gap-4">
          <Info className="h-5 w-5 md:h-6 md:w-6 text-teal-600 shrink-0" />
          <div className="space-y-1">
            <p className="text-[8px] md:text-[10px] font-black text-teal-900 uppercase tracking-widest">Assessment Protocol</p>
            <p className="text-[10px] md:text-xs text-teal-700/70 leading-relaxed font-medium">
              Click on an option to select it. Your answer is encrypted and saved instantly. You can jump to any question using the Quest Map. Green status indicates a saved response.
            </p>
          </div>
        </div>
      </main>

      {/* Backdrop for mobile palette */}
      {showPalette && (
        <div 
          className="fixed inset-0 bg-secondary/20 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
          onClick={() => setShowPalette(false)}
        />
      )}
    </div>
  );
}
