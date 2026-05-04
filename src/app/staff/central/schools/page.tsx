import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { createSchool, deleteSchool } from "./actions";
import { School, MapPin, Globe, PlusCircle, Trash2 } from "lucide-react";

export default async function CentralSchoolsPage() {
  await requireStaffUser();
  if (!(await isCentralAdmin())) return <div>Access Denied</div>;

  const supabase = await createSupabaseServerClient();
  
  // Fetch schools with team info
  const { data: schools, error } = await supabase
    .from("schools")
    .select("*, teams(name)")
    .order("created_at", { ascending: false });

  // Fetch teams for the dropdown
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, state, district")
    .order("name");

  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tighter">School Registry</h1>
        <p className="text-zinc-500 font-medium">Manage schools and associate them with districts and teams.</p>
      </header>

      <section className="rounded-[2.5rem] border border-zinc-100 bg-white p-8 shadow-xl shadow-zinc-200/20">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <PlusCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Add New School</h2>
        </div>

        <form action={createSchool} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-400">School Name</label>
            <input
              className="w-full h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-orange-500"
              name="name"
              placeholder="Full School Name"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-400">State</label>
            <input
              className="w-full h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-orange-500"
              name="state"
              placeholder="e.g. Maharashtra"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-400">District</label>
            <input
              className="w-full h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-orange-500"
              name="district"
              placeholder="e.g. Pune"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-400">Assign to Team</label>
            <select
              className="w-full h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-4 outline-none focus:border-orange-500"
              name="teamId"
            >
              <option value="">No Team Assigned</option>
              {teams?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button
            className="h-12 rounded-xl bg-zinc-900 text-white font-bold hover:bg-orange-600 transition-all md:col-span-2 lg:col-span-4"
            type="submit"
          >
            Register School
          </button>
        </form>
      </section>

      <section className="rounded-[2.5rem] border border-zinc-100 bg-white p-8 shadow-xl shadow-zinc-200/20">
        <h2 className="text-xl font-bold mb-6">Registered Schools</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-50">
              <tr>
                <th className="pb-4">School Name</th>
                <th className="pb-4">Location</th>
                <th className="pb-4">Team</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools?.map((s) => (
                <tr key={s.id} className="border-b border-zinc-50 group hover:bg-zinc-50/50 transition-all">
                  <td className="py-4 font-bold text-zinc-900">
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4 text-zinc-400" />
                      {s.name}
                    </div>
                  </td>
                  <td className="py-4 text-zinc-500">
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-700">{s.district}</span>
                      <span className="text-[10px] uppercase font-black opacity-50">{s.state}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    {s.teams ? (
                      <span className="inline-flex px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-bold text-[10px] uppercase tracking-widest">
                        {s.teams.name}
                      </span>
                    ) : (
                      <span className="text-zinc-300 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <form action={async () => { "use server"; await deleteSchool(s.id); }}>
                      <button className="p-2 text-zinc-300 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {(!schools || schools.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-400 italic">
                    No schools registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
