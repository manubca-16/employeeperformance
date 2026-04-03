const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    legacyId: { type: String, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ["SUPERADMIN", "ADMIN", "HR", "EMPLOYEE"], required: true },
    department: { type: String, required: true },
    avatar: { type: String },
    passwordHash: { type: String }
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  }
});

module.exports = mongoose.model("User", UserSchema);
