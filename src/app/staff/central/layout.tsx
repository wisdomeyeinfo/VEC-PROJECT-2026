import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShieldCheck, 
  Key, 
  BarChart3, 
  Settings, 
  HelpCircle,
  ChevronRight,
  Database,
  Award,
  Video,
  Bell,
  School
} from "lucide-react";

export default function CentralLayout({ children }: { children: React.ReactNode }) {
  const nav = [
    { name: "Overview", href: "/staff/central", icon: LayoutDashboard },
    { name: "Student Management", href: "/staff/central/students", icon: Users },
    { name: "Teams", href: "/staff/central/teams", icon: Users },
    { name: "School Registry", href: "/staff/central/schools", icon: School },
    { name: "Submissions", href: "/staff/central/submissions", icon: BarChart3 },
    { name: "Live Classes", href: "/staff/central/live", icon: Video },
    { name: "Announcements", href: "/staff/central/announcements", icon: Bell },
    { name: "Kit Items", href: "/staff/central/items", icon: Package },
    { name: "Staff Access", href: "/staff/central/members", icon: ShieldCheck },
    { name: "Activation Codes", href: "/staff/central/codes", icon: Key },
    { name: "Stock Allocation", href: "/staff/central/stock", icon: Database },
    { name: "Exam Config", href: "/staff/central/exam", icon: Settings },
    { name: "Questions", href: "/staff/central/questions", icon: HelpCircle },
    { name: "Results", href: "/staff/central/results", icon: Award },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* Central Sidebar */}
      <aside className="w-full md:w-72 shrink-0 bg-white p-6 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-200/20">
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Central Admin</p>
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
