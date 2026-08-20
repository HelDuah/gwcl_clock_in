import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeAttendanceWithEmployee } from "@/lib/serialize";
import { parseDateOnly } from "@/lib/date-server";

export async function GET(request: NextRequest) {
  const start = request.nextUrl.searchParams.get("start");
  const end = request.nextUrl.searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "start and end query params are required." }, { status: 400 });
  }

  const records = await prisma.attendance.findMany({
    where: {
      date: {
        gte: parseDateOnly(start),
        lte: parseDateOnly(end),
      },
    },
    include: { employee: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(records.map(serializeAttendanceWithEmployee));
}
