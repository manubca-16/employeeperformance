import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { Role } from "@/types/models";
import { isHighAuthority, isSuperAdmin } from "@/lib/roles";
import {
  LayoutDashboard, Users, ClipboardList, BarChart3, Gift,
  Megaphone, FileText, Settings, ChevronLeft, ChevronRight, LogOut, UploadCloud,
} from "lucide-react";

const allMenuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["SUPERADMIN", "ADMIN", "HR", "EMPLOYEE"] as Role[] },
  { label: "Employees", icon: Users, path: "/dashboard/employees", roles: ["SUPERADMIN", "ADMIN", "HR"] as Role[] },
  { label: "Tasks", icon: ClipboardList, path: "/dashboard/tasks", roles: ["SUPERADMIN", "ADMIN", "HR", "EMPLOYEE"] as Role[] },
  { label: "Task Upload", icon: UploadCloud, path: "/dashboard/tasks/upload", roles: ["SUPERADMIN"] as Role[] },
  { label: "Performance", icon: BarChart3, path: "/dashboard/performance", roles: ["SUPERADMIN", "ADMIN", "HR", "EMPLOYEE"] as Role[] },
  { label: "Bonuses", icon: Gift, path: "/dashboard/bonuses", roles: ["SUPERADMIN", "ADMIN", "HR", "EMPLOYEE"] as Role[] },
  { label: "Announcements", icon: Megaphone, path: "/dashboard/announcements", roles: ["SUPERADMIN", "ADMIN", "HR", "EMPLOYEE"] as Role[] },
  { label: "Reports", icon: FileText, path: "/dashboard/reports", roles: ["SUPERADMIN", "ADMIN", "HR"] as Role[] },
  { label: "Settings", icon: Settings, path: "/dashboard/settings", roles: ["SUPERADMIN"] as Role[] },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = allMenuItems.filter((item) => {
    if (!user) return false;
    if (item.path === "/dashboard/settings") return isSuperAdmin(user.role);
    if (item.path === "/dashboard/tasks/upload") return isSuperAdmin(user.role);
    if (item.path === "/dashboard/employees" || item.path === "/dashboard/reports") {
      return isHighAuthority(user.role);
    }
    return item.roles.includes(user.role);
  });

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-60"
      } bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-200 min-h-screen shrink-0`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-hover">
        {!collapsed && (
          <span className="font-heading text-lg font-bold tracking-tight">PerfTrack</span>
        )}
        {collapsed && <span className="font-heading text-lg font-bold">P</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path === "/dashboard/tasks" && location.pathname.startsWith("/dashboard/tasks") && location.pathname !== "/dashboard/tasks/upload");
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-item w-full ${active ? "sidebar-item-active" : ""}`}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-hover space-y-1">
        <button
          onClick={logout}
          className="sidebar-item w-full text-sidebar-foreground/70 hover:text-sidebar-foreground"
        >
          <LogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-item w-full text-sidebar-foreground/70 hover:text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
