const express = require("express");
const controller = require("../controllers/activities.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, controller.list);
router.get("/:id", requireAuth, controller.getById);
router.post("/", requireAuth, requireRole("SUPERADMIN", "ADMIN", "HR"), controller.create);
router.put("/:id", requireAuth, requireRole("SUPERADMIN", "ADMIN", "HR"), controller.update);
router.delete("/:id", requireAuth, requireRole("SUPERADMIN"), controller.remove);

module.exports = router;
