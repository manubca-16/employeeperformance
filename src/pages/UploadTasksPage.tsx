import { useApi } from "@/hooks/useApi";
import UploadTasksPanel from "@/components/UploadTasksPanel";
import { Employee } from "@/types/models";

const UploadTasksPage = () => {
  const { data: employees, refetch } = useApi<Employee[]>("/api/employees", []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold">Task Upload</h2>
        <p className="text-sm text-muted-foreground">
          Upload Excel or CSV task sheets, validate rows before submission, and assign tasks in bulk.
        </p>
      </div>
      <UploadTasksPanel employees={employees} onUploaded={refetch} />
    </div>
  );
};

export default UploadTasksPage;
