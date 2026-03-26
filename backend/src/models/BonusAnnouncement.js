const mongoose = require("mongoose");

const BonusAnnouncementSchema = new mongoose.Schema(
  {
    legacyId: { type: String, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BonusAnnouncement", BonusAnnouncementSchema);
