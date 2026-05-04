import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { createLiveClass } from "../actions";
import { 
  Video, 
  Calendar, 
  MapPin, 
  Users, 
  ExternalLink,
  Trash2,
  Clock,
  ShieldAlert
} from "lucide-react";

export default async function CentralLiveClassesPage() {
  await requireStaffUser();
  if (!(await isCentralAdmin())) return <div>Access Denied</div>;

  const supabase = await createSupabaseServerClient();
  
  let classes: any[] = [];
  let tableMissing = false;

  try {
    const { data, error } = await supabase
      .from("live_classes")
      .select("*")
      .order("scheduled_at", { ascending: true });
    
    if (error) {
      if (error.message.includes("schema cache") || error.code === "PGRST116") {
        tableMissing = true;
      } else {
        throw error;
      }
    } else {
      classes = data || [];
    }
  } catch (e) {
    console.error("Live Classes Fetch Error:", e);
    tableMissing = true;
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Live Sessions</h1>
          <p className="text-zinc-500 font-medium">Schedule Zoom classes for students based on city and gender.</p>
        </div>
      </div>

      {tableMissing && (
        <div className="p-8 rounded-[2.5rem] bg-red-50 border-2 border-red-100 flex items-start gap-6 shadow-xl shadow-red-900/5">
           <div className="h-14 w-14 rounded-2xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg">
              <ShieldAlert className="h-8 w-8" />
           </div>
           <div className="space-y-2">
              <h3 className="text-xl font-black text-red-900">Database Table Missing</h3>
              <p className="text-sm font-medium text-red-700 leading-relaxed">
                The <code className="bg-red-100 px-1.5 py-0.5 rounded font-black text-red-900 uppercase tracking-tighter">live_classes</code> table has not been created in your Supabase database yet. 
                Please run the migrations in the Supabase SQL editor to enable this feature.
              </p>
           </div>
        </div>
      )}

      {/* Add Class Form */}
      <section className={`p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/20 ${tableMissing ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        <form action={createLiveClass} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 flex items-center gap-2 mb-2">
            <Video className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-black text-zinc-800">Schedule New Session</h2>
          </div>
          
          <input
            className="w-full h-14 px-6 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold text-zinc-800 transition-all shadow-inner"
            name="title"
            placeholder="Session Title (e.g. Character Building 101)"
            required
          />
          <input
            className="w-full h-14 px-6 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold text-zinc-800 transition-all shadow-inner"
            name="zoom_link"
            placeholder="Zoom Meeting Link"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <select name="gender" className="w-full h-14 px-6 rounded-2xl bg-zinc-50 font-bold text-zinc-600 outline-none focus:border-primary border border-zinc-100">
              <option value="Both">Both Genders</option>
              <option value="Boy">Boys Only</option>
              <option value="Girl">Girls Only</option>
            </select>
            <input
              type="datetime-local"
              name="scheduled_at"
              className="w-full h-14 px-6 rounded-2xl bg-zinc-50 font-bold text-zinc-600 outline-none focus:border-primary border border-zinc-100 px-4"
              required
            />
          </div>
          <input
            className="w-full h-14 px-6 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold text-zinc-800 transition-all shadow-inner"
            name="city"
            placeholder="City (Optional)"
          />
          
          <button
            type="submit"
            className="md:col-span-2 h-16 rounded-[2rem] bg-zinc-900 text-white font-black text-lg shadow-xl shadow-zinc-200 transition-all hover:bg-black active:scale-95"
          >
            Create Live Session
          </button>
        </form>
      </section>

      {/* Classes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes?.map((cls) => (
          <div key={cls.id} className="p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/20 space-y-6 card-premium">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                  <Users className="h-3 w-3" /> {cls.gender}
                </div>
                <h3 className="text-xl font-black text-zinc-900 leading-tight">{cls.title}</h3>
              </div>
              <button className="p-2 text-zinc-300 hover:text-red-500 transition-colors">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-bold">
                <Calendar className="h-4 w-4" /> {new Date(cls.scheduled_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-bold">
                <Clock className="h-4 w-4" /> {new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-bold md:col-span-2">
                <MapPin className="h-4 w-4" /> {cls.city || "All Cities"}
              </div>
            </div>

            <a 
              href={cls.zoom_link} 
              target="_blank" 
              rel="noreferrer"
              className="flex h-12 items-center justify-center rounded-xl bg-zinc-900 text-white font-black text-sm hover:bg-primary transition-all gap-2 shadow-lg"
            >
              Zoom Link <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ))}
        {(!classes || classes.length === 0) && !tableMissing && (
          <div className="md:col-span-2 p-20 text-center rounded-[3rem] bg-zinc-50 border-2 border-dashed border-zinc-100">
            <Video className="h-16 w-16 text-zinc-100 mx-auto mb-4" />
            <p className="text-zinc-400 font-bold">No live sessions scheduled yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
