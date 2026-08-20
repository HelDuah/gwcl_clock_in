// Converts Prisma's camelCase records to the snake_case shape the front-end
// components use (kept from the original design so the UI code stays simple).

export function serializeEmployee(e: any) {
  return {
    id: e.id,
    employee_id: e.employeeId,
    name: e.name,
    department: e.department,
    role: e.role,
    created_at: e.createdAt,
  };
}

export function serializeAttendance(a: any) {
  return {
    id: a.id,
    employee_ref: a.employeeRef,
    date: a.date.toISOString().slice(0, 10),
    clock_in: a.clockIn ? a.clockIn.toISOString() : null,
    clock_out: a.clockOut ? a.clockOut.toISOString() : null,
    created_at: a.createdAt,
  };
}

export function serializeAttendanceWithEmployee(a: any) {
  return {
    ...serializeAttendance(a),
    employees: a.employee ? serializeEmployee(a.employee) : null,
  };
}
