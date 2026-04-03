import { useAuth } from "@/context/useAuth";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import HrDashboard from "@/components/dashboards/HrDashboard";
import EmployeeDashboard from "@/components/dashboards/EmployeeDashboard";
import { isHighAuthority, isSuperAdmin } from "@/lib/roles";

const DashboardHome = () => {
  const { user } = useAuth();

  if (isSuperAdmin(user?.role) || user?.role === "ADMIN") return <AdminDashboard />;
  if (isHighAuthority(user?.role)) return <HrDashboard />;
  return <EmployeeDashboard />;
};

export default DashboardHome;
