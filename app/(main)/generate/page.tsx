"use client";

import { useState } from "react";
import { AttendanceWithEmployee } from "@/lib/types";
import { buildAttendanceCsv, downloadCsv } from "@/lib/csv";
import { formatDate, formatTime } from "@/lib/date";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function GeneratePage() {
  const now = new Date();
  const [mode, setMode] = useState<"month" | "year">("month");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<AttendanceWithEmployee[] | null>(null);
  const [error, setError] = useState("");

  const yearOptions = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i);

  function getRange(): { start: string; end: string; label: string } {
    if (mode === "month") {
      const start = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      return { start, end, label: `${MONTHS[month - 1]}_${year}` };
    }
    return { start: `${year}-01-01`, end: `${year}-12-31`, label: `${year}` };
  }

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setRecords(null);
    const { start, end } = getRange();

    try {
      const res = await fetch(`/api/attendance/report?start=${start}&end=${end}`);
      if (!res.ok) throw new Error();
      const data: AttendanceWithEmployee[] = await res.json();
      setRecords(data);
    } catch {
      setError("Could not generate report. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!records) return;
    const { label } = getRange();
    const csv = buildAttendanceCsv(records);
    downloadCsv(`GWL_Ashanti_South_Attendance_${label}.csv`, csv);
  }

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <p className="field-label mb-4">Generate Attendance Report</p>

        <div className="mb-4 flex gap-2">
          <button
            className={`btn ${mode === "month" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setMode("month")}
          >
            Monthly
          </button>
          <button
            className={`btn ${mode === "year" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setMode("year")}
          >
            Yearly
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {mode === "month" && (
            <div>
              <label className="field-label mb-1 block">Month</label>
              <select className="form-input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="field-label mb-1 block">Year</label>
            <select className="form-input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleGenerate} disabled={loading} className="btn btn-primary w-full">
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded border px-3 py-2 text-sm" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
            {error}
          </p>
        )}
      </section>

      {records && (
        <section className="card p-5">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="field-label">{records.length} Record(s) Found</p>
            {records.length > 0 && (
              <button onClick={handleDownload} className="btn btn-success">
                Download CSV
              </button>
            )}
          </div>

          {records.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No attendance records for this period.</p>
          ) : (
            <div className="max-h-[420px] overflow-auto">
              <table className="official-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td>{formatDate(r.date)}</td>
                      <td className="mono">{r.employees?.employee_id ?? "NSP"}</td>
                      <td>{r.employees?.name ?? "Unknown"}</td>
                      <td>{r.employees?.department ?? ""}</td>
                      <td>{r.employees?.role ?? ""}</td>
                      <td className="mono">{formatTime(r.clock_in)}</td>
                      <td className="mono">{formatTime(r.clock_out)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
