"use client";

import { useEffect, useState } from "react";
import { Employee } from "@/lib/types";
import EmployeeForm, { EmployeeFormValues } from "@/components/EmployeeForm";

export default function RegisterPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadEmployees() {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleAdd(values: EmployeeFormValues) {
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not register employee.");
    setShowAddForm(false);
    setMessage({ type: "success", text: `${values.name} registered successfully.` });
    loadEmployees();
  }

  async function handleEdit(values: EmployeeFormValues) {
    if (!editing) return;
    const res = await fetch(`/api/employees/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not update employee.");
    setEditing(null);
    setMessage({ type: "success", text: `${values.name} updated successfully.` });
    loadEmployees();
  }

  async function handleDelete(employee: Employee) {
    if (!confirm(`Delete ${employee.name}? This will also remove their attendance history.`)) return;
    const res = await fetch(`/api/employees/${employee.id}`, { method: "DELETE" });
    if (!res.ok) {
      setMessage({ type: "error", text: "Could not delete employee." });
      return;
    }
    setMessage({ type: "success", text: `${employee.name} removed.` });
    loadEmployees();
  }

  const filtered = employees.filter((e) => {
    const q = filter.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      (e.employee_id ?? "").toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="field-label">Register New Employee</p>
          {!showAddForm && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              + New Employee
            </button>
          )}
        </div>
        {showAddForm && (
          <EmployeeForm onSubmit={handleAdd} onCancel={() => setShowAddForm(false)} submitLabel="Register Employee" />
        )}
      </section>

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

      <section className="card p-5">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="field-label">Registered Employees ({employees.length})</p>
          <input
            className="form-input sm:max-w-xs"
            placeholder="Filter by name, ID, or department..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No employees found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="official-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id}>
                    <td className="mono">{emp.employee_id ?? "—"}</td>
                    <td>{emp.name}</td>
                    <td>{emp.department}</td>
                    <td>{emp.role}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-outline px-3 py-1 text-xs" onClick={() => setEditing(emp)}>
                          Edit
                        </button>
                        <button className="btn btn-danger px-3 py-1 text-xs" onClick={() => handleDelete(emp)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-lg p-6">
            <p className="field-label mb-3">Edit Employee</p>
            <EmployeeForm
              initial={editing}
              onSubmit={handleEdit}
              onCancel={() => setEditing(null)}
              submitLabel="Save Changes"
            />
          </div>
        </div>
      )}
    </div>
  );
}
