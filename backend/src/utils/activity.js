const Activity = require("../models/Activity");

const getActivityVisibility = (role) => (role === "EMPLOYEE" ? "SUPERADMIN" : "ALL");

const createActivitySafely = async ({ actor, text, type, visibility }) => {
  try {
    await Activity.create({
      text,
      timestamp: "Just now",
      type,
      actorName: actor?.name,
      actorRole: actor?.role,
      visibility: visibility || getActivityVisibility(actor?.role)
    });
  } catch (error) {
    console.error("Failed to create activity", error);
  }
};

const buildActivityVisibilityFilter = (user) => {
  if (!user) {
    return { visibility: "ALL" };
  }

  if (user.role === "SUPERADMIN") {
    return {};
  }

  return { visibility: "ALL" };
};

module.exports = {
  buildActivityVisibilityFilter,
  createActivitySafely,
  getActivityVisibility
};
