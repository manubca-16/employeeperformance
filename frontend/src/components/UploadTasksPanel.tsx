import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import { saveAs } from "file-saver";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { getApiBase } from "@/hooks/useApi";
import { Employee } from "@/types/models";

type PreviewRow = { rowNumber: number; row: Record<string, string>; valid: boolean; errors: string[] };
type UploadSummary = { inserted: number; skipped: number; errors: Array<{ row: number; reason: string }> };

interface UploadTasksPanelProps {
  employees: Employee[];
  onUploaded: () => Promise<void>;
}

const parseDateValue = (value: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value.slice(0, 10) : parsed.toISOString().slice(0, 10);
};

const UploadTasksPanel = ({ employees, onUploaded }: UploadTasksPanelProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);

  const previewStats = useMemo(
    () => ({ validRows: previewRows.filter((row) => row.valid).length, totalRows: previewRows.length }),
    [previewRows],
  );

  const readFileRows = async (file: File) => {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
  };

  const validateRows = (rows: Record<string, unknown>[]) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return rows.map((row, index) => {
      const title = String(row["Task Title"] || "").trim();
      const deadline = parseDateValue(String(row.Deadline || ""));
      const deadlineDate = deadline ? new Date(deadline) : null;
      const employeeName = String(row["Employee Name"] || "").trim();
      const employeeId = String(row["Employee ID"] || "").trim();
      const employeeMatch = employees.find((employee) => {
        const idMatch = employeeId && (employee.employeeId === employeeId || employee.legacyId === employeeId);
        const nameMatch = employeeName && employee.name.toLowerCase() === employeeName.toLowerCase();
        return idMatch || nameMatch;
      });
      const errors: string[] = [];
      if (!title) errors.push("Task Title is required");
      if (title.length > 120) errors.push("Task Title exceeds 120 characters");
      if (!deadlineDate || Number.isNaN(deadlineDate.getTime())) errors.push("Deadline is invalid");
      if (deadlineDate && deadlineDate <= today) errors.push("Deadline is in the past");
      if (!employeeMatch) errors.push("Employee not found");
      return {
        rowNumber: index + 2,
        row: Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value ?? "")])),
        valid: errors.length === 0,
        errors,
      };
    });
  };

  const processFile = async (file: File) => {
    if (![".xlsx", ".csv"].some((extension) => file.name.toLowerCase().endsWith(extension))) {
      toast.error("Only .xlsx and .csv files are supported");
      return;
    }
    const rows = await readFileRows(file);
    setSelectedFile(file);
    setPreviewRows(validateRows(rows));
    setUploadSummary(null);
  };

  const handleFileInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const downloadTemplate = async () => {
    const token = localStorage.getItem("pp_token");
    const response = await fetch(`${getApiBase()}/api/tasks/template`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      toast.error("Failed to download template");
      return;
    }
    saveAs(await response.blob(), "task-upload-template.xlsx");
  };

  const confirmUpload = async () => {
    if (!selectedFile || previewStats.validRows === 0) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    setUploading(true);
    try {
      const token = localStorage.getItem("pp_token");
      const response = await fetch(`${getApiBase()}/api/upload-tasks`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const result = (await response.json()) as UploadSummary | { message: string };
      if (!response.ok) throw new Error("message" in result ? result.message : "Upload failed");
      setUploadSummary(result as UploadSummary);
      toast.success(`${(result as UploadSummary).inserted} tasks uploaded successfully`);
      await onUploaded();
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="inline-flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-md text-sm font-heading font-medium" onClick={downloadTemplate}>
          <Download size={16} />
          Download Sample Template
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-md text-sm font-heading font-medium"
          onClick={() => {
            setSelectedFile(null);
            setPreviewRows([]);
            setUploadSummary(null);
          }}
        >
          <UploadCloud size={16} />
          Re-upload
        </button>
      </div>

      <div
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-all ${dragActive ? "border-primary bg-primary/5" : "border-border bg-card"}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud size={28} />
        </div>
        <h3 className="font-heading text-lg font-semibold">Drop your Excel or CSV file here</h3>
        <p className="mt-2 text-sm text-muted-foreground">Accepted formats: .xlsx and .csv only.</p>
        <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-heading font-medium text-primary-foreground">
          <FileSpreadsheet size={16} />
          Choose File
          <input type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFileInput} />
        </label>
        {selectedFile && (
          <p className="mt-4 text-sm text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{selectedFile.name}</span> (
            {(selectedFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {previewRows.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <div>
              <h3 className="font-heading font-semibold">Preview Before Assign</h3>
              <p className="text-sm text-muted-foreground">
                {previewStats.validRows} valid of {previewStats.totalRows} total rows
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-heading font-medium text-primary-foreground disabled:opacity-50"
              onClick={confirmUpload}
              disabled={uploading || previewStats.validRows === 0}
            >
              {uploading ? "Uploading..." : "Confirm & Assign"}
            </button>
          </div>
          <div className="max-h-[420px] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-secondary/95">
                <tr>
                  <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Task Title</th>
                  <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Employee</th>
                  <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Deadline</th>
                  <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Errors</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row) => (
                  <tr key={row.rowNumber} className={row.valid ? "border-b border-border" : "border-b border-border bg-data-red/5"}>
                    <td className="px-4 py-3">
                      {row.valid ? (
                        <span className="inline-flex items-center gap-2 text-data-green">
                          <CheckCircle2 size={16} />
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-data-red">
                          <AlertTriangle size={16} />
                          Invalid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.row["Task Title"] || "-"}</td>
                    <td className="px-4 py-3">{row.row["Employee Name"] || row.row["Employee ID"] || "-"}</td>
                    <td className="px-4 py-3">{row.row.Deadline || "-"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.errors.length ? row.errors.join(", ") : "Looks good"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {uploadSummary && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Tasks Assigned</p>
            <p className="mt-1 text-2xl font-heading font-bold">{uploadSummary.inserted}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Rows Skipped</p>
            <p className="mt-1 text-2xl font-heading font-bold">{uploadSummary.skipped}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Error Entries</p>
            <p className="mt-1 text-2xl font-heading font-bold">{uploadSummary.errors.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTasksPanel;
