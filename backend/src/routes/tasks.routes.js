const express = require("express");
const multer = require("multer");
const controller = require("../controllers/tasks.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/template", requireAuth, controller.downloadTemplate);
router.post("/upload", requireAuth, requireRole("SUPERADMIN"), upload.single("file"), controller.uploadTasks);
router.delete("/bulk-delete", requireAuth, requireRole("SUPERADMIN"), controller.bulkDelete);
router.get("/", requireAuth, controller.list);
router.get("/:employeeId", requireAuth, controller.listByEmployee);
router.post("/", requireAuth, requireRole("SUPERADMIN"), controller.create);
router.put("/:taskId", requireAuth, controller.update);
router.delete("/:taskId", requireAuth, requireRole("SUPERADMIN"), controller.remove);

module.exports = router;
