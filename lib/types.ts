export type Role = "Senior Staff" | "Junior Staff" | "National Service Personnel";

export interface Employee {
  id: string;
  employee_id: string | null;
  name: string;
  department: string;
  role: Role;
  created_at: string;
}

export interface Attendance {
  id: string;
  employee_ref: string;
  date: string; // YYYY-MM-DD
  clock_in: string | null; // ISO timestamp
  clock_out: string | null; // ISO timestamp
  created_at: string;
}

export interface AttendanceWithEmployee extends Attendance {
  employees: Employee | null;
}
