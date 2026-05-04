"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { redeemActivationCode } from "./actions";
import { 
  Hash, 
  MapPin, 
  School, 
  User, 
  GraduationCap, 
  Languages, 
  Phone,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users
} from "lucide-react";

type SchoolOption = { id: string; name: string; district: string };
type CodeStatus = "loading" | "idle" | "unused" | "redeemed" | "revoked" | "invalid";

export function ActivateForm() {
  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [activationCode, setActivationCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<CodeStatus>("idle");
  
  const [district, setDistrict] = useState("");
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  const normalizedCode = useMemo(() => activationCode.trim().toUpperCase(), [activationCode]);

  // Check code status
  useEffect(() => {
    if (normalizedCode.length < 4) {
      setCodeStatus("idle");
      return;
    }

    const checkCode = async () => {
      setCodeStatus("loading");
      try {
        const res = await fetch(`/api/student/check-code?code=${normalizedCode}`);
        const data = await res.json();
        setCodeStatus(data.status);
      } catch (e) {
        setCodeStatus("idle");
      }
    };

    const timeout = setTimeout(checkCode, 500);
    return () => clearTimeout(timeout);
  }, [normalizedCode]);

  // Load schools when district changes
  useEffect(() => {
    async function loadSchools() {
      if (codeStatus !== "unused" || district.trim().length < 2) {
        setSchools([]);
        return;
      }

      setSchoolsLoading(true);
      try {
        const params = new URLSearchParams({ code: normalizedCode, district: district.trim() });
        const res = await fetch(`/api/student/schools?${params.toString()}`);
        const body = await res.json();
        setSchools(body.schools || []);
      } catch (e) {
        // ignore
      } finally {
        setSchoolsLoading(false);
      }
    }

    const timeoutId = setTimeout(loadSchools, 500);
    return () => clearTimeout(timeoutId);
  }, [normalizedCode, district, codeStatus]);

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          setSubmitError(null);
          try {
            await redeemActivationCode(formData);
          } catch (e: any) {
            setSubmitError(e.message || "Activation failed. Please try again.");
          }
        });
      }}
      className="space-y-6"
    >
      {/* Code Input */}
      <div className="space-y-2">
        <label className="text-sm font-black text-secondary flex items-center gap-2">
          <Hash className="h-4 w-4 text-primary" />
          Enrollment / Kit Code
        </label>
        <div className="relative">
          <input
            className={`w-full h-14 rounded-2xl border-2 px-4 text-lg font-bold outline-none transition-all placeholder:font-medium uppercase
              ${codeStatus === 'invalid' ? 'border-red-200 bg-red-50 focus:border-red-400' : 
                codeStatus === 'redeemed' ? 'border-green-200 bg-green-50 focus:border-green-400' : 
                'border-orange-100 bg-orange-50/30 focus:border-primary focus:bg-white text-secondary'}`}
            name="activation_code"
            value={activationCode}
            onChange={(e) => setActivationCode(e.target.value)}
            placeholder="VEC-XXXX-XXXX"
            required
          />
          <div className="absolute right-4 top-4">
            {codeStatus === 'loading' && <Loader2 className="h-6 w-6 animate-spin text-orange-400" />}
            {codeStatus === 'redeemed' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
            {codeStatus === 'invalid' && <AlertCircle className="h-6 w-6 text-red-500" />}
          </div>
        </div>
        
        {codeStatus === 'redeemed' && (
          <p className="text-xs font-bold text-green-600 px-1 animate-in fade-in slide-in-from-top-1">
            This enrollment is already registered! Link it to your account to continue.
          </p>
        )}
        {codeStatus === 'invalid' && (
          <p className="text-xs font-bold text-red-600 px-1">
            Invalid enrollment code. Please verify your kit.
          </p>
        )}
      </div>

      {/* Dynamic Fields for UNUSED codes */}
      {codeStatus === "unused" && (
        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-sm font-black text-primary">Verification Successful!</p>
            <p className="text-xs text-secondary/60">Complete your official registration to begin the modules.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-black text-secondary flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> District
              </label>
              <input
                className="w-full h-12 rounded-xl border-2 border-orange-50 bg-orange-50/30 px-4 font-semibold outline-none focus:border-primary focus:bg-white text-secondary"
                name="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Pune"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-secondary flex items-center gap-2">
                <School className="h-4 w-4 text-primary" /> Institution
              </label>
              <div className="relative">
                <select
                  className="w-full h-12 rounded-xl border-2 border-orange-50 bg-orange-50/30 px-4 font-semibold outline-none appearance-none disabled:opacity-50 text-secondary"
                  name="school_id"
                  id="school_id"
                  disabled={schoolsLoading || schools.length === 0}
                  defaultValue=""
                  onChange={(e) => {
                    const otherField = document.getElementById('custom_school_container');
                    if (e.target.value === 'other' || schools.length === 0) {
                      otherField?.classList.remove('hidden');
                    } else {
                      otherField?.classList.add('hidden');
                    }
                  }}
                >
                  <option value="">{schoolsLoading ? "Loading..." : schools.length ? "Select Institution" : "Institution not found"}</option>
                  {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  <option value="other">+ Institution not listed</option>
                </select>
                {schoolsLoading && <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-orange-400" />}
              </div>
            </div>
          </div>

          {/* Custom School Name (Hidden by default) */}
          <div id="custom_school_container" className="space-y-2 hidden animate-in fade-in slide-in-from-top-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-secondary/30 ml-1">Other Institution Name</label>
            <input
              className="w-full h-12 rounded-xl border-2 border-orange-50 bg-orange-50/30 px-4 font-semibold outline-none focus:border-primary focus:bg-white transition-all text-secondary"
              name="custom_school_name"
              placeholder="Type institution name here"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-black text-secondary flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Full Name
              </label>
              <input
                className="w-full h-12 rounded-xl border-2 border-orange-50 bg-orange-50/30 px-4 font-semibold outline-none focus:border-primary focus:bg-white text-secondary"
                name="name"
                placeholder="Student Name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-secondary flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Gender
              </label>
              <div className="flex gap-2">
                {['Male', 'Female'].map((g) => (
                  <label key={g} className="flex-1">
                    <input type="radio" name="gender" value={g} className="sr-only peer" required />
                    <div className="h-12 flex items-center justify-center rounded-xl bg-orange-50/30 border-2 border-transparent peer-checked:border-primary peer-checked:bg-white font-black text-secondary/40 peer-checked:text-primary transition-all cursor-pointer text-sm">
                      {g}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-black text-secondary flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" /> Class
              </label>
              <input
                className="w-full h-12 rounded-xl border-2 border-orange-50 bg-orange-50/30 px-4 font-semibold outline-none focus:border-primary focus:bg-white text-secondary"
                name="class"
                placeholder="e.g. 9"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-secondary flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" /> Div / Section
              </label>
              <input
                className="w-full h-12 rounded-xl border-2 border-orange-50 bg-orange-50/30 px-4 font-semibold outline-none focus:border-primary focus:bg-white text-secondary"
                name="division"
                placeholder="e.g. A"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-black text-secondary flex items-center gap-2">
                <Languages className="h-4 w-4 text-primary" /> Study Language
              </label>
              <select
                className="w-full h-12 rounded-xl border-2 border-orange-50 bg-orange-50/30 px-4 font-semibold outline-none text-secondary"
                name="language"
                required
                defaultValue=""
              >
                <option value="" disabled>Select language</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
                <option value="bn">Bengali</option>
                <option value="gu">Gujarati</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-secondary flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> Mobile Number
              </label>
              <input
                className="w-full h-12 rounded-xl border-2 border-orange-50 bg-orange-50/30 px-4 font-semibold outline-none text-secondary"
                name="mobile"
                placeholder="Optional"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-600 font-bold">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={pending || codeStatus === "loading" || codeStatus === "invalid" || codeStatus === "idle"}
        className={`w-full h-14 rounded-2xl font-black text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest
          ${codeStatus === 'redeemed' ? 'bg-green-600 text-white shadow-green-600/25' : 'bg-primary text-white shadow-primary/25'}`}
      >
        {pending ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <>
            {codeStatus === 'redeemed' ? 'Register and Continue' : 'Activate Enrollment'}
            <ArrowRight className="h-6 w-6" />
          </>
        )}
      </button>
    </form>
  );
}
