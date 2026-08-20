import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeEmployee } from "@/lib/serialize";

const VALID_ROLES = ["Senior Staff", "Junior Staff", "National Service Personnel"];

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        department: department.trim(),
        role,
        employeeId: requiresId ? employee_id.trim() : null,
      },
    });

    return NextResponse.json(serializeEmployee(employee));
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "An employee with that Employee ID already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Could not update employee." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.employee.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Could not delete employee." }, { status: 500 });
  }
}
