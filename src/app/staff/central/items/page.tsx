import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { createKitItem } from "./actions";

export default async function CentralItemsPage() {
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
  const { data: items, error } = await supabase
    .from("kit_items")
    .select("id, name, category, language_specific, active, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Kit items</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Define the flexible kit items (books, pens, calendars, etc.). Mark items as language
          specific if stock is tracked per language.
        </p>

        <form action={createKitItem} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500"
            name="name"
            placeholder="Item name (e.g. Question Bank)"
            required
          />
          <input
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500"
            name="category"
            placeholder="Category (optional)"
          />
          <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
            <input
              className="h-4 w-4 accent-orange-600"
              type="checkbox"
              name="language_specific"
            />
            Track stock by language
          </label>
          <button
            className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 md:col-span-2"
            type="submit"
          >
            Create item
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Existing items</h2>
        {error ? <p className="mt-2 text-sm text-red-700">{error.message}</p> : null}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Language specific</th>
                <th className="py-2 pr-4">Active</th>
              </tr>
            </thead>
            <tbody>
              {(items ?? []).map((it) => (
                <tr key={it.id} className="border-t border-zinc-100">
                  <td className="py-3 pr-4 font-semibold">{it.name}</td>
                  <td className="py-3 pr-4">{it.category || "-"}</td>
                  <td className="py-3 pr-4">{it.language_specific ? "Yes" : "No"}</td>
                  <td className="py-3 pr-4">{it.active ? "Yes" : "No"}</td>
                </tr>
              ))}
              {items?.length === 0 ? (
                <tr>
                  <td className="py-6 text-zinc-500" colSpan={4}>
                    No items yet.
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

