import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import RequireRole from "./components/RequireRole";

const queryClient = new QueryClient();
const Landing = lazy(() => import("./pages/Landing"));
const SignIn = lazy(() => import("./pages/SignIn"));
const DashboardLayout = lazy(() => import("./pages/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/DashboardHome"));
const EmployeesPage = lazy(() => import("./pages/EmployeesPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const UploadTasksPage = lazy(() => import("./pages/UploadTasksPage"));
const PerformancePage = lazy(() => import("./pages/PerformancePage"));
const BonusesPage = lazy(() => import("./pages/BonusesPage"));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm">
      Loading...
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route
                  path="tasks/upload"
                  element={
                    <RequireRole roles={["SUPERADMIN"]}>
                      <UploadTasksPage />
                    </RequireRole>
                  }
                />
                <Route path="performance" element={<PerformancePage />} />
                <Route path="bonuses" element={<BonusesPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
