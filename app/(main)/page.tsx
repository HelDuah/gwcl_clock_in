"use client";

import { useState } from "react";
import { Employee, Attendance } from "@/lib/types";
import { formatTime } from "@/lib/date";
import EmployeeForm, { EmployeeFormValues } from "@/components/EmployeeForm";

export default function ClockingPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Employee[]>([]);
  const [searched, setSearched] = useState(false);

  const [selected, setSelected] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showQuickRegister, setShowQuickRegister] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSelected(null);
    setAttendance(null);
    setShowQuickRegister(false);
    if (!query.trim()) return;

    setSearching(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/employees?q=${encodeURIComponent(query.trim())}`);
      const data: Employee[] = await res.json();
      setResults(data);
      if (data.length === 1) {
        await selectEmployee(data[0]);
      }
    } catch {
      setMessage({ type: "error", text: "Search failed. Check your connection." });
    } finally {
      setSearching(false);
    }
  }

  async function selectEmployee(employee: Employee) {
    setSelected(employee);
    setMessage(null);
    try {
      const res = await fetch(`/api/attendance/today?employeeRef=${employee.id}`);
      const data: Attendance | null = await res.json();
      setAttendance(data);
    } catch {
      setMessage({ type: "error", text: "Could not load today's attendance." });
    }
  }

  async function handleClockIn() {
    if (!selected) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/attendance/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeRef: selected.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Could not clock in." });
        return;
      }
      setAttendance(data);
      setMessage({ type: "success", text: `${selected.name} clocked in successfully.` });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClockOut() {
    if (!selected || !attendance) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/attendance/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceId: attendance.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Could not clock out." });
        return;
      }
      setAttendance(data);
      setMessage({ type: "success", text: `${selected.name} clocked out successfully.` });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleQuickRegister(values: EmployeeFormValues) {
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Could not register employee.");
    }
    setShowQuickRegister(false);
    setResults([]);
    setQuery("");
    setSearched(false);
    await selectEmployee(data);
    setMessage({ type: "success", text: `${data.name} registered successfully.` });
  }

  function resetSearch() {
    setQuery("");
    setResults([]);
    setSearched(false);
    setSelected(null);
    setAttendance(null);
    setShowQuickRegister(false);
    setMessage(null);
  }

  const canClockIn = selected && !attendance;
  const canClockOut = selected && attendance && attendance.clock_in && !attendance.clock_out;
  const alreadyDone = selected && attendance && attendance.clock_in && attendance.clock_out;

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <p className="field-label mb-3">Search Employee</p>
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <input
            className="form-input flex-1"
            placeholder="Search by Employee ID or Name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <button type="submit" disabled={searching} className="btn btn-primary">
              {searching ? "Searching..." : "Search"}
            </button>
            {(searched || selected) && (
              <button type="button" onClick={resetSearch} className="btn btn-outline">
                Clear
              </button>
            )}
          </div>
        </form>
      </section>

      {results.length > 1 && !selected && (
        <section className="card p-5">
          <p className="field-label mb-3">Select Employee ({results.length} matches)</p>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {results.map((emp) => (
              <button
                key={emp.id}
                onClick={() => selectEmployee(emp)}
                className="flex w-full items-center justify-between py-3 text-left hover:opacity-80"
              >
                <div>
                  <p className="font-semibold">{emp.name}</p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    {emp.department} — {emp.role}
                  </p>
                </div>
                <span className="mono text-sm" style={{ color: "var(--accent)" }}>
                  {emp.employee_id ?? "NSP"}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {searched && results.length === 0 && !selected && !showQuickRegister && (
        <section className="card p-5 text-center">
          <p className="mb-3">No employee found matching "{query}".</p>
          <button className="btn btn-primary" onClick={() => setShowQuickRegister(true)}>
            + Register New Employee
          </button>
        </section>
      )}

      {showQuickRegister && (
        <section className="card p-5">
          <p className="field-label mb-3">Register New Employee</p>
          <EmployeeForm
            onSubmit={handleQuickRegister}
            onCancel={() => setShowQuickRegister(false)}
            submitLabel="Register & Continue"
          />
        </section>
      )}

      {selected && (
        <section className="card p-6">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="font-display text-xl font-bold">{selected.name}</h2>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {selected.department} — {selected.role}
              </p>
            </div>
            <span className="mono rounded border px-3 py-1 text-sm" style={{ borderColor: "var(--border)" }}>
              {selected.employee_id ?? "NSP — No ID"}
            </span>
          </div>

          <div className="letterhead-rule mb-4" />

          <div className="mb-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="field-label mb-1">Clock In</p>
              <p className="mono text-lg">{formatTime(attendance?.clock_in ?? null)}</p>
            </div>
            <div>
              <p className="field-label mb-1">Clock Out</p>
              <p className="mono text-lg">{formatTime(attendance?.clock_out ?? null)}</p>
            </div>
          </div>

          {alreadyDone && (
            <p className="mb-4 rounded border px-3 py-2 text-sm" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
              This employee has completed clocking for today.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleClockIn}
              disabled={!canClockIn || actionLoading}
              className="btn btn-success flex-1 sm:flex-none sm:min-w-[160px]"
            >
              {actionLoading ? "Please wait..." : "Clock In"}
            </button>
            <button
              onClick={handleClockOut}
              disabled={!canClockOut || actionLoading}
              className="btn btn-warning flex-1 sm:flex-none sm:min-w-[160px]"
            >
              {actionLoading ? "Please wait..." : "Clock Out"}
            </button>
          </div>
        </section>
      )}

      {message && (
        <p
          className="rounded border px-4 py-3 text-sm"
          style={{
            borderColor: message.type === "success" ? "var(--success)" : "var(--danger)",
            color: message.type === "success" ? "var(--success)" : "var(--danger)",
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
