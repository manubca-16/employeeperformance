const XLSX = require("xlsx");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");
const Employee = require("../models/Employee");
const { parsePagination } = require("../utils/pagination");
const { createActivitySafely } = require("../utils/activity");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const PRIORITIES = ["Low", "Medium", "High"];
const TASK_STATUSES = ["Pending", "In Progress", "Completed", "Overdue"];

const normalizeBool = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value !== "string") return false;
  return ["yes", "true", "1", "y"].includes(value.trim().toLowerCase());
};

const normalizePriority = (value) => {
  if (!value) return "Medium";
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "low") return "Low";
  if (normalized === "high") return "High";
  return "Medium";
};

const parseDeadline = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return new Date(parsed.y, parsed.m - 1, parsed.d);
  }

  const raw = String(value).trim();
  const ddmmyyyy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const endOfToday = () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
};

const findEmployeeForRow = async (row) => {
  const employeeName = row["Employee Name"] || row["Employee Name or Employee ID"] || row.employeeName;
  const employeeId = row["Employee ID"] || row["Employee Name or Employee ID"] || row.employeeId;

  if (employeeId) {
    const employee = await Employee.findOne({
      $or: [{ employeeId: String(employeeId).trim() }, { legacyId: String(employeeId).trim() }],
    });
    if (employee) return employee;
  }

  if (employeeName) {
    return Employee.findOne({ name: new RegExp(`^${String(employeeName).trim()}$`, "i") });
  }

  return null;
};

const mapTaskResponse = async (taskQuery) =>
  taskQuery.populate("assignedTo").populate("uploadedBy", "name email role");

const buildTaskPayload = (body, currentUserId) => {
  const escalationFlag =
    typeof body?.escalation === "object"
      ? Boolean(body.escalation.flag)
      : normalizeBool(body?.escalation) || Boolean(body?.escalationReason);

  const escalationReason =
    typeof body?.escalation === "object"
      ? body.escalation.reason || ""
      : typeof body?.escalation === "string" && !normalizeBool(body.escalation)
      ? body.escalation
      : body?.escalationReason || "";

  return {
    title: body.title,
    description: body.description || "",
    assignedTo: body.assignedTo,
    deadline: body.deadline,
    priority: PRIORITIES.includes(body.priority) ? body.priority : normalizePriority(body.priority),
    status: TASK_STATUSES.includes(body.status) ? body.status : "Pending",
    taskAssigned: body.taskAssigned ?? true,
    bonusApplicable: normalizeBool(body.bonusApplicable),
    bonusOpportunity: body.bonusOpportunity || "",
    escalation: {
      flag: escalationFlag,
      reason: escalationReason,
    },
    uploadedBy: currentUserId,
  };
};

const applyRoleScopedTaskAccess = async (req, baseFilter = {}) => {
  if (!req.user || req.user.role === "SUPERADMIN" || req.user.role === "ADMIN" || req.user.role === "HR") {
    return baseFilter;
  }

  const employee = await Employee.findOne({ email: req.user.email });
  return employee ? { ...baseFilter, assignedTo: employee._id } : { ...baseFilter, assignedTo: null };
};

exports.list = async (req, res, next) => {
  try {
    const { limit, skip } = parsePagination(req);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.employee) filter.assignedTo = req.query.employee;
    if (req.query.bonus === "eligible") filter.bonusApplicable = true;
    if (req.query.bonus === "not-eligible") filter.bonusApplicable = false;
    if (req.query.escalation === "escalated") filter["escalation.flag"] = true;
    if (req.query.escalation === "not-escalated") filter["escalation.flag"] = false;

    const scopedFilter = await applyRoleScopedTaskAccess(req, filter);

    const tasks = await mapTaskResponse(
      Task.find(scopedFilter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    );

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.listByEmployee = async (req, res, next) => {
  try {
    const employeeId = req.params.employeeId;
    let employee = null;

    if (isObjectId(employeeId)) {
      employee = await Employee.findById(employeeId);
    }

    if (!employee) {
      employee = await Employee.findOne({
        $or: [{ employeeId }, { legacyId: employeeId }, { email: employeeId }],
      });
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (req.user.role === "EMPLOYEE" && req.user.email !== employee.email) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const tasks = await mapTaskResponse(Task.find({ assignedTo: employee._id }).sort({ createdAt: -1 }));
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, assignedTo, deadline } = req.body;
    if (!title || !assignedTo || !deadline) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const payload = buildTaskPayload(req.body, req.user?._id);
    const task = await Task.create(payload);

    await Employee.updateOne({ _id: assignedTo }, { $inc: { tasksAssigned: 1 } });
    const employee = await Employee.findById(assignedTo);
    if (employee) {
      await createActivitySafely({
        actor: req.user,
        text: `${req.user?.name || "A manager"} assigned '${title}' to ${employee.name}`,
        type: "task"
      });
    }

    const createdTask = await mapTaskResponse(Task.findById(task._id));
    res.status(201).json(createdTask);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const query = { _id: req.params.taskId };
    const existingTask = await Task.findOne(query);

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updates = { ...req.body };

    if (req.user.role === "EMPLOYEE") {
      const employee = await Employee.findOne({ email: req.user.email });
      if (!employee || String(existingTask.assignedTo) !== String(employee._id)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const allowed = {};
      if (updates.status) {
        allowed.status = updates.status;
      }
      Object.assign(updates, allowed);
      for (const key of Object.keys(updates)) {
        if (key !== "status") delete updates[key];
      }
    }

    if (updates.priority) {
      updates.priority = normalizePriority(updates.priority);
    }
    if ("bonusApplicable" in updates) {
      updates.bonusApplicable = normalizeBool(updates.bonusApplicable);
    }
    if ("taskAssigned" in updates) {
      updates.taskAssigned = normalizeBool(updates.taskAssigned);
    }
    if ("escalation" in updates || "escalationReason" in updates) {
      const escalationFlag =
        typeof updates.escalation === "object"
          ? Boolean(updates.escalation.flag)
          : normalizeBool(updates.escalation) || Boolean(updates.escalationReason);
      const escalationReason =
        typeof updates.escalation === "object"
          ? updates.escalation.reason || ""
          : typeof updates.escalation === "string" && !normalizeBool(updates.escalation)
          ? updates.escalation
          : updates.escalationReason || "";

      updates.escalation = {
        flag: escalationFlag,
        reason: escalationReason,
      };
      delete updates.escalationReason;
    }

    const task = await mapTaskResponse(
      Task.findOneAndUpdate(query, updates, { new: true, runValidators: true }),
    );

    if (updates.status === "Completed" && existingTask.status !== "Completed" && task.assignedTo) {
      await createActivitySafely({
        actor: req.user,
        text: `${task.assignedTo.name} completed '${task.title}'`,
        type: "task"
      });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Employee.updateOne({ _id: task.assignedTo }, { $inc: { tasksAssigned: -1 } });
    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};

exports.bulkDelete = async (req, res, next) => {
  try {
    const taskIds = Array.isArray(req.body.taskIds) ? req.body.taskIds : [];
    if (!taskIds.length) {
      return res.status(400).json({ message: "taskIds is required" });
    }

    const tasks = await Task.find({ _id: { $in: taskIds } });
    await Task.deleteMany({ _id: { $in: taskIds } });

    const updates = new Map();
    tasks.forEach((task) => {
      const key = String(task.assignedTo);
      updates.set(key, (updates.get(key) || 0) - 1);
    });

    await Promise.all(
      Array.from(updates.entries()).map(([employeeId, delta]) =>
        Employee.updateOne({ _id: employeeId }, { $inc: { tasksAssigned: delta } }),
      ),
    );

    res.json({ deleted: tasks.length });
  } catch (error) {
    next(error);
  }
};

exports.downloadTemplate = async (req, res, next) => {
  try {
    const rows = [
      [
        "Task Title",
        "Description",
        "Employee Name",
        "Employee ID",
        "Deadline",
        "Priority",
        "Task Assigned",
        "Bonus Applicable",
        "Escalation",
      ],
      [
        "Quarterly Review Prep",
        "Prepare the quarterly performance summary",
        "John Doe",
        "EMP-001",
        "31/12/2026",
        "High",
        "Yes",
        "Yes",
        "Waiting for data from finance",
      ],
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", 'attachment; filename="task-upload-template.xlsx"');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

exports.uploadTasks = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

    const errors = [];
    const validTasks = [];
    const today = endOfToday();

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const title = String(row["Task Title"] || "").trim();
      const description = String(row.Description || "").trim();
      const deadline = parseDeadline(row.Deadline);
      const priority = normalizePriority(row.Priority);
      const taskAssigned = normalizeBool(row["Task Assigned"]);
      const bonusApplicable = normalizeBool(row["Bonus Applicable"]);
      const escalationRaw = row.Escalation;
      const employee = await findEmployeeForRow(row);
      const rowErrors = [];

      if (!title) rowErrors.push("Task Title is required");
      if (title.length > 120) rowErrors.push("Task Title exceeds 120 characters");
      if (!deadline || Number.isNaN(deadline.getTime())) rowErrors.push("Deadline is invalid");
      if (deadline && deadline <= today) rowErrors.push("Deadline must be in the future");
      if (!employee) rowErrors.push("Employee not found");
      if (!PRIORITIES.includes(priority)) rowErrors.push("Priority is invalid");

      if (rowErrors.length) {
        errors.push({ row: rowNumber, reason: rowErrors.join(", ") });
        continue;
      }

      validTasks.push({
        title,
        description,
        assignedTo: employee._id,
        deadline,
        priority,
        status: "Pending",
        taskAssigned,
        bonusApplicable,
        escalation: {
          flag: normalizeBool(escalationRaw) || Boolean(String(escalationRaw || "").trim()),
          reason:
            typeof escalationRaw === "string" && !normalizeBool(escalationRaw) ? escalationRaw.trim() : "",
        },
        uploadedBy: req.user._id,
      });
    }

    const insertedDocs = validTasks.length ? await Task.insertMany(validTasks) : [];
    const counts = new Map();
    validTasks.forEach((task) => {
      const key = String(task.assignedTo);
      counts.set(key, (counts.get(key) || 0) + (task.taskAssigned ? 1 : 0));
    });

    await Promise.all(
      Array.from(counts.entries()).map(([employeeId, count]) =>
        Employee.updateOne({ _id: employeeId }, { $inc: { tasksAssigned: count } }),
      ),
    );

    res.json({
      inserted: insertedDocs.length,
      skipped: errors.length,
      errors,
    });
  } catch (error) {
    next(error);
  }
};
