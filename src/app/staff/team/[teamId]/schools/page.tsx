import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireStaffUser } from "@/lib/auth/staff";
import { createSchoolAndVisit } from "./actions";
import { StatusSelect } from "./StatusSelect";
import { 
  School, 
  MapPin, 
  User, 
  Phone, 
  Plus, 
  Calendar,
  Building2,
  PhoneCall,
  Search,
  AlertCircle
} from "lucide-react";

export default async function TeamSchoolsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  await requireStaffUser();
  const { teamId } = await params;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("school_visits")
    .select(
      `
      status,
      updated_at,
      schools (
        id,
        district,
        taluka,
        name,
        principal_name,
        principal_phone,
        teacher_name,
        teacher_phone,
        remarks
      )
    `,
    )
    .eq("team_id", teamId)
    .order("updated_at", { ascending: false });

  const rows = (data ?? []).map((r) => ({
    status: r.status as string,
    updated_at: r.updated_at as string,
    school: r.schools as unknown as {
      id: string;
      district: string;
      taluka: string | null;
      name: string;
      principal_name: string | null;
      principal_phone: string | null;
      teacher_name: string | null;
      teacher_phone: string | null;
      remarks: string | null;
    },
  }));

  return (
    <div className="space-y-12 pb-20">
      {/* Header & Add School Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Schools Database</h1>
          <p className="text-zinc-500 font-medium">Manage partnerships and track contest progress for each school.</p>
        </div>
      </div>

      {/* Add School Form Card */}
      <section className="relative group">
        <div className="absolute inset-0 bg-primary/5 rounded-[3rem] rotate-1 group-hover:rotate-0 transition-transform duration-500" />
        <div className="relative p-8 md:p-10 rounded-[3rem] bg-white border border-zinc-100 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-black text-zinc-800">Register New School</h2>
          </div>

          <form
            action={async (formData) => {
              "use server";
              await createSchoolAndVisit(teamId, formData);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">District*</label>
              <input
                className="w-full h-14 px-6 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold text-zinc-800 transition-all"
                name="district"
                placeholder="e.g. Mumbai South"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Taluka / Area</label>
              <input
                className="w-full h-14 px-6 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold text-zinc-800 transition-all"
                name="taluka"
                placeholder="e.g. Colaba"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">School Name*</label>
              <input
                className="w-full h-14 px-6 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold text-zinc-800 transition-all"
                name="name"
                placeholder="e.g. St. Xavier's High School"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
              <div className="p-6 rounded-[2rem] bg-zinc-50 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  <User className="h-3 w-3" /> Principal Details
                </div>
                <input
                  className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 outline-none focus:border-primary font-bold text-sm"
                  name="principal_name"
                  placeholder="Principal Name"
                />
                <input
                  className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 outline-none focus:border-primary font-bold text-sm"
                  name="principal_phone"
                  placeholder="Principal Contact"
                />
              </div>

              <div className="p-6 rounded-[2rem] bg-zinc-50 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  <User className="h-3 w-3" /> Teacher In-charge
                </div>
                <input
                  className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 outline-none focus:border-primary font-bold text-sm"
                  name="teacher_name"
                  placeholder="Teacher Name"
                />
                <input
                  className="w-full h-12 px-4 rounded-xl bg-white border border-zinc-200 outline-none focus:border-primary font-bold text-sm"
                  name="teacher_phone"
                  placeholder="Teacher Contact"
                />
              </div>
            </div>

            <textarea
              className="md:col-span-2 min-h-24 p-6 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-medium text-zinc-800 transition-all resize-none"
              name="remarks"
              placeholder="Additional remarks (Optional)..."
            />
            
            <button
              className="md:col-span-2 h-16 rounded-[2rem] bg-primary text-white font-black text-xl shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
              type="submit"
            >
              <Building2 className="h-6 w-6" /> Register School
            </button>
          </form>
        </div>
      </section>

      {/* Schools Table Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-zinc-800">Tracked Schools ({rows.length})</h2>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-zinc-100 shadow-sm">
            <Search className="h-4 w-4 text-zinc-400" />
            <input type="text" placeholder="Search school..." className="bg-transparent border-none outline-none text-xs font-bold w-40" />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-bold flex items-center gap-3">
            <AlertCircle className="h-5 w-5" /> {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {rows.map((r) => (
            <div key={r.school.id} className="group p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/20 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all hover:border-primary/20">
              <div className="flex items-start gap-6">
                <div className="h-16 w-16 rounded-[1.5rem] bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <School className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-zinc-900">{r.school.name}</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2 py-1 rounded-md">
                      <MapPin className="h-3 w-3" /> {r.school.district} {r.school.taluka ? `• ${r.school.taluka}` : ""}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2 py-1 rounded-md">
                      <Calendar className="h-3 w-3" /> Updated {new Date(r.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50/50">
                      <User className="h-4 w-4 text-zinc-300" />
                      <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Principal</p>
                        <p className="text-xs font-bold text-zinc-700">{r.school.principal_name || "N/A"}</p>
                      </div>
                      {r.school.principal_phone && (
                        <a href={`tel:${r.school.principal_phone}`} className="ml-auto p-1.5 rounded-lg bg-white text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                          <PhoneCall className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50/50">
                      <User className="h-4 w-4 text-zinc-300" />
                      <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Teacher</p>
                        <p className="text-xs font-bold text-zinc-700">{r.school.teacher_name || "N/A"}</p>
                      </div>
                      {r.school.teacher_phone && (
                        <a href={`tel:${r.school.teacher_phone}`} className="ml-auto p-1.5 rounded-lg bg-white text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                          <PhoneCall className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-64 space-y-3">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Contest Status</p>
                <StatusSelect teamId={teamId} schoolId={r.school.id} value={r.status} />
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="p-20 text-center rounded-[3rem] bg-zinc-50 border-2 border-dashed border-zinc-100">
              <School className="h-16 w-16 text-zinc-200 mx-auto mb-4" />
              <p className="text-zinc-400 font-bold">No schools registered for this team yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
