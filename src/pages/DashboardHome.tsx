import { useAuth } from "@/context/AuthContext";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import HrDashboard from "@/components/dashboards/HrDashboard";
import EmployeeDashboard from "@/components/dashboards/EmployeeDashboard";

const DashboardHome = () => {
  const { user } = useAuth();

  if (user?.role === "ADMIN") return <AdminDashboard />;
  if (user?.role === "HR") return <HrDashboard />;
  return <EmployeeDashboard />;
};

export default DashboardHome;
