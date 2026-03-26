import { Task } from "@/types/models";

interface StatusTagProps {
  status: Task["status"];
}

const StatusTag = ({ status }: StatusTagProps) => {
  const className =
    status === "Completed"
      ? "status-completed"
      : status === "Pending"
      ? "status-pending"
      : "status-overdue";

  return <span className={className}>{status}</span>;
};

export default StatusTag;
