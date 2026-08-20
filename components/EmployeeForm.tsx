"use client";

import { useState } from "react";
import { Employee, Role } from "@/lib/types";

const DEPARTMENTS = [
  "Operations",
  "Distribution",
  "Customer Service",
  "Finance & Accounts",
  "Human Resources",
  "Engineering",
  "Security",
  "Administration",
  "Commercial",
  "Other",
];

export interface EmployeeFormValues {
  name: string;
  department: string;
  role: Role;
  employee_id: string | null;
}

export default function EmployeeForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: {
  initial?: Partial<Employee>;
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const isKnownDept = initial?.department && DEPARTMENTS.includes(initial.department);
  const [name, setName] = useState(initial?.name ?? "");
  const [department, setDepartment] = useState(isKnownDept ? initial!.department! : initial?.department ? "Other" : "");
  const [customDepartment, setCustomDepartment] = useState(isKnownDept ? "" : initial?.department ?? "");
  const [role, setRole] = useState<Role>(initial?.role ?? "Senior Staff");
  const [employeeId, setEmployeeId] = useState(initial?.employee_id ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const requiresId = role !== "National Service Personnel";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const finalDepartment = department === "Other" ? customDepartment.trim() : department;

    if (!name.trim()) return setError("Name is required.");
    if (!finalDepartment) return setError("Department is required.");
    if (requiresId && !employeeId.trim()) return setError("Employee ID is required for this role.");

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        department: finalDepartment,
        role,
        employee_id: requiresId ? employeeId.trim() : null,
      });
    } catch (err: any) {
      setError(err?.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="field-label mb-1 block">Full Name</label>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label mb-1 block">Department</label>
          <select className="form-input" value={department} onChange={(e) => setDepartment(e.target.value)} required>
            <option value="" disabled>
              Select department
            </option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {department === "Other" && (
            <input
              className="form-input mt-2"
              placeholder="Enter department name"
              value={customDepartment}
              onChange={(e) => setCustomDepartment(e.target.value)}
              required
            />
          )}
        </div>

        <div>
          <label className="field-label mb-1 block">Role</label>
          <select className="form-input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="Senior Staff">Senior Staff</option>
            <option value="Junior Staff">Junior Staff</option>
            <option value="National Service Personnel">National Service Personnel</option>
          </select>
        </div>
      </div>

      {requiresId ? (
        <div>
          <label className="field-label mb-1 block">Employee ID</label>
          <input
            className="form-input mono"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="e.g. GWL-0231"
            required
          />
        </div>
      ) : (
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          National Service Personnel do not require an Employee ID — this person will be searchable by name only.
        </p>
      )}

      {error && (
        <p className="rounded border px-3 py-2 text-sm" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
