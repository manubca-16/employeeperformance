const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const employeesRoutes = require("./routes/employees.routes");
const adminEmployeesRoutes = require("./routes/adminEmployees.routes");
const tasksRoutes = require("./routes/tasks.routes");
const uploadTasksRoutes = require("./routes/uploadTasks.routes");
const bonusesRoutes = require("./routes/bonuses.routes");
const bonusAnnouncementsRoutes = require("./routes/bonusAnnouncements.routes");
const activitiesRoutes = require("./routes/activities.routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/error");

const app = express();

app.use(helmet());
const corsOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: corsOrigins.includes("*") ? true : corsOrigins,
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/admin/employees", adminEmployeesRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/upload-tasks", uploadTasksRoutes);
app.use("/api/bonuses", bonusesRoutes);
app.use("/api/bonus-announcements", bonusAnnouncementsRoutes);
app.use("/api/activities", activitiesRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
