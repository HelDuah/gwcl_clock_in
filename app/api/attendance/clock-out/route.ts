import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeAttendance } from "@/lib/serialize";

export async function POST(request: NextRequest) {
  try {
    const { attendanceId } = await request.json();
    if (!attendanceId) {
      return NextResponse.json({ error: "attendanceId is required." }, { status: 400 });
    }

    const existing = await prisma.attendance.findUnique({ where: { id: attendanceId } });
    if (!existing) {
      return NextResponse.json({ error: "Attendance record not found." }, { status: 404 });
    }
    if (!existing.clockIn) {
      return NextResponse.json(
        { error: "This employee has not been clocked in yet today." },
        { status: 409 }
      );
    }
    if (existing.clockOut) {
      return NextResponse.json(
        { error: "This employee has already been clocked out today." },
        { status: 409 }
      );
    }

    const record = await prisma.attendance.update({
      where: { id: attendanceId },
      data: { clockOut: new Date() },
    });

    return NextResponse.json(serializeAttendance(record));
  } catch (err) {
    return NextResponse.json({ error: "Could not clock out." }, { status: 500 });
  }
}
