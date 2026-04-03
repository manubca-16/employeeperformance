const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { parsePagination } = require("../utils/pagination");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

exports.list = async (req, res, next) => {
  try {
    const { limit, skip } = parsePagination(req);
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
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

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const updates = { ...req.body };

    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    const user = await User.findOneAndUpdate(query, updates, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const user = await User.findOneAndDelete(query);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};
