import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isCentralAdmin, requireStaffUser } from "@/lib/auth/staff";
import { inviteAndAssignStaff } from "./actions";

export default async function CentralMembersPage() {
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
  const [{ data: teams }, { data: members }] = await Promise.all([
    supabase.from("teams").select("id, name, year").order("created_at", { ascending: false }),
    supabase
      .from("team_members")
      .select("id, user_id, team_id, role, status, created_at")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Staff access</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Invite staff via email and assign them a team role.
        </p>

        <form action={inviteAndAssignStaff} className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-orange-500 md:col-span-2"
            name="email"
            placeholder="Staff email (invite)"
            required
          />
          <select
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 outline-none focus:border-orange-500"
            name="role"
            defaultValue="member"
          >
            <option value="central_admin">Central admin</option>
            <option value="leader">Team leader</option>
            <option value="member">Team member</option>
          </select>
          <select
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 outline-none focus:border-orange-500 md:col-span-3"
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

          <button
            className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 md:col-span-3"
            type="submit"
          >
            Invite + assign
          </button>
        </form>

        <p className="mt-3 text-xs text-zinc-500">
          Note: invites require `SUPABASE_SERVICE_ROLE_KEY` configured on the server.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Assigned roles</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2 pr-4">User id</th>
                <th className="py-2 pr-4">Team id</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {(members ?? []).map((m) => (
                <tr key={m.id} className="border-t border-zinc-100">
                  <td className="py-3 pr-4 font-mono text-xs">{m.user_id}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{m.team_id}</td>
                  <td className="py-3 pr-4 font-semibold">{m.role}</td>
                  <td className="py-3 pr-4">{m.status}</td>
                </tr>
              ))}
              {members?.length === 0 ? (
                <tr>
                  <td className="py-6 text-zinc-500" colSpan={4}>
                    No memberships yet.
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

