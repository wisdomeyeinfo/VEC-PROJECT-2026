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
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full max-w-[100vw] overflow-hidden">
      {/* Central Navigation - Horizontal Scroll on Mobile, Sidebar on Desktop */}
      <aside className="w-full lg:w-72 shrink-0 lg:bg-white lg:p-6 lg:rounded-[2.5rem] lg:border border-zinc-100 lg:shadow-xl shadow-zinc-200/20">
        <div className="space-y-0 lg:space-y-2">
          <p className="hidden lg:block px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Central Admin</p>
          
          {/* Mobile: Horizontal scrollable container | Desktop: Stacked list */}
          <div className="flex lg:flex-col items-center lg:items-stretch gap-2 lg:gap-1 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0">
            {nav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center justify-between group px-4 lg:px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold bg-white lg:bg-transparent border lg:border-transparent border-zinc-100 text-zinc-600 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all whitespace-nowrap shrink-0 shadow-sm lg:shadow-none"
              >
                <div className="flex items-center gap-2 lg:gap-3">
                  <item.icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  {item.name}
                </div>
                <ChevronRight className="hidden lg:block h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Page Content */}
      <div className="flex-1 w-full min-w-0">
        {children}
      </div>
    </div>
  );
}
