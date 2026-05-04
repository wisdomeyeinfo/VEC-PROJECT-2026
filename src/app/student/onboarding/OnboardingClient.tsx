"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { completeOnboarding } from "../login/actions";
import { LANGUAGE_OPTIONS } from "@/lib/lang";
import { 
  ShieldCheck, 
  School, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Loader2,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  BookOpen,
  Globe,
  Users,
  AlertCircle
} from "lucide-react";

interface Props {
  initialData: any;
  availableLocations: { state: string; district: string }[];
  availableSchools: { id: string; name: string; district: string; state: string }[];
}


const STANDARDS = Array.from({ length: 10 }, (_, i) => i + 3); // 3 to 12

export function OnboardingClient({ initialData, availableLocations, availableSchools }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  // Form State
  const [formDataState, setFormDataState] = useState({
    name: initialData?.name || "",
    gender: initialData?.gender || "",
    email: initialData?.email || "",
    newPassword: "",
    schoolName: initialData?.school_name || "",
    schoolId: initialData?.school_id || "",
    state: initialData?.state || "",
    district: initialData?.district || "",
    standard: initialData?.class || "",
    division: initialData?.division || "",
    mobile: initialData?.mobile || "",
    language: initialData?.language || "",
  });

  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Derive unique states and districts
  const states = useMemo(() => Array.from(new Set(availableLocations.map(l => l.state).filter(Boolean))).sort(), [availableLocations]);
  
  const districts = useMemo(() => {
    const currentState = (formDataState.state || "").toLowerCase();
    if (!currentState) return [];
    return Array.from(new Set(
      availableLocations
        .filter(l => (l.state || "").toLowerCase() === currentState)
        .map(l => l.district)
        .filter(Boolean)
    )).sort();
  }, [formDataState.state, availableLocations]);

  const filteredSchools = useMemo(() => {
    const currentDistrict = (formDataState.district || "").toLowerCase();
    const currentState = (formDataState.state || "").toLowerCase();
    if (!currentDistrict || !currentState) return [];
    
    return availableSchools
      .filter(s => 
        (s.district || "").toLowerCase() === currentDistrict && 
        (s.state || "").toLowerCase() === currentState
      )
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [formDataState.district, formDataState.state, availableSchools]);

  // Real-time password validation
  useEffect(() => {
    if (formDataState.newPassword && formDataState.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
    } else {
      setPasswordError(null);
    }
  }, [formDataState.newPassword]);

  const updateField = (name: string, value: string) => {
    setFormDataState(prev => {
      const newState = { ...prev, [name]: value };
      // Reset dependent fields
      if (name === "state") {
        newState.district = "";
        newState.schoolId = "";
        newState.schoolName = "";
      }
      if (name === "district") {
        newState.schoolId = "";
        newState.schoolName = "";
      }
      if (name === "schoolId") {
        if (value === "Other") {
          newState.schoolName = "Other";
        } else {
          const s = availableSchools.find(sch => sch.id === value);
          newState.schoolName = s ? s.name : "";
        }
      }
      return newState;
    });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (passwordError) return;

    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await completeOnboarding(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  const isStep1Valid = formDataState.name && formDataState.gender && formDataState.email && formDataState.newPassword.length >= 6;
  const isStep2Valid = formDataState.schoolName && formDataState.state && formDataState.district;

  return (
    <div className="w-full max-w-2xl bg-white rounded-[3rem] border border-zinc-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-700">
      <div className="bg-zinc-900 p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="h-32 w-32" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest">
            Step {step} of 3
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Complete Your <br /><span className="text-orange-500 italic">Profile</span></h1>
          <p className="text-zinc-400 font-medium max-w-xs">Required for your official VEC 2026 Certificate.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-10 space-y-8">
        {/* Step 1: Identity & Security */}
        <div className={step === 1 ? "space-y-6 animate-in slide-in-from-right-8 duration-500" : "hidden"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <User className="h-3 w-3" /> Full Name
              </label>
              <input
                name="name"
                value={formDataState.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Student's Name"
                required
                className="block w-full h-14 px-4 rounded-xl border-2 border-zinc-100 bg-zinc-50/50 font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
              />
              <p className="text-[10px] text-orange-600 font-bold italic">* This name will be printed on your certificate</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Users className="h-3 w-3" /> Gender
              </label>
              <select
                name="gender"
                value={formDataState.gender}
                onChange={(e) => updateField("gender", e.target.value)}
                required
                className="block w-full h-14 px-4 rounded-xl border-2 border-zinc-100 bg-zinc-50/50 font-bold focus:bg-white focus:border-orange-500 transition-all outline-none appearance-none"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Mail className="h-3 w-3" /> Email Address
            </label>
            <input
              name="email"
              type="email"
              value={formDataState.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="For login & recovery"
              required
              className="block w-full h-14 px-4 rounded-xl border-2 border-zinc-100 bg-zinc-50/50 font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Lock className="h-3 w-3" /> Set New Password
            </label>
            <div className="relative group">
              <input
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={formDataState.newPassword}
                onChange={(e) => updateField("newPassword", e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className={`block w-full h-14 pl-4 pr-12 rounded-xl border-2 bg-zinc-50/50 font-bold focus:bg-white transition-all outline-none ${passwordError ? 'border-red-300 focus:border-red-500' : 'border-zinc-100 focus:border-orange-500'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {passwordError}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => isStep1Valid && setStep(2)}
            disabled={!isStep1Valid}
            className="w-full h-16 flex items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 font-black text-lg hover:bg-zinc-200 transition-all group disabled:opacity-50"
          >
            Academic Details
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Step 2: School & Location */}
        <div className={step === 2 ? "space-y-6 animate-in slide-in-from-right-8 duration-500" : "hidden"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Globe className="h-3 w-3" /> State
              </label>
              <select
                name="state"
                value={formDataState.state}
                onChange={(e) => updateField("state", e.target.value)}
                required
                className="block w-full h-14 px-4 rounded-xl border-2 border-zinc-100 bg-zinc-50/50 font-bold focus:bg-white focus:border-orange-500 transition-all outline-none appearance-none"
              >
                <option value="">Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="h-3 w-3" /> District
              </label>
              <select
                name="district"
                value={formDataState.district}
                onChange={(e) => updateField("district", e.target.value)}
                disabled={!formDataState.state}
                required
                className="block w-full h-14 px-4 rounded-xl border-2 border-zinc-100 bg-zinc-50/50 font-bold focus:bg-white focus:border-orange-500 transition-all outline-none appearance-none disabled:opacity-50"
              >
                <option value="">Select District</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <School className="h-3 w-3" /> School Name
            </label>
            <select
              name="schoolId"
              value={formDataState.schoolId}
              onChange={(e) => updateField("schoolId", e.target.value)}
              disabled={!formDataState.district}
              required
              className="block w-full h-14 px-4 rounded-xl border-2 border-zinc-100 bg-zinc-50/50 font-bold focus:bg-white focus:border-orange-500 transition-all outline-none appearance-none disabled:opacity-50"
            >
              <option value="">Select Your School</option>
              {filteredSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              <option value="Other">Other / Not Listed</option>
            </select>
            <input type="hidden" name="schoolName" value={formDataState.schoolName} />
            {formDataState.schoolName === "Other" && (
              <input 
                name="schoolNameOther"
                placeholder="Type your School Name"
                required
                className="mt-2 block w-full h-14 px-4 rounded-xl border-2 border-zinc-100 bg-zinc-50/50 font-bold focus:bg-white focus:border-orange-500 transition-all outline-none animate-in slide-in-from-top-2"
              />
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-16 px-6 rounded-2xl border-2 border-zinc-100 text-zinc-500 font-black text-sm uppercase tracking-widest hover:bg-zinc-50 transition-all"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => isStep2Valid && setStep(3)}
              disabled={!isStep2Valid}
              className="flex-1 h-16 flex items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900 font-black text-lg hover:bg-zinc-200 transition-all group disabled:opacity-50"
            >
              Final Step
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Step 3: Class & Language */}
        <div className={step === 3 ? "space-y-6 animate-in slide-in-from-right-8 duration-500" : "hidden"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="h-3 w-3" /> Standard
              </label>
              <select
                name="standard"
                value={formDataState.standard}
                onChange={(e) => updateField("standard", e.target.value)}
                required
                className="block w-full h-14 px-4 rounded-xl border-2 border-zinc-100 bg-zinc-50/50 font-bold focus:bg-white focus:border-orange-500 transition-all outline-none appearance-none"
              >
                <option value="">Select Standard</option>
                {STANDARDS.map(s => (
                  <option key={s} value={s}>{s}th Standard</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Users className="h-3 w-3" /> Division
              </label>
              <input
                name="division"
                value={formDataState.division}
                onChange={(e) => updateField("division", e.target.value)}
                placeholder="e.g. A"
                className="block w-full h-14 px-4 rounded-xl border-2 border-zinc-100 bg-zinc-50/50 font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Phone className="h-3 w-3" /> Mobile Number
              </label>
              <input
                name="mobile"
                type="tel"
                value={formDataState.mobile}
                onChange={(e) => updateField("mobile", e.target.value)}
                placeholder="10-digit number"
                className="block w-full h-14 px-4 rounded-xl border-2 border-zinc-100 bg-zinc-50/50 font-bold focus:bg-white focus:border-orange-500 transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Globe className="h-3 w-3" /> Exam Language
              </label>
              <select
                name="language"
                value={formDataState.language}
                onChange={(e) => updateField("language", e.target.value)}
                required
                className="block w-full h-14 px-4 rounded-xl border-2 border-zinc-100 bg-zinc-50/50 font-bold focus:bg-white focus:border-orange-500 transition-all outline-none appearance-none"
              >
                <option value="">Select Language</option>
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold flex items-center gap-2 animate-in zoom-in-95">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-16 px-6 rounded-2xl border-2 border-zinc-100 text-zinc-500 font-black text-sm uppercase tracking-widest hover:bg-zinc-50 transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isPending || !!passwordError}
              className="flex-1 h-16 flex items-center justify-center rounded-2xl bg-orange-600 text-white font-black text-xl shadow-xl shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 overflow-hidden group"
            >
              {isPending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-2 relative z-10">
                  Submit Profile <CheckCircle2 className="h-6 w-6" />
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
