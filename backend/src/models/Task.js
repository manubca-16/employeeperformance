const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    legacyId: { type: String, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    deadline: { type: Date, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: { type: String, enum: ["Completed", "Pending", "Overdue"], required: true },
    taskAssigned: { type: Boolean, default: true },
    bonusApplicable: { type: Boolean, default: false },
    bonusOpportunity: { type: String },
    escalation: {
      flag: { type: Boolean, default: false },
      reason: { type: String, default: "" },
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
