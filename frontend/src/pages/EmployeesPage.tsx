import { useState } from "react";
import { useAuth } from "@/context/useAuth";
import { apiFetch, useApi } from "@/hooks/useApi";
import { Employee } from "@/types/models";
import EmployeeEditDialog from "@/components/EmployeeEditDialog";
import { Pencil, Trash2 } from "lucide-react";
import EmployeeExcelUploadDialog from "@/components/EmployeeExcelUploadDialog";
import { isHighAuthority, isSuperAdmin } from "@/lib/roles";

const createEmptyEmployee = (): Employee => ({
  _id: "",
  name: "",
  email: "",
  department: "",
  tasksAssigned: 0,
  tasksCompleted: 0,
  kpiScore: 0,
  bonusStatus: "Not Applicable",
  weeklyPerformance: [],
  dailyPerformance: [],
});

const EmployeesPage = () => {
  const { user } = useAuth();
  const canManageEmployees = isHighAuthority(user?.role);
  const canUploadViaExcel = isSuperAdmin(user?.role);
  const { data: employees, refetch } = useApi<Employee[]>("/api/employees", []);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Employees</h2>
        {canManageEmployees && (
          <div className="flex items-center gap-3">
            {canUploadViaExcel ? (
              <button
                className="bg-secondary text-foreground px-4 py-2 rounded-md text-sm font-heading font-medium hover:opacity-90 transition-opacity"
                onClick={() => setUploadOpen(true)}
              >
                Upload via Excel
              </button>
            ) : null}
            <button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-heading font-medium hover:opacity-90 transition-opacity"
              onClick={() => setEditingEmployee(createEmptyEmployee())}
            >
              Add Employee
            </button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Name</th>
                <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Email</th>
                <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Department</th>
                <th className="text-center px-6 py-3 font-heading font-medium text-muted-foreground">KPI</th>
                <th className="text-center px-6 py-3 font-heading font-medium text-muted-foreground">Bonus</th>
                {canManageEmployees && <th className="text-right px-6 py-3 font-heading font-medium text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{emp.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{emp.email}</td>
                  <td className="px-6 py-4 text-muted-foreground">{emp.department}</td>
                  <td className="px-6 py-4 text-center font-heading font-semibold">{emp.kpiScore}%</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      emp.bonusStatus === "Awarded" ? "status-completed" :
                      emp.bonusStatus === "Eligible" ? "status-pending" : "bg-secondary text-muted-foreground"
                    }`}>{emp.bonusStatus}</span>
                  </td>
                  {canManageEmployees && (
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
                          await refetch();
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EmployeeEditDialog
        open={!!editingEmployee}
        employee={editingEmployee}
        onOpenChange={(open) => !open && setEditingEmployee(null)}
        onSaved={refetch}
      />

      <EmployeeExcelUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={refetch}
      />
    </div>
  );
};

export default EmployeesPage;
