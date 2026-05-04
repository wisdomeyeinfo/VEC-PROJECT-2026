import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { allocateStockToTeam } from "./actions";

export default async function CentralStockPage() {
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
  const [{ data: teams }, { data: items }, { data: movements, error: mvErr }] = await Promise.all([
    supabase.from("teams").select("id, name, year").order("created_at", { ascending: false }),
    supabase.from("kit_items").select("id, name, language_specific, active").eq("active", true),
    supabase
      .from("stock_movements")
      .select("id, to_team_id, item_id, language, qty, reason, created_at")
      .eq("reason", "allocation")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const teamById = new Map((teams ?? []).map((t) => [t.id, t]));
  const itemById = new Map((items ?? []).map((i) => [i.id, i]));

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Stock allocation</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Allocate kit items from the central stock to a team. (This records a ledger entry and
          updates the team’s on-hand stock.)
        </p>

        <form action={allocateStockToTeam} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
          <select
            name="team_id"
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 outline-none focus:border-orange-500 md:col-span-2"
            required
          >
            <option value="">Select team…</option>
            {(teams ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.year})
              </option>
            ))}
          </select>
          <select
            name="item_id"
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 outline-none focus:border-orange-500 md:col-span-2"
            required
          >
            <option value="">Select item…</option>
            {(items ?? []).map((it) => (
              <option key={it.id} value={it.id}>
                {it.name}
              </option>
            ))}
          </select>
          <input
            name="language"
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500 md:col-span-2"
            placeholder="Language (optional)"
          />
          <input
            name="qty"
            type="number"
            min={1}
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500"
            placeholder="Qty"
            required
          />
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
            type="submit"
          >
            Allocate
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Recent allocations</h2>
        {mvErr ? <p className="mt-2 text-sm text-red-700">{mvErr.message}</p> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">Team</th>
                <th className="py-2 pr-4">Item</th>
                <th className="py-2 pr-4">Language</th>
                <th className="py-2 pr-4">Qty</th>
              </tr>
            </thead>
            <tbody>
              {(movements ?? []).map((m) => (
                <tr key={m.id} className="border-t border-zinc-100">
                  <td className="py-3 pr-4 text-xs text-zinc-500">
                    {new Date(m.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 font-semibold">
                    {teamById.get(m.to_team_id)?.name ?? m.to_team_id}
                  </td>
                  <td className="py-3 pr-4">{itemById.get(m.item_id)?.name ?? m.item_id}</td>
                  <td className="py-3 pr-4">{m.language || "-"}</td>
                  <td className="py-3 pr-4 font-semibold">{m.qty}</td>
                </tr>
              ))}
              {movements?.length === 0 ? (
                <tr>
                  <td className="py-6 text-zinc-500" colSpan={5}>
                    No allocations yet.
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

