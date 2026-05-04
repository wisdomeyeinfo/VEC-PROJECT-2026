import Link from "next/link";
import { 
  LayoutDashboard, 
  School, 
  Package, 
  Users,
  ChevronRight
} from "lucide-react";

export default async function TeamLayout({
  params,
  children,
}: {
  params: Promise<{ teamId: string }>;
  children: React.ReactNode;
}) {
  const { teamId } = await params;

  const nav = [
    { name: "Overview", href: `/staff/team/${teamId}`, icon: LayoutDashboard },
    { name: "Schools", href: `/staff/team/${teamId}/schools`, icon: School },
    { name: "Submissions", href: `/staff/team/${teamId}/submissions`, icon: Users },
    { name: "Inventory", href: `/staff/team/${teamId}/stock`, icon: Package },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/20">
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Management</p>
          {nav.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center justify-between group px-4 py-3 rounded-2xl text-sm font-bold text-zinc-600 hover:bg-primary/10 hover:text-primary transition-all"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.name}
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </aside>

      {/* Page Content */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}
