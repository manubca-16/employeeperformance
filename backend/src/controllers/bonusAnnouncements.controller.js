const BonusAnnouncement = require("../models/BonusAnnouncement");
const mongoose = require("mongoose");
const { parsePagination } = require("../utils/pagination");
const { createActivitySafely } = require("../utils/activity");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

exports.list = async (req, res, next) => {
  try {
    const { limit, skip } = parsePagination(req);
    const announcements = await BonusAnnouncement.find()
      .populate("createdBy", "name email role")
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
    const announcement = await BonusAnnouncement.findOne(query).populate("createdBy", "name email role");
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

    const announcement = await BonusAnnouncement.create({
      ...req.body,
      createdBy: req.user?._id
    });
    await createActivitySafely({
      actor: req.user,
      text: `${req.user?.name || "A manager"} posted announcement '${announcement.title}'`,
      type: "bonus",
      visibility: "ALL"
    });
    const populatedAnnouncement = await BonusAnnouncement.findById(announcement._id).populate(
      "createdBy",
      "name email role"
    );
    res.status(201).json(populatedAnnouncement);
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
    }).populate("createdBy", "name email role");

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await createActivitySafely({
      actor: req.user,
      text: `${req.user?.name || "A manager"} updated announcement '${announcement.title}'`,
      type: "bonus",
      visibility: "ALL"
    });

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
    await createActivitySafely({
      actor: req.user,
      text: `${req.user?.name || "A manager"} removed announcement '${announcement.title}'`,
      type: "bonus",
      visibility: "ALL"
    });
    res.json({ message: "Announcement deleted" });
  } catch (error) {
    next(error);
  }
};
