import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "bonus";
}

const KpiCard = ({ title, value, icon: Icon, trend, variant = "default" }: KpiCardProps) => {
  const isBonus = variant === "bonus";
  return (
    <div className={`kpi-card ${isBonus ? "border-bonus/30" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-body">{title}</p>
          <p className={`text-2xl font-heading font-bold mt-1 ${isBonus ? "text-bonus" : ""}`}>{value}</p>
          {trend && <p className="text-xs text-data-green font-medium mt-1">{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isBonus ? "bg-bonus/10" : "bg-secondary"}`}>
          <Icon size={24} className={isBonus ? "text-bonus" : "text-muted-foreground"} />
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
