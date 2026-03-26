const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    legacyId: { type: String, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ["Completed", "Pending", "Overdue"], required: true },
    bonusOpportunity: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
