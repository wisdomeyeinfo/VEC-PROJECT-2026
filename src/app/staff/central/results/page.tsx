import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { ResultToggle } from "./ResultToggle";
import { 
  Trophy, 
  Eye, 
  EyeOff, 
  Calendar, 
  Users, 
  ChevronRight,
  ShieldAlert,
  Search,
  MapPin
} from "lucide-react";

export default async function CentralResultsPage() {
  await requireStaffUser();
  const central = await isCentralAdmin();
  if (!central) return <div className="p-12 text-center font-black">Access Denied</div>;

  const supabase = await createSupabaseServerClient();
  const [{ data: teams }, { data: vis }] = await Promise.all([
    supabase.from("teams").select("id, name, year, city_region").order("created_at", { ascending: false }),
    supabase.from("results_visibility").select("team_id, visible, visible_from"),
  ]);

  const visByTeam = new Map((vis ?? []).map((v) => [v.team_id, v]));

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight italic">Results Switchboard</h1>
          <p className="text-zinc-500 font-medium">Enable or disable result visibility for each team individually.</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-zinc-100 shadow-sm">
          <Search className="h-4 w-4 text-zinc-400" />
          <input type="text" placeholder="Search team..." className="bg-transparent border-none outline-none text-xs font-bold w-40" />
        </div>
      </div>

      {/* Global Warning */}
      <div className="p-6 rounded-[2rem] bg-orange-50 border border-orange-100 flex items-start gap-4">
        <ShieldAlert className="h-6 w-6 text-orange-500 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-black text-orange-900 uppercase tracking-widest">Important Note</p>
          <p className="text-xs text-orange-700 leading-relaxed font-medium">
            Enabling results will allow students to see their scores and download certificates. Ensure all marks are verified before toggling visibility.
          </p>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 gap-4">
        {(teams ?? []).map((t) => {
          const v = visByTeam.get(t.id);
          const isVisible = Boolean(v?.visible);
          
          return (
            <div key={t.id} className={`group p-6 rounded-[2rem] bg-white border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${isVisible ? 'border-primary/10 shadow-lg shadow-zinc-200/20' : 'border-zinc-50 shadow-sm'}`}>
              <div className="flex items-center gap-6">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${isVisible ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-zinc-100 text-zinc-400'}`}>
                  {isVisible ? <Eye className="h-7 w-7" /> : <EyeOff className="h-7 w-7" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900">{t.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {t.city_region || "Global"}
                    </span>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {t.year}
                    </span>
                  </div>
                </div>
              </div>

              <ResultToggle teamId={t.id} isVisible={isVisible} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
