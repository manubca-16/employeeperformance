import { Role } from "@/types/models";

export const isSuperAdmin = (role?: Role | null) => role === "SUPERADMIN";

export const isAdminLevel = (role?: Role | null) => role === "ADMIN" || role === "HR";

export const isHighAuthority = (role?: Role | null) =>
  isSuperAdmin(role) || isAdminLevel(role);

export const isEmployee = (role?: Role | null) => role === "EMPLOYEE";

export const formatRoleLabel = (role?: Role | null) => {
  switch (role) {
    case "SUPERADMIN":
      return "Super Admin";
    case "ADMIN":
      return "Admin";
    case "HR":
      return "Admin (HR)";
    case "EMPLOYEE":
      return "User";
    default:
      return "User";
  }
};
