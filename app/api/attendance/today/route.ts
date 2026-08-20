import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeAttendance } from "@/lib/serialize";
import { todayDateOnly } from "@/lib/date-server";

export async function GET(request: NextRequest) {
  const employeeRef = request.nextUrl.searchParams.get("employeeRef");
  if (!employeeRef) {
    return NextResponse.json({ error: "employeeRef is required." }, { status: 400 });
  }

  const record = await prisma.attendance.findUnique({
    where: { employeeRef_date: { employeeRef, date: todayDateOnly() } },
  });

  return NextResponse.json(record ? serializeAttendance(record) : null);
}
