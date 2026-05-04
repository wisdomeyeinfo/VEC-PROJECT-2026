import { StudentBottomNav } from "@/components/student/StudentBottomNav";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-dvh">
      {/* Page content — with bottom padding so it's not hidden behind nav */}
      <div className="pb-safe">{children}</div>

      {/* Persistent bottom nav on mobile / desktop */}
      <StudentBottomNav />
    </div>
  );
}
