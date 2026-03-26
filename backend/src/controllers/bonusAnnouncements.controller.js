const BonusAnnouncement = require("../models/BonusAnnouncement");
const mongoose = require("mongoose");
const { parsePagination } = require("../utils/pagination");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

exports.list = async (req, res, next) => {
  try {
    const { limit, skip } = parsePagination(req);
    const announcements = await BonusAnnouncement.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const announcement = await BonusAnnouncement.findOne(query);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.json(announcement);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, amount, date } = req.body;
    if (!title || !description || amount === undefined || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const announcement = await BonusAnnouncement.create(req.body);
    res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const announcement = await BonusAnnouncement.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.json(announcement);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = isObjectId(id) ? { _id: id } : { legacyId: id };
    const announcement = await BonusAnnouncement.findOneAndDelete(query);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.json({ message: "Announcement deleted" });
  } catch (error) {
    next(error);
  }
};
