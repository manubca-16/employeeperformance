const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema(
  {
    legacyId: { type: String, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    tasksAssigned: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    kpiScore: { type: Number, default: 0 },
    bonusStatus: {
      type: String,
      enum: ["Eligible", "Not Applicable", "Awarded"],
      default: "Not Applicable"
    },
    weeklyPerformance: { type: [Number], default: [] },
    dailyPerformance: { type: [Number], default: [] },
    bonus: { type: mongoose.Schema.Types.ObjectId, ref: "Bonus" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", EmployeeSchema);
