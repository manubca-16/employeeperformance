import { useState } from "react";
import { Users, ClipboardList, TrendingUp, Megaphone, Pencil, Trash2, Plus } from "lucide-react";
import KpiCard from "@/components/KpiCard";
import { apiFetch, useApi } from "@/hooks/useApi";
import { BonusAnnouncement, Employee, Task } from "@/types/models";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import EmployeeEditDialog from "@/components/EmployeeEditDialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/useAuth";
import { isSuperAdmin } from "@/lib/roles";

const AdminDashboard = () => {
  const { user } = useAuth();
  const canManageBonusAnnouncements = isSuperAdmin(user?.role);
  const { data: employees, refetch: refetchEmployees } = useApi<Employee[]>("/api/employees", []);
  const { data: tasks, refetch: refetchTasks } = useApi<Task[]>("/api/tasks", []);
  const { data: announcements, refetch: refetchAnnouncements } = useApi<BonusAnnouncement[]>(
    "/api/bonus-announcements",
    [],
  );

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    deadline: "",
    bonusOpportunity: "",
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    description: "",
    amount: "",
    date: "",
    taskId: "",
    bonusOpportunity: "",
  });

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

  const taskDataMap = new Map<string, { assigned: number; completed: number }>();
  employees.forEach((emp) => {
    const entry = taskDataMap.get(emp.department) || { assigned: 0, completed: 0 };
    entry.assigned += emp.tasksAssigned;
    entry.completed += emp.tasksCompleted;
    taskDataMap.set(emp.department, entry);
  });
  const taskData = Array.from(taskDataMap.entries()).map(([name, values]) => ({
    name,
    assigned: values.assigned,
    completed: values.completed,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Employees" value={employees.length} icon={Users} />
        <KpiCard title="Active Tasks" value={tasks.filter((t) => t.status !== "Completed").length} icon={ClipboardList} />
        <KpiCard title="Avg Performance" value={`${avgKpi}%`} icon={TrendingUp} />
        <KpiCard title="Bonus Announcements" value={announcements.length} icon={Megaphone} variant="bonus" />
      </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-heading font-semibold">Employee Management</h3>
          </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Name</th>
                <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Department</th>
                <th className="text-center px-6 py-3 font-heading font-medium text-muted-foreground">Assigned</th>
                <th className="text-center px-6 py-3 font-heading font-medium text-muted-foreground">Completed</th>
                <th className="text-center px-6 py-3 font-heading font-medium text-muted-foreground">KPI</th>
                <th className="text-center px-6 py-3 font-heading font-medium text-muted-foreground">Bonus</th>
                <th className="text-right px-6 py-3 font-heading font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{emp.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{emp.department}</td>
                  <td className="px-6 py-4 text-center">{emp.tasksAssigned}</td>
                  <td className="px-6 py-4 text-center">{emp.tasksCompleted}</td>
                  <td className="px-6 py-4 text-center font-heading font-semibold">{emp.kpiScore}%</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        emp.bonusStatus === "Awarded"
                          ? "status-completed"
                          : emp.bonusStatus === "Eligible"
                          ? "status-pending"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {emp.bonusStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="p-1.5 hover:bg-secondary rounded-md transition-colors text-primary"
                      onClick={() => setEditingEmployee(emp)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="p-1.5 hover:bg-secondary rounded-md transition-colors text-data-red ml-1"
                      onClick={async () => {
                        if (!window.confirm("Delete this employee?")) return;
                        await apiFetch(`/api/employees/${emp._id}`, { method: "DELETE" });
                        await refetchEmployees();
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
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
          <h3 className="font-heading font-semibold mb-6">Task Completion by Department</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={taskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
              <Tooltip />
              <Bar dataKey="assigned" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">Assign Task</h3>
            <button
              type="button"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-heading font-medium hover:opacity-90 transition-opacity"
              onClick={() => setAssignOpen(true)}
            >
              <Plus size={16} />
              Assign Task
            </button>
          </div>
          <p className="text-sm text-muted-foreground">Create and assign new tasks to employees.</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">Bonus Announcements</h3>
            {canManageBonusAnnouncements ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 bg-bonus text-bonus-foreground px-3 py-2 rounded-md text-sm font-heading font-medium hover:opacity-90 transition-opacity"
                onClick={() => setAnnounceOpen(true)}
              >
                <Plus size={16} />
                Add Announcement
              </button>
            ) : null}
          </div>
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bonus announcements yet.</p>
            ) : (
              announcements.map((a) => (
                <div key={a._id} className="border border-bonus/20 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-heading font-medium text-sm">{a.title}</p>
                      <p className="text-xs text-muted-foreground font-body mt-1">{a.description}</p>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Posted by {a.createdBy?.name || "System"}
                      </p>
                    </div>
                    <span className="text-bonus font-heading font-bold text-sm">INR {a.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <EmployeeEditDialog
        open={!!editingEmployee}
        employee={editingEmployee}
        onOpenChange={(open) => !open && setEditingEmployee(null)}
        onSaved={refetchEmployees}
      />

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              placeholder="Task name"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
              value={assignForm.title}
              onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body resize-none"
              value={assignForm.description}
              onChange={(e) => setAssignForm({ ...assignForm, description: e.target.value })}
            />
            <select
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
              value={assignForm.assignedTo}
              onChange={(e) => setAssignForm({ ...assignForm, assignedTo: e.target.value })}
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.department})
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
                value={assignForm.deadline}
                onChange={(e) => setAssignForm({ ...assignForm, deadline: e.target.value })}
              />
              <input
                placeholder="Bonus opportunity"
                className="px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
                value={assignForm.bonusOpportunity}
                onChange={(e) => setAssignForm({ ...assignForm, bonusOpportunity: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              className="bg-secondary text-foreground px-4 py-2 rounded-md text-sm font-heading font-medium"
              onClick={() => setAssignOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-heading font-medium"
              onClick={async () => {
                await apiFetch("/api/tasks", {
                  method: "POST",
                  body: JSON.stringify({
                    title: assignForm.title,
                    description: assignForm.description,
                    assignedTo: assignForm.assignedTo,
                    deadline: assignForm.deadline,
                    status: "Pending",
                    bonusOpportunity: assignForm.bonusOpportunity || undefined,
                  }),
                });
                setAssignOpen(false);
                setAssignForm({ title: "", description: "", assignedTo: "", deadline: "", bonusOpportunity: "" });
                await refetchTasks();
              }}
            >
              Assign
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {canManageBonusAnnouncements ? (
        <Dialog open={announceOpen} onOpenChange={setAnnounceOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bonus Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <input
                placeholder="Title"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              />
              <textarea
                placeholder="Description"
                rows={2}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body resize-none"
                value={announcementForm.description}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Amount"
                  className="px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
                  value={announcementForm.amount}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, amount: e.target.value })}
                />
                <input
                  type="date"
                  className="px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
                  value={announcementForm.date}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, date: e.target.value })}
                />
              </div>
              <select
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
                value={announcementForm.taskId}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, taskId: e.target.value })}
              >
                <option value="">Link to task (optional)</option>
                {tasks.map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.title}
                  </option>
                ))}
              </select>
              <input
                placeholder="Bonus opportunity text for task (optional)"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
                value={announcementForm.bonusOpportunity}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, bonusOpportunity: e.target.value })}
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                className="bg-secondary text-foreground px-4 py-2 rounded-md text-sm font-heading font-medium"
                onClick={() => setAnnounceOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-bonus text-bonus-foreground px-4 py-2 rounded-md text-sm font-heading font-medium"
                onClick={async () => {
                  await apiFetch("/api/bonus-announcements", {
                    method: "POST",
                    body: JSON.stringify({
                      title: announcementForm.title,
                      description: announcementForm.description,
                      amount: Number(announcementForm.amount),
                      date: announcementForm.date,
                    }),
                  });
                  if (announcementForm.taskId && announcementForm.bonusOpportunity) {
                    await apiFetch(`/api/tasks/${announcementForm.taskId}`, {
                      method: "PUT",
                      body: JSON.stringify({ bonusOpportunity: announcementForm.bonusOpportunity }),
                    });
                    await refetchTasks();
                  }
                  setAnnounceOpen(false);
                  setAnnouncementForm({
                    title: "",
                    description: "",
                    amount: "",
                    date: "",
                    taskId: "",
                    bonusOpportunity: "",
                  });
                  await refetchAnnouncements();
                }}
              >
                Add
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
};

export default AdminDashboard;
