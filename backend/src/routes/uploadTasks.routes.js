const express = require("express");
const multer = require("multer");
const controller = require("../controllers/tasks.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/", requireAuth, requireRole("SUPERADMIN"), upload.single("file"), controller.uploadTasks);

module.exports = router;
