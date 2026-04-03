import { Employee } from "@/types/models";
import { useState } from "react";

interface PerformanceCardProps {
  employee: Employee;
}

const PerformanceCard = ({ employee }: PerformanceCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      {/* Main card */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`kpi-card cursor-pointer transition-all duration-300 ${
          expanded ? "opacity-40 blur-[1px]" : ""
        }`}
      >
        <p className="font-heading font-semibold">{employee.name}</p>
        <p className="text-sm text-muted-foreground">{employee.department}</p>
        <div className="mt-3 flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground">KPI Score</p>
            <p className="text-lg font-heading font-bold">{employee.kpiScore}%</p>
          </div>
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-data-green rounded-full transition-all duration-500"
              style={{ width: `${employee.kpiScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expanded overlay */}
      {expanded && (
        <div className="absolute inset-0 z-10 flex gap-4">
          {/* Performance Card */}
          <div className="flex-1 kpi-card animate-in fade-in duration-300">
            <h4 className="font-heading font-semibold text-sm mb-3">Performance</h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Daily Avg</p>
                <p className="font-heading font-bold">
                  {Math.round(employee.dailyPerformance.reduce((a, b) => a + b, 0) / employee.dailyPerformance.length)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Weekly Avg</p>
                <p className="font-heading font-bold">
                  {Math.round(employee.weeklyPerformance.reduce((a, b) => a + b, 0) / employee.weeklyPerformance.length)}%
                </p>
              </div>
            </div>
          </div>

          {/* Bonus Card */}
          <div className="flex-1 kpi-card animate-in fade-in duration-300 border-bonus/30">
            <h4 className="font-heading font-semibold text-sm mb-3 text-bonus">Bonus</h4>
            {employee.bonus ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">{employee.bonus.title}</p>
                <p className="text-xl font-heading font-bold text-bonus">₹{employee.bonus.amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{employee.bonus.date}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Bonus Not Applicable</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceCard;
