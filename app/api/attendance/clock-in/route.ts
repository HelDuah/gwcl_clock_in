import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeAttendance } from "@/lib/serialize";
import { todayDateOnly } from "@/lib/date-server";

export async function POST(request: NextRequest) {
  try {
    const { employeeRef } = await request.json();
    if (!employeeRef) {
      return NextResponse.json({ error: "employeeRef is required." }, { status: 400 });
    }

    const record = await prisma.attendance.create({
      data: {
        employeeRef,
        date: todayDateOnly(),
        clockIn: new Date(),
      },
    });

    return NextResponse.json(serializeAttendance(record), { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "This employee already has a record for today." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Could not clock in." }, { status: 500 });
  }
}
