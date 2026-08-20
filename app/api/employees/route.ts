import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeEmployee } from "@/lib/serialize";

const VALID_ROLES = ["Senior Staff", "Junior Staff", "National Service Personnel"];

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  const employees = await prisma.employee.findMany({
    where: q
      ? {
          OR: [
            { employeeId: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(employees.map(serializeEmployee));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, department, role, employee_id } = body;

    if (!name?.trim() || !department?.trim() || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
    }

    const requiresId = role !== "National Service Personnel";
    if (requiresId && !employee_id?.trim()) {
      return NextResponse.json(
        { error: "Employee ID is required for this role." },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        name: name.trim(),
        department: department.trim(),
        role,
        employeeId: requiresId ? employee_id.trim() : null,
      },
    });

    return NextResponse.json(serializeEmployee(employee), { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "An employee with that Employee ID already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Could not register employee." }, { status: 500 });
  }
}
