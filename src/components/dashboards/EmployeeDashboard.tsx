import { ClipboardList, CheckCircle, TrendingUp } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import PerformanceCard from "@/components/PerformanceCard";
import StatusTag from "@/components/StatusTag";
import { useAuth } from "@/context/useAuth";
import { useApi } from "@/hooks/useApi";
import { BonusAnnouncement, Employee, Task } from "@/types/models";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { data: employees } = useApi<Employee[]>("/api/employees", []);
  const { data: tasks } = useApi<Task[]>("/api/tasks", []);
  const { data: announcements } = useApi<BonusAnnouncement[]>("/api/bonus-announcements", []);

  const employee = employees.find((emp) => emp.email === user?.email);
  const myTasks = tasks.filter((t) => {
    const assigned = t.assignedTo as Employee | string;
    return typeof assigned === "object" ? assigned.email === user?.email : false;
  });

  if (!employee) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-sm text-muted-foreground">No employee record found for this account.</p>
      </div>
    );
  }

  const dailyData = employee.dailyPerformance.map((v, i) => ({ day: `Day ${i + 1}`, score: v }));
  const weeklyData = employee.weeklyPerformance.map((v, i) => ({ week: `W${i + 1}`, score: v }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Assigned Tasks" value={employee.tasksAssigned} icon={ClipboardList} />
        <KpiCard title="Completed Tasks" value={employee.tasksCompleted} icon={CheckCircle} />
        <KpiCard title="Weekly Performance" value={`${employee.kpiScore}%`} icon={TrendingUp} />
      </div>

      <div>
        <h3 className="font-heading font-semibold mb-3">My Performance</h3>
        <PerformanceCard employee={employee} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading font-semibold mb-6">Daily Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#22C55E" strokeWidth={2} dot={{ fill: "#22C55E", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading font-semibold mb-6">Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#16A34A" strokeWidth={2} dot={{ fill: "#16A34A", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-heading font-semibold">My Tasks</h3>
        </div>
        {myTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Task</th>
                  <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Deadline</th>
                  <th className="text-center px-6 py-3 font-heading font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {myTasks.map((t) => (
                  <tr key={t._id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                      {t.bonusApplicable && (
                        <p className="mt-2 inline-flex rounded-full bg-data-green/10 px-2.5 py-1 text-xs font-medium text-data-green">
                          Bonus Eligible
                        </p>
                      )}
                      {t.escalation?.flag && (
                        <div className="mt-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                          <p className="font-semibold">Escalation Notice</p>
                          <p className="mt-1">{t.escalation.reason || "This task has been escalated."}</p>
                        </div>
                      )}
                      {t.bonusOpportunity && (
                        <p className="text-xs text-bonus font-medium mt-1">{t.bonusOpportunity}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{t.deadline}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusTag status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground font-body italic">No tasks assigned yet.</p>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-heading font-semibold mb-4">Bonus Opportunities</h3>
        {announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a._id} className="border border-bonus/20 rounded-lg p-4">
                <p className="font-heading font-medium text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground font-body mt-1">{a.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground font-body italic">No bonus announcements available.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
