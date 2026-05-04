import { requireStaffUser } from "@/lib/auth/staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { recordDistribution, recordStockAdjustment } from "./actions";

export default async function TeamStockPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  await requireStaffUser();
  const { teamId } = await params;

  const supabase = await createSupabaseServerClient();
  const [
    { data: items, error: itemsErr },
    { data: stock, error: stockErr },
    { data: schools },
  ] = await Promise.all([
    supabase.from("kit_items").select("id, name, language_specific, active").eq("active", true),
    supabase
      .from("team_stock")
      .select("id, item_id, language, qty_on_hand, updated_at")
      .eq("team_id", teamId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("school_visits")
      .select("school_id, schools ( id, name, district )")
      .eq("team_id", teamId)
      .order("updated_at", { ascending: false })
      .limit(300),
  ]);

  const itemById = new Map((items ?? []).map((i) => [i.id, i]));

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Stock</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Track quantities per item (and per language for language-specific items).
        </p>

        <form
          action={async (formData) => {
            "use server";
            await recordStockAdjustment(teamId, formData);
          }}
          className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4"
        >
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
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500"
            placeholder="Language (optional)"
          />

          <div className="grid grid-cols-3 gap-2 md:col-span-4">
            <select
              name="direction"
              className="h-11 rounded-xl border border-zinc-300 bg-white px-3 outline-none focus:border-orange-500"
              defaultValue="in"
            >
              <option value="in">Add</option>
              <option value="out">Remove</option>
            </select>
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
              Save
            </button>
          </div>
        </form>

        {itemsErr ? <p className="mt-3 text-sm text-red-700">{itemsErr.message}</p> : null}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Record distribution</h2>
        <p className="mt-2 text-sm text-zinc-600">
          When you distribute kits/books in a school, record it here. This reduces your stock and
          adds a ledger entry.
        </p>

        <form
          action={async (formData) => {
            "use server";
            await recordDistribution(teamId, formData);
          }}
          className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4"
        >
          <select
            name="school_id"
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 outline-none focus:border-orange-500 md:col-span-2"
            required
          >
            <option value="">Select school…</option>
            {(schools ?? []).map((s) => {
              const school = s.schools as unknown as { id: string; name: string; district: string };
              return (
                <option key={school.id} value={school.id}>
                  {school.name} • {school.district}
                </option>
              );
            })}
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
            className="inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 md:col-span-4"
            type="submit"
          >
            Record distribution
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Current stock</h2>
        {stockErr ? <p className="mt-2 text-sm text-red-700">{stockErr.message}</p> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2 pr-4">Item</th>
                <th className="py-2 pr-4">Language</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Updated</th>
              </tr>
            </thead>
            <tbody>
              {(stock ?? []).map((s) => {
                const item = itemById.get(s.item_id);
                return (
                  <tr key={s.id} className="border-t border-zinc-100">
                    <td className="py-3 pr-4 font-semibold">{item?.name || s.item_id}</td>
                    <td className="py-3 pr-4">{s.language || "-"}</td>
                    <td className="py-3 pr-4">{s.qty_on_hand}</td>
                    <td className="py-3 pr-4 text-xs text-zinc-500">
                      {new Date(s.updated_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {stock?.length === 0 ? (
                <tr>
                  <td className="py-6 text-zinc-500" colSpan={4}>
                    No stock rows yet.
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

