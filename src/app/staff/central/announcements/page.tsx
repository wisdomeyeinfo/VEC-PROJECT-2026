import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { createAnnouncement } from "../actions";
import { 
  Bell, 
  Plus, 
  MessageCircle, 
  Trash2, 
  AlertCircle,
  Megaphone,
  ShieldAlert
} from "lucide-react";

export default async function CentralAnnouncementsPage() {
  await requireStaffUser();
  if (!(await isCentralAdmin())) return <div>Access Denied</div>;

  const supabase = await createSupabaseServerClient();
  
  let messages: any[] = [];
  let tableMissing = false;

  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      if (error.message.includes("schema cache") || error.code === "PGRST116") {
        tableMissing = true;
      } else {
        throw error;
      }
    } else {
      messages = data || [];
    }
  } catch (e) {
    console.error("Announcements Fetch Error:", e);
    tableMissing = true;
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Global Announcements</h1>
          <p className="text-zinc-500 font-medium">Broadcast news, updates, and reminders to all students.</p>
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
                The <code className="bg-red-100 px-1.5 py-0.5 rounded font-black text-red-900 uppercase tracking-tighter">announcements</code> table has not been created in your Supabase database yet. 
                Please run the migrations in the Supabase SQL editor to enable this feature.
              </p>
           </div>
        </div>
      )}

      {/* Add Announcement Form */}
      <section className={`p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/20 ${tableMissing ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
        <form action={createAnnouncement} className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-black text-zinc-800">New Broadcast</h2>
          </div>
          
          <input
            className="w-full h-14 px-6 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold text-zinc-800 transition-all shadow-inner"
            name="title"
            placeholder="Announcement Title (e.g. Exam Date Extended!)"
            required
          />
          
          <textarea
            className="w-full min-h-32 p-6 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-medium text-zinc-800 transition-all resize-none shadow-inner"
            name="content"
            placeholder="Broadcast message content..."
            required
          />

          <div className="flex items-center gap-4">
            <select name="priority" className="h-14 px-6 rounded-2xl bg-zinc-50 font-bold text-zinc-600 outline-none focus:border-primary shadow-sm border border-zinc-100">
              <option value="Normal">Normal Priority</option>
              <option value="High">High Priority (Urgent)</option>
            </select>
            
            <button
              type="submit"
              className="flex-1 h-14 rounded-2xl bg-zinc-900 text-white font-black text-lg shadow-xl shadow-zinc-200 transition-all hover:bg-black active:scale-95"
            >
              Post Announcement
            </button>
          </div>
        </form>
      </section>

      {/* Announcements List */}
      <div className="space-y-4">
        {messages?.map((msg) => (
          <div key={msg.id} className={`p-6 rounded-[2rem] bg-white border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${msg.priority === 'High' ? 'border-red-100 bg-red-50/10' : 'border-zinc-50 shadow-sm'}`}>
            <div className="flex items-center gap-6">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${msg.priority === 'High' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-zinc-100 text-zinc-400'}`}>
                <MessageCircle className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-zinc-900">{msg.title}</h3>
                <p className="text-sm text-zinc-500 font-medium line-clamp-1">{msg.content}</p>
                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest pt-1">
                  Posted {new Date(msg.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {msg.priority === 'High' && (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Urgent
                </span>
              )}
              <button className="p-2 text-zinc-300 hover:text-red-500 transition-colors">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
        {(!messages || messages.length === 0) && !tableMissing && (
          <div className="p-20 text-center rounded-[3rem] bg-zinc-50 border-2 border-dashed border-zinc-100">
            <Bell className="h-16 w-16 text-zinc-100 mx-auto mb-4" />
            <p className="text-zinc-400 font-bold">No announcements posted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
