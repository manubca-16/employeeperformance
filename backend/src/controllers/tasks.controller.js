const Task = require("../models/Task");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");
const { parsePagination } = require("../utils/pagination");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const resolveEmployeeId = async (assignedTo, assignedToLegacyId) => {
  if (assignedTo) {
    return assignedTo;
  }
  if (assignedToLegacyId) {
    const employee = await Employee.findOne({ legacyId: assignedToLegacyId });
    return employee ? employee._id : null;
  }
  return null;
};

exports.list = async (req, res, next) => {
  try {
    const { limit, skip } = parsePagination(req);
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }
    if (req.query.assignedToLegacyId) {
      const employee = await Employee.findOne({ legacyId: req.query.assignedToLegacyId });
      if (employee) {
        filter.assignedTo = employee._id;
      }
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const task = await Task.findOne(query).populate("assignedTo");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, deadline, status, assignedTo, assignedToLegacyId } = req.body;
    if (!title || !description || !deadline || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const resolvedId = await resolveEmployeeId(assignedTo, assignedToLegacyId);
    if (!resolvedId) {
      return res.status(400).json({ message: "Assigned employee not found" });
    }

    const task = await Task.create({
      ...req.body,
      assignedTo: resolvedId
    });

    await Employee.updateOne(
      { _id: resolvedId },
      { $inc: { tasksAssigned: 1 } }
    );

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const updates = { ...req.body };

    if (updates.assignedToLegacyId && !updates.assignedTo) {
      const resolvedId = await resolveEmployeeId(null, updates.assignedToLegacyId);
      if (!resolvedId) {
        return res.status(400).json({ message: "Assigned employee not found" });
      }
      updates.assignedTo = resolvedId;
    }

    const task = await Task.findOneAndUpdate(query, updates, {
      new: true,
      runValidators: true
    }).populate("assignedTo");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const task = await Task.findOneAndDelete(query);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await Employee.updateOne(
      { _id: task.assignedTo },
      { $inc: { tasksAssigned: -1 } }
    );
    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};
