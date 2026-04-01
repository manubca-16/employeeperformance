import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import { Role } from "@/types/models";

interface RequireRoleProps {
  roles: Role[];
  children: JSX.Element;
}

const RequireRole = ({ roles, children }: RequireRoleProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard/tasks" replace />;
  }

  return children;
};

export default RequireRole;
