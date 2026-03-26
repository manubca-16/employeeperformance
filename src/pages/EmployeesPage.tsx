import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, useApi } from "@/hooks/useApi";
import { Employee } from "@/types/models";
import EmployeeEditDialog from "@/components/EmployeeEditDialog";
import { Pencil, Trash2 } from "lucide-react";

const EmployeesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data: employees, refetch } = useApi<Employee[]>("/api/employees", []);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Employees</h2>
        {isAdmin && (
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-heading font-medium hover:opacity-90 transition-opacity">
            Add Employee
          </button>
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
                {isAdmin && <th className="text-right px-6 py-3 font-heading font-medium text-muted-foreground">Actions</th>}
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
                  {isAdmin && (
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
    </div>
  );
};

export default EmployeesPage;
