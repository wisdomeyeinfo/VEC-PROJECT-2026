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
      
      // Auto-jump to first unanswered question
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

  // Track visited questions
  useEffect(() => {
    if (state?.enabled && state.questions?.[currentIdx]) {
      setVisited(prev => new Set(prev).add(state.questions[currentIdx].id));
    }
  }, [currentIdx, state]);

  // Tick down remaining time
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
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Loading Professional Exam Interface...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border-2 border-red-100 bg-red-50 p-8 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="font-black text-red-900 text-xl">System Error</h2>
        <p className="text-red-700 text-sm font-medium">{error}</p>
        <button onClick={load} className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/20">Reload</button>
      </div>
    );
  }

  if (!state) return null;

  if (!state.enabled) {
    return (
      <div className="rounded-[2.5rem] bg-white p-12 text-center space-y-6 shadow-xl border border-zinc-100">
        <Trophy className="h-16 w-16 text-orange-600 mx-auto" />
        <h2 className="text-3xl font-black text-zinc-900">Exam Unavailable</h2>
        <p className="text-zinc-500 font-medium">{state.reason}</p>
        <Link href="/student" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-zinc-900 text-white font-black text-lg">
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
      <div className="rounded-[3rem] bg-zinc-900 p-12 text-center space-y-8 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-orange-500 to-accent" />
        <CheckCircle2 className="h-20 w-20 text-primary mx-auto animate-bounce-subtle" />
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white">Submission Successful!</h2>
          <p className="text-zinc-400 text-lg">Your exam has been recorded. Good luck with the results!</p>
        </div>
        <Link href="/student" className="inline-flex items-center gap-2 px-10 py-5 rounded-[2rem] bg-primary text-white font-black text-xl">
          <Home className="h-6 w-6" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto items-start relative pb-32 lg:pb-0">
      
      {/* Question Palette Drawer (Mobile) / Sidebar (Desktop) */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none lg:border lg:border-zinc-100 lg:rounded-[2.5rem] lg:w-96 flex flex-col ${showPalette ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <span className="font-black text-zinc-800 uppercase tracking-tighter">Question Palette</span>
          </div>
          <button onClick={() => setShowPalette(false)} className="lg:hidden p-2 text-zinc-400 hover:text-red-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-green-50 border border-green-100">
              <p className="text-[10px] font-black text-green-600 uppercase">Answered</p>
              <p className="text-xl font-black text-green-900">{answeredCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100">
              <p className="text-[10px] font-black text-orange-600 uppercase">Skipped</p>
              <p className="text-xl font-black text-orange-900">{Math.max(0, skippedCount)}</p>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
              <p className="text-[10px] font-black text-zinc-400 uppercase">Not Visited</p>
              <p className="text-xl font-black text-zinc-900">{total - visited.size}</p>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <p className="text-[10px] font-black text-primary uppercase">Total</p>
              <p className="text-xl font-black text-primary">{total}</p>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2">
            {(state.questions || []).map((q, i) => {
              const isCurrent = currentIdx === i;
              const isAnswered = !!state.answers?.[q.id];
              const isVisited = visited.has(q.id);

              let statusColor = "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-300";
              if (isAnswered) statusColor = "bg-green-500 border-green-600 text-white shadow-md shadow-green-200";
              else if (isVisited) statusColor = "bg-orange-500 border-orange-600 text-white shadow-md shadow-orange-200";
              if (isCurrent) statusColor = "bg-primary border-primary text-white shadow-xl shadow-primary/30 ring-4 ring-primary/20";

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIdx(i);
                    if (window.innerWidth < 1024) setShowPalette(false);
                  }}
                  className={`h-10 w-full rounded-xl border-2 flex items-center justify-center font-black text-sm transition-all active:scale-90 ${statusColor}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 border-t border-zinc-100">
          <button
            onClick={submit}
            disabled={saving}
            className="w-full h-14 rounded-2xl bg-zinc-900 text-white font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            <Send className="h-5 w-5" /> Submit Exam
          </button>
        </div>
      </aside>

      {/* Main Examination Area */}
      <main className="flex-1 space-y-6 w-full">
        {/* Sticky Header with Timer */}
        <div className="sticky top-20 z-30 flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowPalette(true)}
              className="lg:hidden p-3 rounded-xl bg-primary text-white shadow-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Contest Mode</span>
              <span className="font-black text-zinc-800">Question {currentIdx + 1} of {total}</span>
            </div>
          </div>

          <div className={`flex items-center gap-3 px-6 py-2 rounded-2xl border-2 transition-colors ${remainingTime.isLow ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-white border-zinc-100'}`}>
            <Timer className={`h-5 w-5 ${remainingTime.isLow ? 'text-red-600' : 'text-primary'}`} />
            <span className={`font-mono font-black text-xl ${remainingTime.isLow ? 'text-red-600' : 'text-zinc-800'}`}>
              {remainingTime.h}:{remainingTime.m}:{remainingTime.s}
            </span>
          </div>
        </div>

        {/* Question Display Card */}
        {current && (
          <div className="relative animate-in slide-in-from-right-4 duration-300">
            <div className="p-8 md:p-12 rounded-[3rem] bg-white border border-zinc-100 shadow-2xl space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                  <HelpCircle className="h-4 w-4" /> Professional Evaluation
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-zinc-900 leading-tight">
                  {current.question_text}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {current.options.map((opt, i) => {
                  const isSelected = state.answers?.[current.id] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => choose(current.id, i)}
                      className={`group relative h-20 px-6 rounded-2xl border-2 flex items-center gap-4 transition-all active:scale-95 ${
                        isSelected 
                          ? "border-primary bg-primary text-white shadow-xl shadow-primary/20" 
                          : "border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-black transition-colors ${
                        isSelected ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="font-bold text-lg text-left line-clamp-2">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center justify-between pt-8 border-t border-zinc-100">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(i => i - 1)}
                  className="h-14 px-8 rounded-2xl bg-zinc-100 text-zinc-500 font-black text-sm flex items-center gap-2 hover:bg-zinc-200 disabled:opacity-30 transition-all active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" /> Previous
                </button>

                <div className="flex items-center gap-2">
                  {saving && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
                  <span className="hidden md:inline text-[10px] font-black text-zinc-300 uppercase tracking-widest">Auto-Saving enabled</span>
                </div>

                <button
                  disabled={currentIdx === total - 1}
                  onClick={() => setCurrentIdx(i => i + 1)}
                  className="h-14 px-8 rounded-2xl bg-zinc-900 text-white font-black text-sm flex items-center gap-2 hover:bg-black disabled:opacity-30 transition-all active:scale-95"
                >
                  Next Question <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legend / Info */}
        <div className="p-6 rounded-[2rem] bg-blue-50 border border-blue-100 flex items-start gap-4">
          <Info className="h-6 w-6 text-blue-500 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-black text-blue-900 uppercase tracking-widest">Exam Instructions</p>
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              Click on an option to select it. Your answer is saved instantly. You can jump to any question using the side palette. Green numbers are answered, Orange are visited but skipped.
            </p>
          </div>
        </div>
      </main>

      {/* Backdrop for mobile palette */}
      {showPalette && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowPalette(false)}
        />
      )}
    </div>
  );
}
