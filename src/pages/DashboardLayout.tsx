import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AppSidebar from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import ActivityPulse from "@/components/ActivityPulse";

const DashboardLayout = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/signin" replace />;

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <ActivityPulse />
    </div>
  );
};

export default DashboardLayout;
