import { useAuth } from "@/context/useAuth";
import PerformanceCard from "@/components/PerformanceCard";
import { useApi } from "@/hooks/useApi";
import { Employee } from "@/types/models";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PerformancePage = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === "EMPLOYEE";
  const { data: employees } = useApi<Employee[]>("/api/employees", []);

  const visibleEmployees = isEmployee
    ? employees.filter((e) => e.email === user?.email)
    : employees;

  const avgWeekly =
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
      <h2 className="text-xl font-heading font-bold">Performance</h2>

      {!isEmployee && avgWeekly.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-heading font-semibold mb-6">Organization Average</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={avgWeekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#16A34A" strokeWidth={2} dot={{ fill: "#16A34A", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleEmployees.map((emp) => (
          <PerformanceCard key={emp._id} employee={emp} />
        ))}
      </div>
    </div>
  );
};

export default PerformancePage;
