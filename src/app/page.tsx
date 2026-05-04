import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { 
  Book, 
  BookOpen, 
  Trophy, 
  ArrowRight,
  Star,
  GraduationCap,
  Users,
  Video,
  ShieldCheck,
  ChevronRight,
  ClipboardCheck,
  Award,
  Menu
} from "lucide-react";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user is an activated student
  let student = null;
  if (user) {
    try {
      const { data } = await supabase
        .from("students")
        .select("id, name, activation_code, team_id, language")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      student = data;
    } catch (e) {}
  }

  // Check if user is staff
  let isStaff = false;
  if (user) {
    try {
      const { data } = await supabase
        .from("team_members")
        .select("role")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1);
      isStaff = (data?.length ?? 0) > 0;
    } catch (e) {}
  }

  return (
    <div className="relative min-h-dvh bg-[#FCFBFA] overflow-x-hidden selection:bg-primary/30">
      {/* Background Accents */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-primary/5 rounded-full blur-[80px] md:blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-secondary/5 rounded-full blur-[80px] md:blur-[150px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Professional Header */}
      <header className="fixed top-0 z-50 w-full p-3 md:p-6">
        <div className="mx-auto max-w-7xl h-16 md:h-20 rounded-2xl md:rounded-[2rem] bg-white/80 backdrop-blur-2xl border border-orange-100 shadow-xl shadow-orange-900/5 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <GraduationCap className="h-6 w-6 md:h-7 md:w-7 text-white" />
            </div>
            <div>
              <span className="block font-black text-lg md:text-2xl text-secondary italic tracking-tighter leading-none uppercase">VEC 2026</span>
              <span className="text-[8px] md:text-[10px] font-black text-orange-400 uppercase tracking-widest">Values For All</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#about" className="text-sm font-black text-secondary/60 hover:text-primary transition-colors uppercase tracking-widest">About</a>
              <a href="#curriculum" className="text-sm font-black text-secondary/60 hover:text-primary transition-colors uppercase tracking-widest">Curriculum</a>
              <a href="#awards" className="text-sm font-black text-secondary/60 hover:text-primary transition-colors uppercase tracking-widest">Awards</a>
            </nav>
            <div className="h-6 md:h-8 w-px bg-orange-100 hidden md:block" />
            <LanguageSelector currentLang={student?.language || "en"} />
          </div>
        </div>
      </header>

      <main className="relative pt-28 md:pt-52 pb-20 md:pb-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid lg:grid-cols-12 gap-10 md:gap-16 items-center">
            {/* Hero Content */}
            <div className="lg:col-span-6 space-y-6 md:space-y-10 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                <Star className="h-3 w-3 md:h-4 md:w-4 fill-primary" /> Character Building Through Wisdom
              </div>
              
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-secondary leading-[1] tracking-tighter">
                Empowering <br className="hidden sm:block" />
                <span className="text-gradient-primary italic">The Next Gen.</span>
              </h1>
              
              <p className="text-base md:text-2xl text-secondary/60 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                The National Value Education Contest is a professional learning initiative designed to instill ethical clarity and character in students across India.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 justify-center lg:justify-start pt-4">
                {!user ? (
                  <div className="w-full sm:w-auto">
                    <Link
                      href="/student/login"
                      className="h-16 md:h-20 px-8 md:px-12 rounded-2xl md:rounded-3xl bg-primary text-white font-black text-lg md:text-xl shadow-2xl shadow-primary/25 transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-4 group"
                    >
                      Student Login
                      <ArrowRight className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-2 transition-transform" />
                    </Link>
                    <div className="mt-4 flex items-center justify-center lg:justify-start gap-2 text-[8px] md:text-[10px] font-black text-orange-300 uppercase tracking-widest">
                       <ShieldCheck className="h-3 w-3 md:h-4 md:w-4" /> Official Exam Portal
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start w-full sm:w-auto">
                    {student ? (
                      <Link
                        href="/student"
                        className="h-16 md:h-20 px-8 md:px-12 rounded-2xl md:rounded-3xl bg-secondary text-white font-black text-lg md:text-xl shadow-2xl shadow-secondary/20 transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-4 group w-full sm:w-auto"
                      >
                        Enter Dashboard
                        <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-primary group-hover:translate-x-2 transition-transform" />
                      </Link>
                    ) : (
                      <Link
                        href="/student/activate"
                        className="h-16 md:h-20 px-8 md:px-12 rounded-2xl md:rounded-3xl bg-primary text-white font-black text-lg md:text-xl shadow-2xl shadow-primary/25 transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-4 group w-full sm:w-auto"
                      >
                        Activate Kit
                        <ArrowRight className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-2 transition-transform" />
                      </Link>
                    )}
                    
                    {isStaff && (
                      <Link
                        href="/staff"
                        className="h-16 md:h-20 px-8 md:px-10 rounded-2xl md:rounded-3xl bg-white border-2 border-orange-100 text-secondary font-black text-base md:text-lg transition-all hover:border-secondary flex items-center justify-center gap-3 w-full sm:w-auto"
                      >
                        Staff Admin
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Hero Visualization */}
            <div className="lg:col-span-6 relative mt-10 lg:mt-0">
               <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 via-secondary/10 to-orange-200/10 rounded-3xl md:rounded-[4rem] blur-2xl opacity-50" />
               <div className="relative aspect-[4/3] rounded-3xl md:rounded-[4rem] bg-white border border-orange-100 shadow-3xl overflow-hidden group">
                  <Image 
                    src="/assets/hero_kids.png" 
                    alt="Educational Excellence" 
                    fill 
                    className="object-contain p-6 md:p-12 transition-transform duration-1000 group-hover:scale-105"
                  />
                  
                  {/* Floating Stats - Hidden on tiny screens, visible above sm */}
                  <div className="hidden sm:flex absolute top-6 md:top-10 right-6 md:right-10 p-4 md:p-6 rounded-2xl md:rounded-[2rem] glass shadow-2xl flex-col items-center gap-1 md:gap-2 animate-float">
                    <Users className="h-6 w-6 md:h-10 md:w-10 text-primary" />
                    <span className="font-black text-secondary italic text-sm md:text-base">2.5M+</span>
                    <span className="text-[8px] md:text-[10px] font-black text-secondary/40 uppercase">Enrolled</span>
                  </div>

                  <div className="hidden sm:flex absolute bottom-6 md:bottom-10 left-6 md:left-10 p-3 md:p-5 rounded-2xl md:rounded-[2rem] glass-dark shadow-2xl items-center gap-3 md:gap-4 animate-float" style={{ animationDelay: '2s' }}>
                    <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-primary flex items-center justify-center">
                       <Video className="h-4 w-4 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                       <span className="block font-black text-white text-[10px] md:text-sm leading-none">Online Lectures</span>
                       <span className="text-[8px] md:text-[10px] font-black text-white/40 uppercase">Academic Support</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Institutional Stats */}
          <div className="mt-20 md:mt-32 p-6 md:p-10 rounded-3xl md:rounded-[4rem] bg-secondary flex flex-col md:flex-row flex-wrap justify-center md:justify-around gap-8 md:gap-12 relative overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-primary/5 opacity-50" />
             {[
               { val: "15,000+", label: "Partner Schools", icon: GraduationCap },
               { val: "50+", label: "Certified Modules", icon: BookOpen },
               { val: "National", label: "Level Certification", icon: Award }
             ].map((stat, i) => (
               <div key={i} className="relative z-10 text-center space-y-1 md:space-y-2">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2 md:mb-4">
                     <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div className="text-2xl md:text-4xl font-black text-white italic tracking-tighter">{stat.val}</div>
                  <div className="text-[8px] md:text-[10px] font-black text-orange-400 uppercase tracking-widest">{stat.label}</div>
               </div>
             ))}
          </div>

          {/* Academic Journey */}
          <section id="curriculum" className="mt-24 md:mt-40 space-y-12 md:space-y-20">
             <div className="text-center space-y-3 md:space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-secondary tracking-tighter italic px-4">Professional <br className="sm:hidden" /><span className="text-primary">Learning Path</span></h2>
                <p className="text-secondary/60 font-medium text-base md:text-lg max-w-xl mx-auto px-4">A structured approach to value-based education and character development.</p>
             </div>

             <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 px-4 md:px-0">
                {[
                  { step: "01", icon: Users, title: "Registration", desc: "Official enrollment through school or individual portal." },
                  { step: "02", icon: ShieldCheck, title: "Activation", desc: "Unlock comprehensive study material and video modules." },
                  { step: "03", icon: BookOpen, title: "Study Phase", desc: "Engage with literature, webinars, and self-study modules." },
                  { step: "04", icon: ClipboardCheck, title: "Examination", desc: "Complete the national assessment for certification." }
                ].map((item, i) => (
                  <div key={i} className="relative space-y-4 md:space-y-6 group">
                     <div className="text-5xl md:text-7xl font-black text-orange-50 group-hover:text-primary/10 transition-colors absolute -top-4 md:-top-8 -left-2 md:-left-4 -z-10">{item.step}</div>
                     <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl md:rounded-[1.5rem] bg-white shadow-xl border border-orange-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        <item.icon className="h-6 w-6 md:h-8 md:w-8" />
                     </div>
                     <div className="space-y-1 md:space-y-2">
                        <h3 className="text-lg md:text-xl font-black text-secondary">{item.title}</h3>
                        <p className="text-sm text-secondary/60 font-medium leading-relaxed">{item.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-orange-100 py-12 md:py-20 bg-white relative overflow-hidden px-4 md:px-0">
         <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shadow-lg">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="font-black text-xl text-secondary italic">VEC 2026</span>
            </div>
            <div className="text-secondary/40 text-[10px] md:text-xs font-bold uppercase tracking-widest text-center max-w-[200px] md:max-w-none">
              © 2026 National Value Education Contest • An ISKCON Initiative
            </div>
            <div className="flex gap-4 md:gap-6 flex-wrap justify-center">
               {["About Us", "Contact", "Terms"].map(s => (
                 <a key={s} href="#" className="text-secondary/30 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest">{s}</a>
               ))}
            </div>
         </div>
         {/* Decoration */}
         <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-orange-400 to-secondary opacity-50" />
      </footer>
    </div>
  );
}
