export type Role = "ADMIN" | "HR" | "EMPLOYEE";

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
  name: string;
  email: string;
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
  status: "Completed" | "Pending" | "Overdue";
  bonusOpportunity?: string;
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
