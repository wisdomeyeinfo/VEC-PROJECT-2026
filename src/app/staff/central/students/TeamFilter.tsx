"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function TeamFilter({ teams }: { teams: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTeamId = searchParams.get("teamId") || "";

  return (
    <select
      value={currentTeamId}
      onChange={(e) => {
        const url = new URL(window.location.href);
        if (e.target.value) {
          url.searchParams.set("teamId", e.target.value);
        } else {
          url.searchParams.delete("teamId");
        }
        router.push(url.pathname + url.searchParams.toString() ? `?${url.searchParams.toString()}` : "");
      }}
      className="h-10 px-4 rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-bold outline-none focus:border-orange-500"
    >
      <option value="">Filter by Team</option>
      {teams.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
