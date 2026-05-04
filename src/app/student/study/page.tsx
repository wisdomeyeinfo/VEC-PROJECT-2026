import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStudentSession } from "@/lib/student/session";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { MaterialCard } from "./MaterialCard";
import { 
  ArrowLeft, 
  GraduationCap, 
  Library,
  BookOpen,
  Filter,
  ClipboardList,
  Award,
  ArrowRight
} from "lucide-react";

export default async function StudentStudyPage() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  const admin = createSupabaseAdminClient();
  
  let materials: any[] = [];
  try {
    const { data } = await admin
      .from("study_materials")
      .select("*")
      .eq("language", session.language)
      .eq("active", true)
      .order("created_at", { ascending: false });
    materials = data || [];
  } catch (e) {}

  // Fallback demo data
  const demoMaterials = [
    {
      id: "demo-1",
      title: "Foundations of Ethics",
      description: "Learn the core values and moral principles that build strong character. Essential for the national assessment.",
      type: "book",
      url: "#",
      thumbnail_url: "/assets/book_thumb.png",
      category: "Module 1"
    },
    {
      id: "demo-2",
      title: "Contest Preparation Guide",
      description: "Official webinar and guide on how to excel in the VEC 2026 Examination.",
      type: "video",
      url: "#",
      thumbnail_url: "/assets/video_thumb.png",
      category: "Examination"
    },
    {
      id: "demo-3",
      title: "Practitioner's Handbook",
      description: "A comprehensive guide to implementing values in daily academic and social life.",
      type: "pdf",
      url: "#",
      thumbnail_url: "/assets/badge.png",
      category: "Advanced"
    }
  ];

  const displayMaterials = materials.length > 0 ? materials : demoMaterials;

  return (
    <div className="relative min-h-dvh bg-[#FCFBFA] selection:bg-primary/30 pb-20">
      {/* Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-orange-100">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/student" 
              className="h-12 w-12 rounded-2xl bg-secondary/5 text-secondary/60 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Library className="h-5 w-5 text-primary" />
              <span className="font-black text-secondary tracking-tight uppercase italic">Learning Center</span>
            </div>
          </div>
          <LanguageSelector currentLang={session.language} />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-12 space-y-12">
        {/* Page Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <ClipboardList className="h-4 w-4" /> Official Study Curriculum
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-secondary leading-[1] tracking-tighter">
            Module <br /><span className="text-gradient-primary italic">Selection</span>
          </h1>
          <p className="text-xl text-secondary/60 font-medium max-w-xl mx-auto leading-relaxed">
            Structured educational resources designed for ethical enrichment and examination readiness.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          <div className="flex h-12 items-center gap-2 px-6 rounded-2xl bg-secondary text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl">
            <Filter className="h-4 w-4 text-primary" /> All Modules
          </div>
          {["Philosophy", "Case Studies", "Multimedia", "Archives"].map((cat) => (
            <button key={cat} className="flex h-12 items-center px-8 rounded-2xl bg-white border border-orange-100 text-secondary/40 text-[10px] font-black uppercase tracking-widest hover:border-primary hover:text-primary hover:bg-primary/5 transition-all whitespace-nowrap">
              {cat}
            </button>
          ))}
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>

        {/* Professional Call to Action */}
        <section className="mt-12 p-12 rounded-[4rem] bg-secondary text-white overflow-hidden relative shadow-3xl group">
           <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                   <Award className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-4xl font-black italic tracking-tighter">Ready for Final Assessment?</h2>
                <p className="text-white/40 font-medium max-w-md text-lg">Once you have completed the required modules, you may proceed to the official examination portal.</p>
              </div>
              <Link 
                href="/student/exam"
                className="inline-flex h-16 px-12 rounded-2xl bg-primary text-white font-black text-lg items-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all uppercase tracking-widest"
              >
                Proceed to Exam <ArrowRight className="h-5 w-5" />
              </Link>
           </div>
           {/* Decoration */}
           <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-primary/5 rounded-full blur-[80px]" />
           <div className="absolute top-0 right-0 p-12 opacity-5">
              <GraduationCap className="h-40 w-40" />
           </div>
        </section>
      </main>

      {/* Footer Line */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-orange-400 to-secondary opacity-40" />
    </div>
  );
}
