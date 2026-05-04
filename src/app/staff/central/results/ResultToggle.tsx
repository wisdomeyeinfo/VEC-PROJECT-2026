"use client";

import { useState, useTransition, useRef } from "react";
import { setResultsVisibility } from "./actions";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function ResultToggle({ teamId, isVisible }: { teamId: string; isVisible: boolean }) {
  const [enabled, setEnabled] = useState(isVisible);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleToggle(checked: boolean) {
    setEnabled(checked);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("team_id", teamId);
    formData.append("visible", checked ? "true" : "false");

    startTransition(async () => {
      try {
        await setResultsVisibility(formData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } catch (e: any) {
        setError(e.message);
        setEnabled(!checked); // Revert UI on failure
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <label className="relative inline-flex items-center cursor-pointer group">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={enabled}
            disabled={isPending}
            onChange={(e) => handleToggle(e.target.checked)}
          />
          <div className="w-14 h-8 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
          
          <div className="ml-3 flex items-center gap-2">
             <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${enabled ? 'text-primary' : 'text-zinc-400'}`}>
                {enabled ? 'Public' : 'Hidden'}
             </span>
             {isPending && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
             {success && <CheckCircle2 className="h-3 w-3 text-emerald-500 animate-in zoom-in duration-300" />}
          </div>
        </label>
      </div>
      
      {error && (
        <div className="flex items-center gap-1.5 text-red-500 animate-in slide-in-from-top-1 duration-300">
           <AlertCircle className="h-3 w-3 shrink-0" />
           <span className="text-[10px] font-bold leading-tight">{error}</span>
        </div>
      )}
    </div>
  );
}
