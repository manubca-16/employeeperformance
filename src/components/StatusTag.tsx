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
      : status === "In Progress"
      ? "bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium"
      : "status-overdue";

  return <span className={className}>{status}</span>;
};

export default StatusTag;
