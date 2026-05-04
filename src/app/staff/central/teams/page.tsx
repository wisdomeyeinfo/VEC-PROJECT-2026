import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { createTeam } from "./actions";

export default async function CentralTeamsPage() {
  await requireStaffUser();
  const central = await isCentralAdmin();
  if (!central) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Access denied</h1>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: teams, error } = await supabase
    .from("teams")
    .select("id, name, city_region, state, district, year, whatsapp_invite_url, active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">Teams</h1>
        <p className="mt-2 text-sm text-red-700">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Teams</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Create teams and set each team’s WhatsApp invite link.
        </p>

        <form action={createTeam} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500"
            name="name"
            placeholder="Team name"
            required
          />
          <input
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500"
            name="year"
            placeholder="Year (e.g. 2026)"
            defaultValue={process.env.NEXT_PUBLIC_VEC_YEAR || "2026"}
            required
          />
          <input
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500"
            name="city_region"
            placeholder="City (optional)"
          />
          <input
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500"
            name="state"
            placeholder="State (e.g. Maharashtra)"
            required
          />
          <input
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500"
            name="district"
            placeholder="District (e.g. Pune)"
            required
          />
          <input
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500 md:col-span-2"
            name="whatsapp_invite_url"
            placeholder="WhatsApp invite URL (optional)"
          />
          <button
            className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 md:col-span-2"
            type="submit"
          >
            Create team
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Existing teams</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Year</th>
                <th className="py-2 pr-4">State</th>
                <th className="py-2 pr-4">District</th>
                <th className="py-2 pr-4">Region</th>
                <th className="py-2 pr-4">WhatsApp</th>
                <th className="py-2 pr-4">Active</th>
              </tr>
            </thead>
            <tbody>
              {(teams ?? []).map((t) => (
                <tr key={t.id} className="border-t border-zinc-100">
                  <td className="py-3 pr-4 font-semibold">{t.name}</td>
                  <td className="py-3 pr-4">{t.year}</td>
                  <td className="py-3 pr-4">{t.state || "-"}</td>
                  <td className="py-3 pr-4">{t.district || "-"}</td>
                  <td className="py-3 pr-4">{t.city_region || "-"}</td>
                  <td className="py-3 pr-4">
                    {t.whatsapp_invite_url ? (
                      <a
                        className="font-semibold text-orange-700 hover:underline"
                        href={t.whatsapp_invite_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Link
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 pr-4">{t.active ? "Yes" : "No"}</td>
                </tr>
              ))}
              {teams?.length === 0 ? (
                <tr>
                  <td className="py-6 text-zinc-500" colSpan={5}>
                    No teams yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

