const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/csv",
      "application/vnd.ms-excel",
    ];
    const lowerName = (file.originalname || "").toLowerCase();
    const allowedExtension = lowerName.endsWith(".xlsx") || lowerName.endsWith(".csv");

    if (!allowedExtension && !allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only .xlsx and .csv files are allowed"));
    }

    cb(null, true);
  },
});

const TEMPLATE_HEADERS = [
  "Name",
  "Email",
  "Employee ID",
  "Department",
  "Role",
  "Salary",
  "Bonus Eligible",
];

const allowedEmployeeRoles = new Set(["EMPLOYEE"]);

const normalizeString = (value) => String(value ?? "").trim();
const normalizeEmail = (value) => normalizeString(value).toLowerCase();
const normalizeRole = (value) => normalizeString(value).toUpperCase().replace(/\s+/g, "");

const parseBoolean = (value) => {
  const normalized = normalizeString(value).toUpperCase();
  if (!normalized) return false;
  if (normalized === "TRUE") return true;
  if (normalized === "FALSE") return false;
  return null;
};

const parseSalary = (value) => {
  const normalized = normalizeString(value);
  if (!normalized) return undefined;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
};

const sanitizeCell = (value) =>
  normalizeString(value)
    .replace(/[<>]/g, "")
    .slice(0, 500);

const makeTempPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let index = 0; index < 12; index += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
};

const parseWorkbookRows = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("The uploaded file does not contain any sheets");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });
  const headers = (matrix[0] || []).map((value) => normalizeString(value));
  const missingHeaders = TEMPLATE_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  return rows;
};

const validateRow = (rawRow, rowNumber, seenEmails, seenEmployeeIds) => {
  const name = sanitizeCell(rawRow.Name);
  const email = normalizeEmail(rawRow.Email);
  const employeeId = sanitizeCell(rawRow["Employee ID"]);
  const department = sanitizeCell(rawRow.Department);
  const role = normalizeRole(rawRow.Role);
  const salary = parseSalary(rawRow.Salary);
  const bonusEligible = parseBoolean(rawRow["Bonus Eligible"]);

  if (!name) {
    return { valid: false, row: rowNumber, email, reason: "Name is required" };
  }
  if (!email) {
    return { valid: false, row: rowNumber, email, reason: "Email is required" };
  }
  if (!employeeId) {
    return { valid: false, row: rowNumber, email, reason: "Employee ID is required" };
  }
  if (!department) {
    return { valid: false, row: rowNumber, email, reason: "Department is required" };
  }
  if (!role) {
    return { valid: false, row: rowNumber, email, reason: "Role is required" };
  }
  if (!allowedEmployeeRoles.has(role)) {
    return { valid: false, row: rowNumber, email, reason: "Role must be EMPLOYEE for uploaded accounts" };
  }
  if (salary === null) {
    return { valid: false, row: rowNumber, email, reason: "Salary must be a number" };
  }
  if (bonusEligible === null) {
    return { valid: false, row: rowNumber, email, reason: "Bonus Eligible must be TRUE or FALSE" };
  }
  if (seenEmails.has(email)) {
    return { valid: false, row: rowNumber, email, reason: "Duplicate email in file" };
  }
  if (seenEmployeeIds.has(employeeId)) {
    return { valid: false, row: rowNumber, email, reason: "Duplicate employee ID in file" };
  }

  seenEmails.add(email);
  seenEmployeeIds.add(employeeId);

  return {
    valid: true,
    row: rowNumber,
    email,
    reason: "",
    data: {
      name,
      email,
      employeeId,
      department,
      role,
      salary,
      bonusEligible,
    },
  };
};

router.get("/template", requireAuth, requireRole("SUPERADMIN"), async (req, res, next) => {
  try {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      ["Jane Doe", "jane.doe@company.com", "EMP1001", "Engineering", "EMPLOYEE", 55000, "TRUE"],
    ]);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="employee-upload-template.xlsx"');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/upload",
  requireAuth,
  requireRole("SUPERADMIN"),
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }

      const rawRows = parseWorkbookRows(req.file.buffer);
      const seenEmails = new Set();
      const seenEmployeeIds = new Set();
      const validatedRows = rawRows.map((rawRow, index) =>
        validateRow(rawRow, index + 2, seenEmails, seenEmployeeIds)
      );

      const validRows = validatedRows.filter((row) => row.valid);
      const invalidRows = validatedRows
        .filter((row) => !row.valid)
        .map(({ row, email, reason }) => ({ row, email, reason }));

      const emails = validRows.map((row) => row.data.email);
      const employeeIds = validRows.map((row) => row.data.employeeId);

      const [existingUsers, existingEmployees] = await Promise.all([
        emails.length ? User.find({ email: { $in: emails } }).select("email") : [],
        employeeIds.length ? Employee.find({ employeeId: { $in: employeeIds } }).select("employeeId") : [],
      ]);

      const existingEmailSet = new Set(existingUsers.map((user) => user.email.toLowerCase()));
      const existingEmployeeIdSet = new Set(existingEmployees.map((employee) => employee.employeeId));

      const credentials = [];
      const creationErrors = [];
      let created = 0;

      for (const row of validRows) {
        const { data } = row;

        if (existingEmailSet.has(data.email)) {
          creationErrors.push({ row: row.row, email: data.email, reason: "Email already exists" });
          continue;
        }

        if (existingEmployeeIdSet.has(data.employeeId)) {
          creationErrors.push({ row: row.row, email: data.email, reason: "Employee ID already exists" });
          continue;
        }

        const tempPassword = makeTempPassword();
        const passwordHash = await bcrypt.hash(tempPassword, 12);

        let user;
        try {
          user = await User.create({
            name: data.name,
            email: data.email,
            role: "EMPLOYEE",
            department: data.department,
            passwordHash,
          });

          await Employee.create({
            userId: user._id,
            name: data.name,
            email: data.email,
            employeeId: data.employeeId,
            role: "EMPLOYEE",
            department: data.department,
            salary: data.salary,
            bonusEligible: data.bonusEligible,
            bonusStatus: data.bonusEligible ? "Eligible" : "Not Applicable",
          });

          credentials.push({
            name: data.name,
            email: data.email,
            tempPassword,
          });
          existingEmailSet.add(data.email);
          existingEmployeeIdSet.add(data.employeeId);
          created += 1;
        } catch (error) {
          if (user?._id) {
            await User.deleteOne({ _id: user._id });
          }

          const duplicateEmail = error?.code === 11000 && error?.keyPattern?.email;
          const duplicateEmployeeId = error?.code === 11000 && error?.keyPattern?.employeeId;

          creationErrors.push({
            row: row.row,
            email: data.email,
            reason: duplicateEmail
              ? "Email already exists"
              : duplicateEmployeeId
              ? "Employee ID already exists"
              : "Failed to create account",
          });
        }
      }

      const errors = [...invalidRows, ...creationErrors].sort((left, right) => left.row - right.row);

      res.json({
        total: rawRows.length,
        created,
        failed: errors.length,
        errors,
        credentials,
      });
    } catch (error) {
      if (error instanceof Error && /Only \.xlsx and \.csv files are allowed|sheet/i.test(error.message)) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
);

module.exports = router;
