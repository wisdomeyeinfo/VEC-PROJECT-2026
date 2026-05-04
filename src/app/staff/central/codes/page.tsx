import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { generateActivationCodes } from "./actions";

export default async function CentralCodesPage() {
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
  const [{ data: teams }, { data: codes, error: codesErr }] = await Promise.all([
    supabase.from("teams").select("id, name, year").order("created_at", { ascending: false }),
    supabase
      .from("activation_codes")
      .select("code, team_id, year, status, redeemed_at")
      .order("code", { ascending: true })
      .limit(50),
  ]);

  const countByTeam = new Map<string, { unused: number; redeemed: number; revoked: number }>();
  if (codes) {
    for (const c of codes) {
      const cur = countByTeam.get(c.team_id) ?? { unused: 0, redeemed: 0, revoked: 0 };
      if (c.status === "unused") cur.unused += 1;
      if (c.status === "redeemed") cur.redeemed += 1;
      if (c.status === "revoked") cur.revoked += 1;
      countByTeam.set(c.team_id, cur);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Activation codes</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Generate activation codes and allocate them to a team.
        </p>

        <form action={generateActivationCodes} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <select
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 outline-none focus:border-orange-500 md:col-span-2"
            name="team_id"
            required
          >
            <option value="">Select team…</option>
            {(teams ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.year})
              </option>
            ))}
          </select>
          <input
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500"
            name="year"
            defaultValue={process.env.NEXT_PUBLIC_VEC_YEAR || "2026"}
            placeholder="Year"
            required
          />
          <input
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500 md:col-span-2"
            name="count"
            type="number"
            min={1}
            max={5000}
            placeholder="How many codes? (max 5000 per batch)"
            required
          />
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
            type="submit"
          >
            Generate
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Latest codes (sample)</h2>
        {codesErr ? <p className="mt-2 text-sm text-red-700">{codesErr.message}</p> : null}
        <p className="mt-2 text-xs text-zinc-500">
          For performance, this page shows only a small sample. (We’ll add CSV export/import later.)
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Team</th>
                <th className="py-2 pr-4">Year</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {(codes ?? []).map((c) => (
                <tr key={c.code} className="border-t border-zinc-100">
                  <td className="py-3 pr-4 font-mono">{c.code}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{c.team_id}</td>
                  <td className="py-3 pr-4">{c.year}</td>
                  <td className="py-3 pr-4 font-semibold">{c.status}</td>
                </tr>
              ))}
              {codes?.length === 0 ? (
                <tr>
                  <td className="py-6 text-zinc-500" colSpan={4}>
                    No codes yet.
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

