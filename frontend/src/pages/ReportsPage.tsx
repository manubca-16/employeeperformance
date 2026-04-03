import { useApi } from "@/hooks/useApi";
import { Employee } from "@/types/models";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ReportsPage = () => {
  const { data: employees } = useApi<Employee[]>("/api/employees", []);

  const deptMap = new Map<string, { sum: number; count: number }>();
  employees.forEach((emp) => {
    const entry = deptMap.get(emp.department) || { sum: 0, count: 0 };
    entry.sum += emp.kpiScore;
    entry.count += 1;
    deptMap.set(emp.department, entry);
  });

  const deptData = Array.from(deptMap.entries()).map(([name, { sum, count }]) => ({
    name,
    avg: count ? Math.round(sum / count) : 0,
  }));

  const avgKpi = employees.length
    ? Math.round(employees.reduce((acc, emp) => acc + emp.kpiScore, 0) / employees.length)
    : 0;

  const bonusesAwarded = employees.filter((emp) => emp.bonus).length;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-bold">Reports</h2>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-heading font-semibold mb-6">Department Performance</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={deptData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
            <Tooltip />
            <Bar dataKey="avg" fill="#22C55E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-heading font-semibold mb-4">Summary</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Total Employees</p>
            <p className="text-2xl font-heading font-bold mt-1">{employees.length}</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Avg KPI Score</p>
            <p className="text-2xl font-heading font-bold mt-1">{avgKpi}%</p>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Bonuses Awarded</p>
            <p className="text-2xl font-heading font-bold mt-1">{bonusesAwarded}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
