const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    legacyId: { type: String, index: true },
    text: { type: String, required: true },
    timestamp: { type: String, required: true },
    type: { type: String, enum: ["task", "bonus", "performance"], required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", ActivitySchema);
