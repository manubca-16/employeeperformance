import { useEffect, useState } from "react";
import { Employee } from "@/types/models";
import { apiFetch } from "@/hooks/useApi";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EmployeeEditDialogProps {
  open: boolean;
  employee: Employee | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const EmployeeEditDialog = ({ open, employee, onOpenChange, onSaved }: EmployeeEditDialogProps) => {
  const [form, setForm] = useState<Employee | null>(employee);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(employee);
  }, [employee]);

  if (!form) {
    return null;
  }

  const updateField = (key: keyof Employee, value: string | number) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await apiFetch(`/api/employees/${form._id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          department: form.department,
          tasksAssigned: form.tasksAssigned,
          tasksCompleted: form.tasksCompleted,
          kpiScore: form.kpiScore,
          bonusStatus: form.bonusStatus,
        }),
      });
      onSaved();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-heading font-medium">Name</label>
            <input
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-heading font-medium">Email</label>
            <input
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-heading font-medium">Department</label>
            <input
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
              value={form.department}
              onChange={(e) => updateField("department", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-heading font-medium">Tasks Assigned</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
                value={form.tasksAssigned}
                onChange={(e) => updateField("tasksAssigned", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-heading font-medium">Tasks Completed</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
                value={form.tasksCompleted}
                onChange={(e) => updateField("tasksCompleted", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-heading font-medium">KPI Score</label>
              <input
                type="number"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
                value={form.kpiScore}
                onChange={(e) => updateField("kpiScore", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-heading font-medium">Bonus Status</label>
              <select
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm font-body"
                value={form.bonusStatus}
                onChange={(e) => updateField("bonusStatus", e.target.value)}
              >
                <option value="Not Applicable">Not Applicable</option>
                <option value="Eligible">Eligible</option>
                <option value="Awarded">Awarded</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            className="bg-secondary text-foreground px-4 py-2 rounded-md text-sm font-heading font-medium"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-heading font-medium"
            onClick={handleSave}
            disabled={saving}
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeEditDialog;
