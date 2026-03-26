const Bonus = require("../models/Bonus");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");
const { parsePagination } = require("../utils/pagination");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const resolveEmployeeId = async (employeeId, employeeLegacyId) => {
  if (employeeId) {
    return employeeId;
  }
  if (employeeLegacyId) {
    const employee = await Employee.findOne({ legacyId: employeeLegacyId });
    return employee ? employee._id : null;
  }
  return null;
};

exports.list = async (req, res, next) => {
  try {
    const { limit, skip } = parsePagination(req);
    const filter = {};
    if (req.query.employeeId) {
      filter.employeeId = req.query.employeeId;
    }
    if (req.query.employeeLegacyId) {
      const employee = await Employee.findOne({ legacyId: req.query.employeeLegacyId });
      if (employee) {
        filter.employeeId = employee._id;
      }
    }

    const bonuses = await Bonus.find(filter)
      .populate("employeeId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(bonuses);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const bonus = await Bonus.findOne(query).populate("employeeId");
    if (!bonus) {
      return res.status(404).json({ message: "Bonus not found" });
    }
    res.json(bonus);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, amount, date, employeeId, employeeLegacyId } = req.body;
    if (!title || amount === undefined || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const resolvedId = await resolveEmployeeId(employeeId, employeeLegacyId);
    if (!resolvedId) {
      return res.status(400).json({ message: "Employee not found" });
    }

    const bonus = await Bonus.create({
      ...req.body,
      employeeId: resolvedId
    });

    await Employee.updateOne(
      { _id: resolvedId },
      { $set: { bonus: bonus._id, bonusStatus: "Awarded" } }
    );

    res.status(201).json(bonus);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const updates = { ...req.body };

    if (updates.employeeLegacyId && !updates.employeeId) {
      const resolvedId = await resolveEmployeeId(null, updates.employeeLegacyId);
      if (!resolvedId) {
        return res.status(400).json({ message: "Employee not found" });
      }
      updates.employeeId = resolvedId;
    }

    const bonus = await Bonus.findOneAndUpdate(query, updates, {
      new: true,
      runValidators: true
    }).populate("employeeId");

    if (!bonus) {
      return res.status(404).json({ message: "Bonus not found" });
    }

    res.json(bonus);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const bonus = await Bonus.findOneAndDelete(query);
    if (!bonus) {
      return res.status(404).json({ message: "Bonus not found" });
    }
    await Employee.updateOne(
      { _id: bonus.employeeId },
      { $unset: { bonus: "" }, $set: { bonusStatus: "Not Applicable" } }
    );
    res.json({ message: "Bonus deleted" });
  } catch (error) {
    next(error);
  }
};
