import { AttendanceWithEmployee } from "./types";

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildAttendanceCsv(records: AttendanceWithEmployee[]): string {
  const headers = [
    "Date",
    "Employee ID",
    "Name",
    "Department",
    "Role",
    "Clock In",
    "Clock Out",
  ];

  const rows = records.map((r) => [
    r.date,
    r.employees?.employee_id ?? "N/A (NSP)",
    r.employees?.name ?? "Unknown",
    r.employees?.department ?? "",
    r.employees?.role ?? "",
    formatTime(r.clock_in),
    formatTime(r.clock_out),
  ]);

  const lines = [headers, ...rows].map((row) =>
    row.map((field) => escapeCsvField(String(field))).join(",")
  );

  return lines.join("\n");
}

export function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
