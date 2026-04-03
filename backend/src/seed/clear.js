const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Employee = require("../models/Employee");
const Task = require("../models/Task");
const Bonus = require("../models/Bonus");
const BonusAnnouncement = require("../models/BonusAnnouncement");
const Activity = require("../models/Activity");

const run = async () => {
  try {
    await connectDB();
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Task.deleteMany({}),
      Bonus.deleteMany({}),
      BonusAnnouncement.deleteMany({}),
      Activity.deleteMany({}),
    ]);
    console.log("All collections cleared.");
  } catch (error) {
    console.error("Clear failed", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
