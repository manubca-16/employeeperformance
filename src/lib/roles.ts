import { Role } from "@/types/models";

export const isSuperAdmin = (role?: Role | null) => role === "SUPERADMIN";

export const isHighAuthority = (role?: Role | null) =>
  role === "SUPERADMIN" || role === "ADMIN" || role === "HR";

export const isEmployee = (role?: Role | null) => role === "EMPLOYEE";

export const formatRoleLabel = (role?: Role | null) => {
  switch (role) {
    case "SUPERADMIN":
      return "Super Admin";
    case "ADMIN":
      return "Admin";
    case "HR":
      return "HR";
    case "EMPLOYEE":
      return "Employee";
    default:
      return "User";
  }
};
