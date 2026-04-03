const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const signToken = (user) => {
  const secret = process.env.JWT_SECRET || "dev_secret";
  return jwt.sign({ sub: user._id, role: user.role }, secret, { expiresIn: "7d" });
};

exports.login = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    res.json({ user: user.toJSON(), token });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const { name, email, password, role, department, avatar, legacyId } = req.body;
    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      role,
      department,
      avatar,
      legacyId,
      passwordHash
    });

    const token = signToken(user);
    res.status(201).json({ user: user.toJSON(), token });
  } catch (error) {
    next(error);
  }
};
