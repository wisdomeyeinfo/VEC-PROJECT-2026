"use client";

import { useTransition } from "react";
import { updateVisitStatus } from "./actions";

const STATUSES = [
  { id: "permission_pending", label: "Permission pending" },
  { id: "announcement_done", label: "Announcement done" },
  { id: "permission_granted", label: "Permission granted" },
  { id: "distribution_pending", label: "Distribution pending" },
  { id: "distribution_completed", label: "Distribution completed" },
] as const;

export function StatusSelect({
  teamId,
  schoolId,
  value,
}: {
  teamId: string;
  schoolId: string;
  value: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className="h-10 w-full rounded-xl border border-zinc-300 bg-white px-2 text-sm outline-none focus:border-orange-500 disabled:opacity-60"
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          await updateVisitStatus(teamId, schoolId, next);
        });
      }}
    >
      {STATUSES.map((s) => (
        <option key={s.id} value={s.id}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

