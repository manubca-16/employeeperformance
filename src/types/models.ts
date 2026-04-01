export type Role = "SUPERADMIN" | "ADMIN" | "HR" | "EMPLOYEE";

export interface User {
  _id: string;
  legacyId?: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatar?: string;
}

export interface Bonus {
  _id: string;
  legacyId?: string;
  title: string;
  amount: number;
  date: string;
  employeeId: string | Employee;
}

export interface Employee {
  _id: string;
  legacyId?: string;
  employeeId?: string;
  name: string;
  email: string;
  role?: Role;
  department: string;
  tasksAssigned: number;
  tasksCompleted: number;
  kpiScore: number;
  bonusStatus: "Eligible" | "Not Applicable" | "Awarded";
  weeklyPerformance: number[];
  dailyPerformance: number[];
  bonus?: Bonus;
}

export interface Task {
  _id: string;
  legacyId?: string;
  title: string;
  description: string;
  assignedTo: string | Employee;
  deadline: string;
  priority?: "Low" | "Medium" | "High";
  status: "Completed" | "Pending" | "Overdue" | "In Progress";
  taskAssigned?: boolean;
  bonusApplicable?: boolean;
  bonusOpportunity?: string;
  escalation?: {
    flag: boolean;
    reason: string;
  };
  uploadedBy?: string | User;
}

export interface BonusAnnouncement {
  _id: string;
  legacyId?: string;
  title: string;
  description: string;
  amount: number;
  date: string;
}

export interface ActivityItem {
  _id: string;
  legacyId?: string;
  text: string;
  timestamp: string;
  type: "task" | "bonus" | "performance";
}
