const Activity = require("../models/Activity");
const mongoose = require("mongoose");
const { parsePagination } = require("../utils/pagination");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

exports.list = async (req, res, next) => {
  try {
    const { limit, skip } = parsePagination(req);
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json(activities);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const activity = await Activity.findOne(query);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.json(activity);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { text, timestamp, type } = req.body;
    if (!text || !timestamp || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const activity = await Activity.create(req.body);
    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const activity = await Activity.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true
    });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.json(activity);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const activity = await Activity.findOneAndDelete(query);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.json({ message: "Activity deleted" });
  } catch (error) {
    next(error);
  }
};
