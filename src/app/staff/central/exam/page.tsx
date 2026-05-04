import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { upsertExamConfig } from "./actions";

export default async function CentralExamConfigPage() {
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
  const [{ data: teams }, { data: configs }] = await Promise.all([
    supabase.from("teams").select("id, name, year").order("created_at", { ascending: false }),
    supabase
      .from("exam_configs")
      .select("team_id, enabled_from, enabled_to, duration_minutes")
      .order("created_at", { ascending: false }),
  ]);

  const configByTeam = new Map((configs ?? []).map((c) => [c.team_id, c]));

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Exam configuration</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Central team controls when each team’s exam is available.
        </p>

        <form action={upsertExamConfig} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
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
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Enabled from (optional)</span>
            <input
              type="datetime-local"
              name="enabled_from"
              className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Enabled to (optional)</span>
            <input
              type="datetime-local"
              name="enabled_to"
              className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-semibold">Duration (minutes)</span>
            <input
              type="number"
              min={30}
              max={600}
              name="duration_minutes"
              defaultValue={240}
              className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500"
              required
            />
          </label>
          <button
            className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 md:col-span-2"
            type="submit"
          >
            Save config
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Current configs</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2 pr-4">Team</th>
                <th className="py-2 pr-4">From</th>
                <th className="py-2 pr-4">To</th>
                <th className="py-2 pr-4">Duration</th>
              </tr>
            </thead>
            <tbody>
              {(teams ?? []).map((t) => {
                const cfg = configByTeam.get(t.id);
                return (
                  <tr key={t.id} className="border-t border-zinc-100">
                    <td className="py-3 pr-4 font-semibold">{t.name}</td>
                    <td className="py-3 pr-4 text-xs text-zinc-600">
                      {cfg?.enabled_from ? new Date(cfg.enabled_from).toLocaleString() : "-"}
                    </td>
                    <td className="py-3 pr-4 text-xs text-zinc-600">
                      {cfg?.enabled_to ? new Date(cfg.enabled_to).toLocaleString() : "-"}
                    </td>
                    <td className="py-3 pr-4">{cfg?.duration_minutes ?? 240} min</td>
                  </tr>
                );
              })}
              {(teams ?? []).length === 0 ? (
                <tr>
                  <td className="py-6 text-zinc-500" colSpan={4}>
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

