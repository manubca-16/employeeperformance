import { Users, ClipboardList, TrendingUp, Megaphone, Flag } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import { useApi } from "@/hooks/useApi";
import { BonusAnnouncement, Employee, Task } from "@/types/models";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const HrDashboard = () => {
  const { data: employees } = useApi<Employee[]>("/api/employees", []);
  const { data: tasks } = useApi<Task[]>("/api/tasks", []);
  const { data: announcements } = useApi<BonusAnnouncement[]>("/api/bonus-announcements", []);

  const avgKpi = employees.length
    ? Math.round(employees.reduce((sum, emp) => sum + emp.kpiScore, 0) / employees.length)
    : 0;

  const weeklyData =
    employees.length > 0
      ? employees[0].weeklyPerformance.map((_, i) => ({
          week: `W${i + 1}`,
          score: Math.round(
            employees.reduce((sum, emp) => sum + (emp.weeklyPerformance[i] || 0), 0) / employees.length
          ),
        }))
      : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Employees" value={employees.length} icon={Users} />
        <KpiCard title="Tasks Pending" value={tasks.filter((t) => t.status === "Pending").length} icon={ClipboardList} />
        <KpiCard title="Avg Performance" value={`${avgKpi}%`} icon={TrendingUp} />
        <KpiCard title="Bonus Notifications" value={announcements.length} icon={Megaphone} variant="bonus" />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-heading font-semibold">Employee Performance Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Name</th>
                <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Department</th>
                <th className="text-center px-6 py-3 font-heading font-medium text-muted-foreground">Tasks</th>
                <th className="text-center px-6 py-3 font-heading font-medium text-muted-foreground">KPI</th>
                <th className="text-center px-6 py-3 font-heading font-medium text-muted-foreground">Progress</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const progress = emp.tasksAssigned ? (emp.tasksCompleted / emp.tasksAssigned) * 100 : 0;
                return (
                  <tr key={emp._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{emp.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{emp.department}</td>
                    <td className="px-6 py-4 text-center">
                      {emp.tasksCompleted}/{emp.tasksAssigned}
                    </td>
                    <td className="px-6 py-4 text-center font-heading font-semibold">{emp.kpiScore}%</td>
                    <td className="px-6 py-4">
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-data-green rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading font-semibold mb-6">Weekly Performance Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#16A34A" strokeWidth={2} dot={{ fill: "#16A34A", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading font-semibold mb-4">Bonus Notifications</h3>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bonus notifications yet.</p>
            ) : (
              announcements.map((a) => (
                <div key={a._id} className="border border-bonus/20 rounded-lg p-4">
                  <p className="font-heading font-medium text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">{a.description}</p>
                  <p className="text-bonus font-heading font-bold text-sm mt-2">INR {a.amount.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-heading font-semibold">Task Oversight</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Task</th>
                <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Assigned To</th>
                <th className="text-center px-6 py-3 font-heading font-medium text-muted-foreground">Bonus</th>
                <th className="text-center px-6 py-3 font-heading font-medium text-muted-foreground">Escalation</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const assigned = task.assignedTo as Employee | string;
                return (
                  <tr key={task._id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {typeof assigned === "object" ? assigned.name : "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${task.bonusApplicable ? "bg-data-green/10 text-data-green" : "bg-secondary text-muted-foreground"}`}>
                        {task.bonusApplicable ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {task.escalation?.flag ? (
                        <span className="inline-flex items-center gap-2 text-amber-600" title={task.escalation.reason || "Escalated"}>
                          <Flag size={14} />
                          {task.escalation.reason || "Escalated"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;
