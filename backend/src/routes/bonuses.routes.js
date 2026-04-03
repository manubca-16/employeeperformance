const express = require("express");
const controller = require("../controllers/bonuses.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, controller.list);
router.get("/:id", requireAuth, controller.getById);
router.post("/", requireAuth, requireRole("SUPERADMIN"), controller.create);
router.put("/:id", requireAuth, requireRole("SUPERADMIN"), controller.update);
router.delete("/:id", requireAuth, requireRole("SUPERADMIN"), controller.remove);

module.exports = router;
