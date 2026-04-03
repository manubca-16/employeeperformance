import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { getApiBase } from "@/hooks/useApi";

type PreviewRow = {
  row: number;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  role: string;
  salary: string;
  bonusEligible: string;
  valid: boolean;
  reason?: string;
};

type UploadResponse = {
  total: number;
  created: number;
  failed: number;
  errors: Array<{ row: number; email: string; reason: string }>;
  credentials: Array<{ name: string; email: string; tempPassword: string }>;
};

interface EmployeeExcelUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => Promise<void> | void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const REQUIRED_HEADERS = ["Name", "Email", "Employee ID", "Department", "Role", "Salary", "Bonus Eligible"];

const sanitizeText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/[<>]/g, "");

const normalizeEmail = (value: unknown) => sanitizeText(value).toLowerCase();
const normalizeRole = (value: unknown) => sanitizeText(value).toUpperCase().replace(/\s+/g, "");

const validatePreviewRows = (rows: Record<string, unknown>[]) => {
  const seenEmails = new Set<string>();
  const seenEmployeeIds = new Set<string>();

  return rows.map((row, index): PreviewRow => {
    const previewRow: PreviewRow = {
      row: index + 2,
      name: sanitizeText(row.Name),
      email: normalizeEmail(row.Email),
      employeeId: sanitizeText(row["Employee ID"]),
      department: sanitizeText(row.Department),
      role: normalizeRole(row.Role),
      salary: sanitizeText(row.Salary),
      bonusEligible: sanitizeText(row["Bonus Eligible"]).toUpperCase(),
      valid: true,
    };

    if (!previewRow.name) {
      return { ...previewRow, valid: false, reason: "Name is required" };
    }
    if (!previewRow.email) {
      return { ...previewRow, valid: false, reason: "Email is required" };
    }
    if (!previewRow.employeeId) {
      return { ...previewRow, valid: false, reason: "Employee ID is required" };
    }
    if (!previewRow.department) {
      return { ...previewRow, valid: false, reason: "Department is required" };
    }
    if (!previewRow.role) {
      return { ...previewRow, valid: false, reason: "Role is required" };
    }
    if (previewRow.role !== "EMPLOYEE") {
      return { ...previewRow, valid: false, reason: "Role must be EMPLOYEE" };
    }
    if (previewRow.salary && Number.isNaN(Number(previewRow.salary))) {
      return { ...previewRow, valid: false, reason: "Salary must be a number" };
    }
    if (
      previewRow.bonusEligible &&
      previewRow.bonusEligible !== "TRUE" &&
      previewRow.bonusEligible !== "FALSE"
    ) {
      return { ...previewRow, valid: false, reason: "Bonus Eligible must be TRUE or FALSE" };
    }
    if (seenEmails.has(previewRow.email)) {
      return { ...previewRow, valid: false, reason: "Duplicate email in file" };
    }
    if (seenEmployeeIds.has(previewRow.employeeId)) {
      return { ...previewRow, valid: false, reason: "Duplicate employee ID in file" };
    }

    seenEmails.add(previewRow.email);
    seenEmployeeIds.add(previewRow.employeeId);
    return previewRow;
  });
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const downloadCredentialsCsv = (credentials: UploadResponse["credentials"]) => {
  const lines = [
    ["Name", "Email", "Temp Password"],
    ...credentials.map((item) => [item.name, item.email, item.tempPassword]),
  ];
  const csv = lines
    .map((line) =>
      line
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "employee-upload-credentials.csv");
};

const EmployeeExcelUploadDialog = ({
  open,
  onOpenChange,
  onUploaded,
}: EmployeeExcelUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const validPreviewCount = useMemo(
    () => previewRows.filter((row) => row.valid).length,
    [previewRows],
  );

  const resetState = () => {
    setFile(null);
    setPreviewRows([]);
    setFileError("");
    setProgress(0);
    setUploading(false);
    setResult(null);
  };

  const handleTemplateDownload = async () => {
    const token = localStorage.getItem("pp_token");
    const response = await fetch(`${getApiBase()}/api/admin/employees/template`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error("Failed to download template");
    }

    const blob = await response.blob();
    downloadBlob(blob, "employee-upload-template.xlsx");
  };

  const handleFileChange = async (selectedFile: File | null) => {
    setResult(null);
    setPreviewRows([]);
    setFileError("");
    setProgress(0);
    setFile(selectedFile);

    if (!selectedFile) {
      return;
    }

    const lowerName = selectedFile.name.toLowerCase();
    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".csv")) {
      setFileError("Only .xlsx and .csv files are allowed.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError("File size must be 10MB or less.");
      return;
    }

    try {
      setProgress(15);
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        setFileError("The selected file does not contain any sheets.");
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: "",
        raw: false,
      });

      const headers = Object.keys(rows[0] || {});
      const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
      if (missingHeaders.length > 0) {
        setFileError(`Missing required columns: ${missingHeaders.join(", ")}`);
        return;
      }

      setPreviewRows(validatePreviewRows(rows));
      setProgress(45);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Unable to read the selected file.");
    }
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    if (!window.confirm(`Are you sure you want to create accounts from ${validPreviewCount} valid row(s)?`)) {
      return;
    }

    setUploading(true);
    setProgress(65);
    setFileError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("pp_token");
      const response = await fetch(`${getApiBase()}/api/admin/employees/upload`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Upload failed");
      }

      const data = (await response.json()) as UploadResponse;
      setResult(data);
      setProgress(100);
      await onUploaded();
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Upload failed.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetState();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Upload Employees via Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-secondary/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-heading text-sm font-medium">Accepted formats: .xlsx, .csv</p>
                <p className="text-sm text-muted-foreground">Maximum file size: 10MB</p>
              </div>
              <button
                type="button"
                className="text-sm font-heading font-medium text-primary underline underline-offset-4"
                onClick={handleTemplateDownload}
              >
                Download Sample Template
              </button>
            </div>

            <input
              type="file"
              accept=".xlsx,.csv"
              className="mt-4 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-body"
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            />

            {fileError ? <p className="mt-3 text-sm text-data-red">{fileError}</p> : null}
          </div>

          {(uploading || progress > 0) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-heading font-medium">Processing</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {previewRows.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold">Preview</h3>
                <p className="text-sm text-muted-foreground">
                  {validPreviewCount} valid / {previewRows.length - validPreviewCount} invalid
                </p>
              </div>
              <div className="max-h-72 overflow-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Row</th>
                      <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Email</th>
                      <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Employee ID</th>
                      <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Department</th>
                      <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row) => (
                      <tr
                        key={`${row.row}-${row.email}-${row.employeeId}`}
                        className={row.valid ? "bg-data-green/5" : "bg-data-red/5"}
                      >
                        <td className="px-4 py-3">{row.row}</td>
                        <td className="px-4 py-3">{row.name}</td>
                        <td className="px-4 py-3">{row.email}</td>
                        <td className="px-4 py-3">{row.employeeId}</td>
                        <td className="px-4 py-3">{row.department}</td>
                        <td className="px-4 py-3">{row.role}</td>
                        <td className="px-4 py-3">
                          {row.valid ? (
                            <span className="rounded-full bg-data-green/10 px-2 py-1 text-xs font-medium text-data-green">
                              Valid
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-data-red">{row.reason}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {result ? (
            <div className="space-y-3 rounded-lg border border-border bg-card p-4">
              <h3 className="font-heading font-semibold">Result Summary</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm text-muted-foreground">Rows processed</p>
                  <p className="mt-1 text-2xl font-heading font-bold">{result.total}</p>
                </div>
                <div className="rounded-lg border border-data-green/20 bg-data-green/5 p-3">
                  <p className="text-sm text-muted-foreground">Accounts created</p>
                  <p className="mt-1 text-2xl font-heading font-bold text-data-green">{result.created}</p>
                </div>
                <div className="rounded-lg border border-data-red/20 bg-data-red/5 p-3">
                  <p className="text-sm text-muted-foreground">Rows failed</p>
                  <p className="mt-1 text-2xl font-heading font-bold text-data-red">{result.failed}</p>
                </div>
              </div>

              {result.errors.length > 0 ? (
                <div className="max-h-48 overflow-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Row</th>
                        <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Email</th>
                        <th className="px-4 py-3 text-left font-heading font-medium text-muted-foreground">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((error) => (
                        <tr key={`${error.row}-${error.email}-${error.reason}`} className="border-b border-border last:border-0">
                          <td className="px-4 py-3">{error.row}</td>
                          <td className="px-4 py-3">{error.email || "-"}</td>
                          <td className="px-4 py-3 text-data-red">{error.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {result.credentials.length > 0 ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-bonus/20 bg-bonus/5 p-3">
                  <p className="text-sm text-muted-foreground">
                    Temporary passwords are shown only for this upload result.
                  </p>
                  <button
                    type="button"
                    className="rounded-md bg-bonus px-4 py-2 text-sm font-heading font-medium text-bonus-foreground"
                    onClick={() => downloadCredentialsCsv(result.credentials)}
                  >
                    Download Credentials
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <button
            type="button"
            className="rounded-md bg-secondary px-4 py-2 text-sm font-heading font-medium text-foreground"
            onClick={() => {
              resetState();
              onOpenChange(false);
            }}
          >
            Close
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-heading font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleUpload}
            disabled={!file || !!fileError || uploading || validPreviewCount === 0}
          >
            {uploading ? "Uploading..." : "Upload & Create Accounts"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeExcelUploadDialog;
