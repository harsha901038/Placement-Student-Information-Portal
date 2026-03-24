import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, User, Calendar, GraduationCap, Briefcase, 
  FileText, FileEdit, Users, LogOut, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isStudent = user?.role === "student";
  
  const studentLinks = [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/profile", label: "My Profile", icon: User },
    { href: "/student/attendance", label: "Attendance", icon: Calendar },
    { href: "/student/results", label: "Semester Results", icon: GraduationCap },
    { href: "/student/jobs", label: "Jobs & Internships", icon: Briefcase },
    { href: "/student/applications", label: "My Applications", icon: FileText },
    { href: "/student/resume", label: "Resume Builder", icon: FileEdit },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Manage Students", icon: Users },
    { href: "/admin/jobs", label: "Manage Jobs", icon: Briefcase },
    { href: "/admin/applications", label: "Applications", icon: FileText },
  ];

  const links = isStudent ? studentLinks : adminLinks;

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <GraduationCap className="h-6 w-6 text-primary mr-2" />
          <span className="font-display font-bold text-lg text-gray-900 tracking-tight">
            EduPlacement
          </span>
        </div>
        
        <div className="p-4 border-b border-gray-100">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Logged in as
          </div>
          <div className="font-medium text-gray-900 truncate">{user?.name}</div>
          <div className="text-sm text-gray-500 capitalize">{user?.role}</div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-gray-600 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-primary"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
            onClick={logout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center">
            <GraduationCap className="h-6 w-6 text-primary mr-2" />
            <span className="font-display font-bold text-lg text-gray-900">EduPlacement</span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5 text-gray-600" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
