const mongoose = require("mongoose");

const BonusSchema = new mongoose.Schema(
  {
    legacyId: { type: String, index: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bonus", BonusSchema);
