const Employee = require("../models/Employee");
const mongoose = require("mongoose");
const { parsePagination } = require("../utils/pagination");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

exports.list = async (req, res, next) => {
  try {
    const { limit, skip } = parsePagination(req);
    const filter = {};
    if (req.query.department) {
      filter.department = req.query.department;
    }

    const employees = await Employee.find(filter)
      .populate("bonus")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(employees);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const employee = await Employee.findOne(query).populate("bonus");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, department } = req.body;
    if (!name || !email || !department) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const employee = await Employee.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true
    }).populate("bonus");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const employee = await Employee.findOneAndDelete(query);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Employee deleted" });
  } catch (error) {
    next(error);
  }
};
