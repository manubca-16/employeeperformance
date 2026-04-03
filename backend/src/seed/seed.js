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
const seedData = require("./seedData");
const bcrypt = require("bcryptjs");

const run = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Task.deleteMany({}),
      Bonus.deleteMany({}),
      BonusAnnouncement.deleteMany({}),
      Activity.deleteMany({})
    ]);

    const users = [];
    for (const user of seedData.users) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      users.push({ ...user, passwordHash });
    }
    const userDocs = await User.insertMany(users.map(({ password, ...rest }) => rest));
    const userByLegacyId = {};
    const userByEmail = {};
    userDocs.forEach((user) => {
      if (user.legacyId) {
        userByLegacyId[user.legacyId] = user;
      }
      userByEmail[user.email] = user;
    });

    const employeeDocs = await Employee.insertMany(
      seedData.employees.map((employee) => ({
        ...employee,
        userId:
          userByLegacyId[employee.legacyId]?._id ||
          userByEmail[employee.email]?._id
      }))
    );
    const employeeByLegacyId = {};
    employeeDocs.forEach((employee) => {
      employeeByLegacyId[employee.legacyId] = employee;
    });

    const bonuses = seedData.bonuses.map((bonus) => ({
      legacyId: bonus.legacyId,
      title: bonus.title,
      amount: bonus.amount,
      date: bonus.date,
      employeeId: employeeByLegacyId[bonus.employeeLegacyId]._id
    }));
    const bonusDocs = await Bonus.insertMany(bonuses);

    await Promise.all(
      bonusDocs.map((bonusDoc) =>
        Employee.updateOne(
          { _id: bonusDoc.employeeId },
          { $set: { bonus: bonusDoc._id } }
        )
      )
    );

    const tasks = seedData.tasks.map((task) => ({
      legacyId: task.legacyId,
      title: task.title,
      description: task.description,
      assignedTo: employeeByLegacyId[task.assignedToLegacyId]._id,
      deadline: task.deadline,
      status: task.status,
      bonusOpportunity: task.bonusOpportunity
    }));
    await Task.insertMany(tasks);

    await BonusAnnouncement.insertMany(seedData.bonusAnnouncements);
    await Activity.insertMany(seedData.activities);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Seed failed", error);
  } finally {
    await mongoose.connection.close();
  }
};

run();
