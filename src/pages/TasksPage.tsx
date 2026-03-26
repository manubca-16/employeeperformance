import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { Employee, Task } from "@/types/models";
import StatusTag from "@/components/StatusTag";

const TasksPage = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === "EMPLOYEE";
  const { data: tasks } = useApi<Task[]>("/api/tasks", []);

  const filteredTasks = isEmployee
    ? tasks.filter((t) => {
        const assigned = t.assignedTo as Employee | string;
        return typeof assigned === "object" ? assigned.email === user?.email : false;
      })
    : tasks;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Tasks</h2>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {filteredTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Task</th>
                  {!isEmployee && (
                    <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Assigned To</th>
                  )}
                  <th className="text-left px-6 py-3 font-heading font-medium text-muted-foreground">Deadline</th>
                  <th className="text-center px-6 py-3 font-heading font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => {
                  const assigned = t.assignedTo as Employee | string;
                  return (
                    <tr key={t._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium">{t.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                        {t.bonusOpportunity && (
                          <p className="text-xs text-bonus font-medium mt-1">{t.bonusOpportunity}</p>
                        )}
                      </td>
                      {!isEmployee && (
                        <td className="px-6 py-4 text-muted-foreground">
                          {typeof assigned === "object" ? assigned.name : "-"}
                        </td>
                      )}
                      <td className="px-6 py-4 text-muted-foreground">{t.deadline}</td>
                      <td className="px-6 py-4 text-center">
                        <StatusTag status={t.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground font-body italic">No tasks assigned yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
