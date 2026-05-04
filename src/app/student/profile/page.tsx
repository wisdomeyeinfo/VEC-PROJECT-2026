import { getStudentSession } from "@/lib/student/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Users, 
  School, 
  Hash, 
  Phone, 
  Sparkles, 
  Save,
  ShieldCheck,
  ChevronRight,
  Heart
} from "lucide-react";
import { updateStudentProfile } from "./actions";

export default async function StudentProfilePage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const admin = createSupabaseAdminClient();
  const { data: student } = await admin
    .from("students")
    .select("*")
    .eq("id", session.student_id)
    .single();

  if (!student) redirect("/student");

  return (
    <div className="relative min-h-dvh bg-[#FCFBFA] selection:bg-primary/30 pb-32">
      {/* Immersive Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Modern Sticky Header */}
      <header className="sticky top-0 z-50 w-full glass border-b border-white/40">
        <div className="mx-auto max-w-2xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/student" 
              className="h-12 w-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
               <span className="block font-black text-xl text-zinc-900 tracking-tighter italic leading-none">Your Identity</span>
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Profile Management</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
             <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-6 pt-16 space-y-12">
        {/* Profile Identity Card */}
        <section className="text-center space-y-6">
          <div className="relative inline-block group">
             <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <div className="relative h-32 w-32 rounded-[3rem] bg-white border-4 border-white shadow-3xl flex items-center justify-center mx-auto overflow-hidden">
                <div className="h-full w-full bg-gradient-to-br from-primary via-orange-500 to-secondary flex items-center justify-center">
                   <User className="h-16 w-16 text-white" />
                </div>
             </div>
             <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-white shadow-xl flex items-center justify-center border-2 border-zinc-50">
                <Sparkles className="h-5 w-5 text-primary animate-pulse-soft" />
             </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-zinc-900 tracking-tighter italic leading-none">Hello, <span className="text-primary">{student.name.split(' ')[0]}!</span></h1>
            <p className="text-zinc-500 font-medium text-lg">Update your details to keep your wisdom records accurate.</p>
          </div>
        </section>

        <form action={updateStudentProfile} className="space-y-10">
          <div className="grid gap-8 p-10 rounded-[4rem] bg-white border border-zinc-100 shadow-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
               <Heart className="h-40 w-40 text-primary" />
            </div>

            {/* Full Name */}
            <div className="space-y-3 relative z-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                <User className="h-3 w-3" /> Full Name
              </label>
              <input
                name="name"
                defaultValue={student.name}
                required
                className="w-full h-16 px-8 rounded-3xl bg-zinc-50 border-none focus:ring-2 focus:ring-primary outline-none font-black text-xl text-zinc-800 transition-all shadow-inner"
                placeholder="Enter your full name"
              />
            </div>

            {/* Gender Selection */}
            <div className="space-y-3 relative z-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                <Users className="h-3 w-3" /> Choose Avatar
              </label>
              <div className="flex gap-6">
                {['Boy', 'Girl'].map((g) => (
                  <label key={g} className="flex-1">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      defaultChecked={student.gender === g}
                      className="sr-only peer"
                    />
                    <div className="h-16 flex items-center justify-center rounded-3xl bg-zinc-50 border-2 border-transparent peer-checked:border-primary peer-checked:bg-white font-black text-lg text-zinc-400 peer-checked:text-primary transition-all cursor-pointer shadow-sm active:scale-95 group/btn">
                       {g === 'Boy' ? '👦 Boy' : '👧 Girl'}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Class & Division */}
            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                  <Hash className="h-3 w-3" /> Class
                </label>
                <input
                  name="class"
                  defaultValue={student.class || ""}
                  className="w-full h-16 px-8 rounded-3xl bg-zinc-50 border-none focus:ring-2 focus:ring-primary outline-none font-black text-xl text-zinc-800 transition-all shadow-inner"
                  placeholder="e.g. 8th"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                  <Hash className="h-3 w-3" /> Division
                </label>
                <input
                  name="division"
                  defaultValue={student.division || ""}
                  className="w-full h-16 px-8 rounded-3xl bg-zinc-50 border-none focus:ring-2 focus:ring-primary outline-none font-black text-xl text-zinc-800 transition-all shadow-inner"
                  placeholder="e.g. A"
                />
              </div>
            </div>

            {/* School Name */}
            <div className="space-y-3 relative z-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                <School className="h-3 w-3" /> School Name
              </label>
              <input
                name="school_name"
                defaultValue={student.school_name || student.custom_school_name || ""}
                className="w-full h-16 px-8 rounded-3xl bg-zinc-50 border-none focus:ring-2 focus:ring-primary outline-none font-black text-xl text-zinc-800 transition-all shadow-inner"
                placeholder="Update your school name"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-3 relative z-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                <Phone className="h-3 w-3" /> Parent's Mobile
              </label>
              <input
                name="mobile"
                defaultValue={student.mobile || ""}
                className="w-full h-16 px-8 rounded-3xl bg-zinc-50 border-none focus:ring-2 focus:ring-primary outline-none font-black text-xl text-zinc-800 transition-all shadow-inner"
                placeholder="Contact for certificates"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-20 rounded-[2.5rem] bg-zinc-900 text-white font-black text-2xl shadow-3xl transition-all hover:bg-black hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-orange-500 to-secondary opacity-0 group-hover:opacity-10 transition-opacity" />
            <Save className="h-8 w-8 text-primary group-hover:scale-125 transition-transform" /> Save My Updates
          </button>
        </form>

        {/* Security Note */}
        <div className="p-10 rounded-[3rem] bg-primary/5 border-2 border-dashed border-primary/20 flex flex-col md:flex-row items-center gap-8 group">
           <div className="h-20 w-20 rounded-3xl bg-white shadow-xl flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
              <ShieldCheck className="h-10 w-10 text-primary" />
           </div>
           <div className="space-y-1 text-center md:text-left">
              <h3 className="font-black text-primary uppercase tracking-widest text-xs">Security Advisory</h3>
              <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                Your activation code <span className="font-black text-zinc-900">({student.activation_code})</span> is permanently linked to this account. Ensure your name matches your school ID for the official certificates.
              </p>
           </div>
        </div>
      </main>

      {/* Decorative Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-orange-500 to-accent opacity-50" />
    </div>
  );
}
