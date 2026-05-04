import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyStaffMemberships, requireStaffUser } from "@/lib/auth/staff";

export default async function StaffHomePage() {
  const { user } = await requireStaffUser();
  const memberships = await getMyStaffMemberships();

  if (memberships.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">No team access</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Your account is signed in, but you don’t have a team role yet. Ask a central admin to
          add you as a leader/member.
        </p>
        <p className="mt-4 text-xs text-zinc-500">Signed in as: {user.email}</p>
      </div>
    );
  }

  const isCentral = memberships.some((m) => m.role === "central_admin");
  if (isCentral) redirect("/staff/central");

  const firstTeamId = memberships[0]?.team_id;
  redirect(`/staff/team/${firstTeamId}`);
}

// This route redirects to role-specific dashboards.

