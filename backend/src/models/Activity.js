const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    legacyId: { type: String, index: true },
    text: { type: String, required: true },
    timestamp: { type: String, required: true },
    type: { type: String, enum: ["task", "bonus", "performance"], required: true },
    actorName: { type: String },
    actorRole: { type: String, enum: ["SUPERADMIN", "ADMIN", "HR", "EMPLOYEE"] },
    visibility: {
      type: String,
      enum: ["ALL", "SUPERADMIN"],
      default: "ALL"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", ActivitySchema);
