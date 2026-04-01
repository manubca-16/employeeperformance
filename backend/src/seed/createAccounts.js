const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../../.env") });

const User = require("../models/User");
const Employee = require("../models/Employee");

const createAccounts = async () => {
  try {
    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
      throw new Error("MONGODB_URI not found in .env");
    }

    await mongoose.connect(mongodbUri);
    console.log("Connected to MongoDB...");

    // Password for both accounts
    const password = "Password123";
    const passwordHash = await bcrypt.hash(password, 10);

    // 1. Create Superadmin Account
    const superadminData = {
      name: "Super Admin",
      email: "superadmin@company.com",
      role: "SUPERADMIN",
      department: "Administration",
      passwordHash: passwordHash,
      legacyId: "sa1"
    };

    const superadminUser = await User.findOneAndUpdate(
      { email: superadminData.email },
      superadminData,
      { upsert: true, new: true }
    );
    console.log(`Superadmin account created/updated: ${superadminUser.email}`);

    // 2. Create HR Account
    const hrData = {
      name: "HR Manager",
      email: "hr@company.com",
      role: "HR",
      department: "Human Resources",
      passwordHash: passwordHash,
      legacyId: "hr1"
    };

    const hrUser = await User.findOneAndUpdate(
      { email: hrData.email },
      hrData,
      { upsert: true, new: true }
    );
    console.log(`HR account created/updated: ${hrUser.email}`);

    // 3. Create Employee Account
    const employeeUserData = {
      name: "John Doe",
      email: "john.doe@company.com",
      role: "EMPLOYEE",
      department: "Engineering",
      passwordHash: passwordHash,
      legacyId: "e101"
    };

    const employeeUser = await User.findOneAndUpdate(
      { email: employeeUserData.email },
      employeeUserData,
      { upsert: true, new: true }
    );
    console.log(`Employee user account created/updated: ${employeeUser.email}`);

    // 4. Create/Update Employee Record for John Doe
    const employeeProfileData = {
      legacyId: "e101",
      employeeId: "EMP-101",
      name: "John Doe",
      email: "john.doe@company.com",
      role: "EMPLOYEE",
      department: "Engineering",
      tasksAssigned: 5,
      tasksCompleted: 3,
      kpiScore: 85,
      bonusStatus: "Eligible",
      weeklyPerformance: [70, 75, 80, 85, 85, 85, 85],
      dailyPerformance: [80, 82, 85, 84, 85]
    };

    const employeeProfile = await Employee.findOneAndUpdate(
      { email: employeeProfileData.email },
      employeeProfileData,
      { upsert: true, new: true }
    );
    console.log(`Employee profile created/updated: ${employeeProfile.email}`);

    console.log("\nAccounts created successfully!");
    console.log("----------------------------");
    console.log(`Superadmin Email: ${superadminData.email}`);
    console.log(`HR Email: ${hrData.email}`);
    console.log(`Employee Email: ${employeeUserData.email}`);
    console.log(`Password: ${password}`);
    console.log("----------------------------");

  } catch (error) {
    console.error("Error creating accounts:", error);
  } finally {
    await mongoose.connection.close();
  }
};

createAccounts();
