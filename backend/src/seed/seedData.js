module.exports = {
  users: [
    {
      legacyId: "u1",
      name: "Super Admin",
      email: "superadmin@company.com",
      role: "SUPERADMIN",
      department: "Management",
      password: "SuperAdmin@123"
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
      bonusStatus: "Awarded",
      weeklyPerformance: [72, 78, 85, 82, 88, 90, 88],
      dailyPerformance: [80, 85, 78, 92, 88]
    },
    {
      legacyId: "e2",
      employeeId: "EMP-002",
      name: "Arjun Mehta",
      email: "arjun@company.com",
      role: "EMPLOYEE",
      department: "Design",
      tasksAssigned: 8,
      tasksCompleted: 6,
      kpiScore: 75,
      bonusStatus: "Eligible",
      weeklyPerformance: [65, 68, 72, 70, 75, 73, 75],
      dailyPerformance: [70, 72, 68, 76, 74]
    },
    {
      legacyId: "e3",
      employeeId: "EMP-003",
      name: "Sneha Reddy",
      email: "sneha@company.com",
      role: "EMPLOYEE",
      department: "Marketing",
      tasksAssigned: 10,
      tasksCompleted: 10,
      kpiScore: 95,
      bonusStatus: "Awarded",
      weeklyPerformance: [85, 88, 90, 92, 95, 94, 95],
      dailyPerformance: [90, 92, 88, 96, 94]
    },
    {
      legacyId: "e4",
      employeeId: "EMP-004",
      name: "Vikram Singh",
      email: "vikram@company.com",
      role: "EMPLOYEE",
      department: "Engineering",
      tasksAssigned: 15,
      tasksCompleted: 11,
      kpiScore: 70,
      bonusStatus: "Not Applicable",
      weeklyPerformance: [60, 65, 68, 72, 70, 68, 70],
      dailyPerformance: [65, 68, 62, 74, 70]
    },
    {
      legacyId: "e5",
      employeeId: "EMP-005",
      name: "Kavitha Nair",
      email: "kavitha@company.com",
      role: "EMPLOYEE",
      department: "Sales",
      tasksAssigned: 9,
      tasksCompleted: 8,
      kpiScore: 82,
      bonusStatus: "Eligible",
      weeklyPerformance: [75, 78, 80, 82, 84, 80, 82],
      dailyPerformance: [78, 80, 76, 85, 82]
    },
    {
      legacyId: "e6",
      employeeId: "EMP-006",
      name: "Rahul Desai",
      email: "rahul@company.com",
      role: "EMPLOYEE",
      department: "Engineering",
      tasksAssigned: 11,
      tasksCompleted: 9,
      kpiScore: 79,
      bonusStatus: "Not Applicable",
      weeklyPerformance: [70, 72, 75, 78, 80, 77, 79],
      dailyPerformance: [74, 76, 72, 82, 78]
    }
  ],
  tasks: [
    {
      legacyId: "t1",
      title: "Complete Q3 Report",
      description: "Prepare and submit the quarterly performance report.",
      assignedToLegacyId: "e1",
      deadline: "2026-03-15",
      status: "Completed"
    },
    {
      legacyId: "t2",
      title: "Design Landing Page",
      description: "Create mockups for the new product landing page.",
      assignedToLegacyId: "e2",
      deadline: "2026-03-12",
      status: "Pending"
    },
    {
      legacyId: "t3",
      title: "Marketing Campaign Analysis",
      description: "Analyze results of the February marketing campaign.",
      assignedToLegacyId: "e3",
      deadline: "2026-03-10",
      status: "Completed"
    },
    {
      legacyId: "t4",
      title: "API Integration",
      description: "Integrate payment gateway API into the platform.",
      assignedToLegacyId: "e4",
      deadline: "2026-03-08",
      status: "Overdue"
    },
    {
      legacyId: "t5",
      title: "Client Presentation",
      description: "Prepare slides for the upcoming client meeting.",
      assignedToLegacyId: "e5",
      deadline: "2026-03-14",
      status: "Pending"
    },
    {
      legacyId: "t6",
      title: "Code Review Sprint",
      description: "Review and approve pending pull requests.",
      assignedToLegacyId: "e6",
      deadline: "2026-03-11",
      status: "Pending",
      bonusOpportunity: "Complete by March 10 to earn INR 1500 bonus"
    },
    {
      legacyId: "t7",
      title: "Database Optimization",
      description: "Optimize slow database queries for the reporting module.",
      assignedToLegacyId: "e1",
      deadline: "2026-03-18",
      status: "Pending",
      bonusOpportunity: "Complete early to earn INR 2000 bonus"
    },
    {
      legacyId: "t8",
      title: "User Research Interviews",
      description: "Conduct 5 user interviews for the new feature.",
      assignedToLegacyId: "e2",
      deadline: "2026-03-16",
      status: "Pending"
    }
  ],
  bonuses: [
    {
      legacyId: "b1",
      title: "Q3 Excellence Award",
      amount: 5000,
      date: "2026-03-01",
      employeeLegacyId: "e1"
    },
    {
      legacyId: "b2",
      title: "Top Performer Bonus",
      amount: 8000,
      date: "2026-03-05",
      employeeLegacyId: "e3"
    }
  ],
  bonusAnnouncements: [
    {
      legacyId: "ba1",
      title: "Early Completion Bonus",
      description: "Complete the client report before March 12 to earn INR 1500 bonus.",
      amount: 1500,
      date: "2026-03-06"
    },
    {
      legacyId: "ba2",
      title: "Sprint Excellence Reward",
      description: "Top performer in the current sprint receives INR 3000.",
      amount: 3000,
      date: "2026-03-04"
    },
    {
      legacyId: "ba3",
      title: "Innovation Challenge",
      description: "Submit a process improvement idea to earn INR 2000 bonus.",
      amount: 2000,
      date: "2026-03-02"
    }
  ],
  activities: [
    {
      legacyId: "a1",
      text: "Priya Patel completed 'Q3 Report'",
      timestamp: "2 min ago",
      type: "task"
    },
    {
      legacyId: "a2",
      text: "Sneha Reddy awarded INR 8000 bonus",
      timestamp: "15 min ago",
      type: "bonus"
    },
    {
      legacyId: "a3",
      text: "Vikram Singh assigned 'API Integration'",
      timestamp: "1 hr ago",
      type: "task"
    },
    {
      legacyId: "a4",
      text: "Weekly performance scores updated",
      timestamp: "2 hrs ago",
      type: "performance"
    },
    {
      legacyId: "a5",
      text: "New bonus announcement created",
      timestamp: "3 hrs ago",
      type: "bonus"
    },
    {
      legacyId: "a6",
      text: "Kavitha Nair completed 'Sales Audit'",
      timestamp: "4 hrs ago",
      type: "task"
    }
  ]
};
