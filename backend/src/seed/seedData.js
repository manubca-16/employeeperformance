module.exports = {
  users: [
    {
      legacyId: "u1",
      name: "Super Admin",
      email: "superadmin@company.com",
      role: "SUPERADMIN",
      department: "Management",
      password: "SuperAdmin@123"
    },
    {
      legacyId: "u2",
      name: "HR Manager",
      email: "hr@company.com",
      role: "HR",
      department: "Human Resources",
      password: "HRMaster@123"
    },
    {
      legacyId: "e1",
      name: "Priya Patel",
      email: "priya@company.com",
      role: "EMPLOYEE",
      department: "Engineering",
      password: "Priya@123"
    }
  ],
  employees: [
    {
      legacyId: "e1",
      employeeId: "EMP-001",
      name: "Priya Patel",
      email: "priya@company.com",
      role: "EMPLOYEE",
      department: "Engineering",
      tasksAssigned: 12,
      tasksCompleted: 10,
      kpiScore: 88,
      bonusStatus: "Not Applicable",
      weeklyPerformance: [72, 78, 85, 82, 88, 90, 88],
      dailyPerformance: [80, 85, 78, 92, 88]
    }
  ],
  tasks: [],
  bonuses: [],
  bonusAnnouncements: [],
  activities: []
};
