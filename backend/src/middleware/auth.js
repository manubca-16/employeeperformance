const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getTokenFromHeader = (headerValue = "") => {
  if (!headerValue.startsWith("Bearer ")) {
    return null;
  }
  return headerValue.slice(7);
};

const requireAuth = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const secret = process.env.JWT_SECRET || "dev_secret";
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
};

module.exports = {
  requireAuth,
  requireRole,
};
