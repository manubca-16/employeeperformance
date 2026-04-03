import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { Download, FileSpreadsheet, Flag, Pencil, Plus, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import StatusTag from "@/components/StatusTag";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/useAuth";
import { apiFetch, useApi } from "@/hooks/useApi";
import { isEmployee, isHighAuthority, isSuperAdmin } from "@/lib/roles";
import { Employee, Task } from "@/types/models";

type Filters = { employee: string; priority: string; status: string; bonus: string; escalation: string };
type TaskFormState = {
  _id?: string;
  title: string;
  description: string;
  assignedTo: string;
  deadline: string;
  priority: "Low" | "Medium" | "High";
  status: Task["status"];
  taskAssigned: boolean;
  bonusApplicable: boolean;
  escalationFlag: boolean;
  escalationReason: string;
};

const emptyTaskForm: TaskFormState = {
  title: "",
  description: "",
  assignedTo: "",
  deadline: "",
  priority: "Medium",
  status: "Pending",
  taskAssigned: true,
  bonusApplicable: false,
  escalationFlag: false,
  escalationReason: "",
};

const emptyFilters: Filters = { employee: "", priority: "", status: "", bonus: "", escalation: "" };

const formatDate = (value: string) => {
  if (!value) return "No deadline";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const normalizeDateInput = (value: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value.slice(0, 10) : parsed.toISOString().slice(0, 10);
};

const boolLabel = (value?: boolean) => (value ? "Yes" : "No");
const getAssignedEmployee = (task: Task) => (typeof task.assignedTo === "object" ? task.assignedTo : null);

const TasksPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const superAdmin = isSuperAdmin(user?.role);
  const highAuthority = isHighAuthority(user?.role);
  const employeeView = isEmployee(user?.role);
  const { data: tasks, loading, error, refetch } = useApi<Task[]>("/api/tasks", []);
  const { data: employees } = useApi<Employee[]>("/api/employees", []);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskFormState>(emptyTaskForm);
  const [savingTask, setSavingTask] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const canCreateTasks = superAdmin;
  const canDeleteTasks = superAdmin;
  const canExportTasks = superAdmin;
  const canEditTasks = highAuthority;
  const canUpdateOwnStatus = employeeView;

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const assignedEmployee = getAssignedEmployee(task);
        const employeeMatch = !filters.employee || assignedEmployee?._id === filters.employee;
        const priorityMatch = !filters.priority || task.priority === filters.priority;
        const statusMatch = !filters.status || task.status === filters.status;
        const bonusMatch = !filters.bonus || (filters.bonus === "eligible" ? Boolean(task.bonusApplicable) : !task.bonusApplicable);
        const escalationMatch = !filters.escalation || (filters.escalation === "escalated" ? Boolean(task.escalation?.flag) : !task.escalation?.flag);
        return employeeMatch && priorityMatch && statusMatch && bonusMatch && escalationMatch;
      }),
    [filters, tasks],
  );

  const summary = useMemo(
    () =>
      filteredTasks.reduce(
        (accumulator, task) => {
          accumulator.total += 1;
          if (task.status === "Completed") accumulator.completed += 1;
          if (task.status === "In Progress") accumulator.inProgress += 1;
          if (task.escalation?.flag) accumulator.escalated += 1;
          return accumulator;
        },
        { total: 0, completed: 0, inProgress: 0, escalated: 0 },
      ),
    [filteredTasks],
  );

  const openCreateDialog = () => {
    setTaskForm(emptyTaskForm);
    setTaskDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    const assignedEmployee = getAssignedEmployee(task);
    setTaskForm({
      _id: task._id,
      title: task.title,
      description: task.description || "",
      assignedTo: assignedEmployee?._id || "",
      deadline: normalizeDateInput(task.deadline),
      priority: task.priority || "Medium",
      status: task.status,
      taskAssigned: task.taskAssigned ?? true,
      bonusApplicable: Boolean(task.bonusApplicable),
      escalationFlag: Boolean(task.escalation?.flag),
      escalationReason: task.escalation?.reason || "",
    });
    setTaskDialogOpen(true);
  };

  const saveTask = async () => {
    if (!taskForm.title.trim() || !taskForm.assignedTo || !taskForm.deadline) {
      toast.warning("Title, employee, and deadline are required");
      return;
    }

    setSavingTask(true);
    try {
      const payload = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        assignedTo: taskForm.assignedTo,
        deadline: taskForm.deadline,
        priority: taskForm.priority,
        status: taskForm.status,
        taskAssigned: taskForm.taskAssigned,
        bonusApplicable: taskForm.bonusApplicable,
        escalation: { flag: taskForm.escalationFlag, reason: taskForm.escalationReason.trim() },
      };

      if (taskForm._id) {
        await apiFetch(`/api/tasks/${taskForm._id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Task updated");
      } else {
        await apiFetch("/api/tasks", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Task assigned");
      }

      setTaskDialogOpen(false);
      setTaskForm(emptyTaskForm);
      await refetch();
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Failed to save task");
    } finally {
      setSavingTask(false);
    }
  };

  const updateEmployeeTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      await apiFetch(`/api/tasks/${taskId}`, { method: "PUT", body: JSON.stringify({ status }) });
      toast.success("Task status updated");
      await refetch();
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      setSelectedTaskIds((current) => current.filter((id) => id !== taskId));
      toast.success("Task deleted");
      await refetch();
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Failed to delete task");
    }
  };

  const bulkDelete = async () => {
    if (!selectedTaskIds.length || !window.confirm("Delete the selected tasks?")) return;
    try {
      await apiFetch("/api/tasks/bulk-delete", { method: "DELETE", body: JSON.stringify({ taskIds: selectedTaskIds }) });
      setSelectedTaskIds([]);
      toast.success("Selected tasks deleted");
      await refetch();
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Failed to delete tasks");
    }
  };

  const exportTasks = async () => {
    try {
      const XLSX = await import("xlsx");
      const rows = filteredTasks.map((task) => ({
        Title: task.title,
        Description: task.description || "",
        AssignedTo: getAssignedEmployee(task)?.name || "Unknown employee",
        Deadline: formatDate(task.deadline),
        Priority: task.priority || "Medium",
        Status: task.status,
        BonusApplicable: boolLabel(task.bonusApplicable),
        Escalated: boolLabel(task.escalation?.flag),
        EscalationReason: task.escalation?.reason || "",
      }));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Tasks");
      saveAs(new Blob([XLSX.write(workbook, { type: "array", bookType: "xlsx" })]), "tasks-export.xlsx");
    } catch (exportError) {
      toast.error(exportError instanceof Error ? exportError.message : "Failed to export tasks");
    }
  };

  const toggleSelectedTask = (taskId: string, checked: boolean) => {
    setSelectedTaskIds((current) => {
      if (checked) return current.includes(taskId) ? current : [...current, taskId];
      return current.filter((id) => id !== taskId);
    });
  };

  const selectAllVisible = (checked: boolean) => {
    setSelectedTaskIds(checked ? filteredTasks.map((task) => task._id) : []);
  };

  const renderFilters = () => (
    <div className="grid gap-3 md:grid-cols-5">
      {highAuthority ? (
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={filters.employee}
          onChange={(event) => setFilters((current) => ({ ...current, employee: event.target.value }))}
        >
          <option value="">All Employees</option>
          {employees.map((employee) => (
            <option key={employee._id} value={employee._id}>
              {employee.name}
            </option>
          ))}
        </select>
      ) : (
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Your assigned tasks
        </div>
      )}
      <select
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        value={filters.priority}
        onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
      >
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <select
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        value={filters.status}
        onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
      >
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Overdue">Overdue</option>
      </select>
      <select
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        value={filters.bonus}
        onChange={(event) => setFilters((current) => ({ ...current, bonus: event.target.value }))}
      >
        <option value="">All Bonus States</option>
        <option value="eligible">Bonus eligible</option>
        <option value="not-eligible">Not eligible</option>
      </select>
      <select
        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        value={filters.escalation}
        onChange={(event) => setFilters((current) => ({ ...current, escalation: event.target.value }))}
      >
        <option value="">All Escalations</option>
        <option value="escalated">Escalated</option>
        <option value="not-escalated">Not escalated</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold">Tasks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {superAdmin
              ? "Assign, review, export, and clean up tasks across the organization."
              : highAuthority
                ? "Review all employee tasks, escalation flags, and bonus eligibility."
                : "Track your assigned work, deadlines, bonus eligibility, and escalation notices."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {superAdmin ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-heading font-medium text-foreground"
              onClick={() => navigate("/dashboard/tasks/upload")}
            >
              <UploadCloud size={16} />
              Upload Tasks
            </button>
          ) : null}
          {canExportTasks ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-heading font-medium text-foreground"
              onClick={() => void exportTasks()}
            >
              <Download size={16} />
              Export
            </button>
          ) : null}
          {canCreateTasks ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-heading font-medium text-primary-foreground"
              onClick={openCreateDialog}
            >
              <Plus size={16} />
              Assign Task
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Visible Tasks</p>
          <p className="mt-1 text-2xl font-heading font-bold">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="mt-1 text-2xl font-heading font-bold">{summary.completed}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <p className="mt-1 text-2xl font-heading font-bold">{summary.inProgress}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Escalated</p>
          <p className="mt-1 text-2xl font-heading font-bold">{summary.escalated}</p>
        </div>
      </div>

      {renderFilters()}

      {canDeleteTasks && selectedTaskIds.length > 0 ? (
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-data-red px-4 py-2 text-sm font-heading font-medium text-white"
            onClick={bulkDelete}
          >
            <Trash2 size={16} />
            Delete Selected ({selectedTaskIds.length})
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-md bg-secondary/70" />
            ))}
          </div>
        ) : error ? (
          <div className="space-y-3 p-8 text-center">
            <p className="text-sm text-data-red">{error}</p>
            {error.toLowerCase().includes("auth") || error.toLowerCase().includes("token") ? (
              <button
                type="button"
                className="rounded-md bg-primary px-4 py-2 text-sm font-heading font-medium text-primary-foreground"
                onClick={() => navigate("/signin")}
              >
                Sign In Again
              </button>
            ) : (
              <button
                type="button"
                className="rounded-md bg-secondary px-4 py-2 text-sm font-heading font-medium text-foreground"
                onClick={() => void refetch()}
              >
                Retry
              </button>
            )}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <FileSpreadsheet size={24} />
            </div>
            <p className="font-heading font-semibold">No tasks found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {employeeView ? "You do not have any tasks matching these filters right now." : "No task records match the current filters."}
            </p>
          </div>
        ) : employeeView ? (
          <div className="grid gap-4 p-4 md:grid-cols-2">
            {filteredTasks.map((task) => (
              <div key={task._id} className="rounded-xl border border-border bg-background p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-heading font-semibold">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.description || "No description provided."}</p>
                  </div>
                  <StatusTag status={task.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                    {task.priority || "Medium"} Priority
                  </span>
                  {task.bonusApplicable ? (
                    <span className="rounded-full bg-data-green/10 px-2.5 py-1 text-xs font-medium text-data-green">
                      Bonus Eligible
                    </span>
                  ) : null}
                </div>
                {task.escalation?.flag ? (
                  <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                    <p className="font-heading font-semibold">Escalation Notice</p>
                    <p className="mt-1">{task.escalation.reason || "This task has been escalated."}</p>
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Deadline: {formatDate(task.deadline)}</p>
                  {canUpdateOwnStatus ? (
                    <select
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                      value={task.status}
                      onChange={(event) => void updateEmployeeTaskStatus(task._id, event.target.value as Task["status"])}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-sm">
              <thead className="bg-secondary/60">
                <tr>
                  {canDeleteTasks ? (
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length}
                        onChange={(event) => selectAllVisible(event.target.checked)}
                      />
                    </th>
                  ) : null}
                  <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Assigned To</th>
                  <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Deadline</th>
                  <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Priority</th>
                  <th className="px-4 py-3 text-center font-heading font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-center font-heading font-medium text-muted-foreground">Bonus</th>
                  <th className="px-4 py-3 text-center font-heading font-medium text-muted-foreground">Escalation</th>
                  {canEditTasks || canDeleteTasks ? (
                    <th className="px-4 py-3 text-right font-heading font-medium text-muted-foreground">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const assignedEmployee = getAssignedEmployee(task);
                  return (
                    <tr key={task._id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                      {canDeleteTasks ? (
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedTaskIds.includes(task._id)}
                            onChange={(event) => toggleSelectedTask(task._id, event.target.checked)}
                          />
                        </td>
                      ) : null}
                      <td className="px-4 py-4">
                        <p className="font-medium">{task.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{task.description || "No description provided."}</p>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{assignedEmployee?.name || "Unknown employee"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{formatDate(task.deadline)}</td>
                      <td className="px-4 py-4">{task.priority || "Medium"}</td>
                      <td className="px-4 py-4 text-center">
                        <StatusTag status={task.status} />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            task.bonusApplicable ? "bg-data-green/10 text-data-green" : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {boolLabel(task.bonusApplicable)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {task.escalation?.flag ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 text-amber-600"
                            onClick={() => setDetailTask(task)}
                          >
                            <Flag size={16} />
                            View
                          </button>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      {canEditTasks || canDeleteTasks ? (
                        <td className="px-4 py-4 text-right">
                          {canEditTasks ? (
                            <button
                              type="button"
                              className="rounded-md p-1.5 text-primary hover:bg-secondary"
                              onClick={() => openEditDialog(task)}
                            >
                              <Pencil size={16} />
                            </button>
                          ) : null}
                          {canDeleteTasks ? (
                            <button
                              type="button"
                              className="ml-1 rounded-md p-1.5 text-data-red hover:bg-secondary"
                              onClick={() => void deleteTask(task._id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : null}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{taskForm._id ? "Edit Task" : "Assign Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Task title"
              value={taskForm.title}
              onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
            />
            <textarea
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Description"
              value={taskForm.description}
              onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
            />
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={taskForm.assignedTo}
              onChange={(event) => setTaskForm((current) => ({ ...current, assignedTo: event.target.value }))}
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} ({employee.employeeId || employee.department})
                </option>
              ))}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="date"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={taskForm.deadline}
                onChange={(event) => setTaskForm((current) => ({ ...current, deadline: event.target.value }))}
              />
              <select
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={taskForm.priority}
                onChange={(event) => setTaskForm((current) => ({ ...current, priority: event.target.value as TaskFormState["priority"] }))}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <select
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={taskForm.status}
                onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value as Task["status"] }))}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
              <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={taskForm.taskAssigned}
                  onChange={(event) => setTaskForm((current) => ({ ...current, taskAssigned: event.target.checked }))}
                />
                Task Assigned
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={taskForm.bonusApplicable}
                  onChange={(event) => setTaskForm((current) => ({ ...current, bonusApplicable: event.target.checked }))}
                />
                Bonus Applicable
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={taskForm.escalationFlag}
                  onChange={(event) => setTaskForm((current) => ({ ...current, escalationFlag: event.target.checked }))}
                />
                Escalated
              </label>
            </div>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Escalation reason"
              value={taskForm.escalationReason}
              onChange={(event) => setTaskForm((current) => ({ ...current, escalationReason: event.target.value }))}
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              className="rounded-md bg-secondary px-4 py-2 text-sm font-heading font-medium text-foreground"
              onClick={() => setTaskDialogOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-heading font-medium text-primary-foreground disabled:opacity-50"
              onClick={() => void saveTask()}
              disabled={savingTask}
            >
              {savingTask ? "Saving..." : taskForm._id ? "Save Changes" : "Assign Task"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailTask} onOpenChange={(open) => !open && setDetailTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalation Details</DialogTitle>
          </DialogHeader>
          {detailTask ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-heading font-semibold">{detailTask.title}</p>
                <p className="text-muted-foreground">{detailTask.description || "No description provided."}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-border p-3">
                  <p className="text-muted-foreground">Deadline</p>
                  <p className="font-medium">{formatDate(detailTask.deadline)}</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="text-muted-foreground">Priority</p>
                  <p className="font-medium">{detailTask.priority || "Medium"}</p>
                </div>
              </div>
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
                <p className="font-heading font-semibold text-amber-900">Escalation Reason</p>
                <p className="mt-1 text-amber-900">{detailTask.escalation?.reason || "No reason provided."}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;
