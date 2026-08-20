import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are both required." },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 4) {
      return NextResponse.json(
        { error: "New password must be at least 4 characters." },
        { status: 400 }
      );
    }

    const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });

    if (!settings) {
      return NextResponse.json({ error: "Could not read current password." }, { status: 500 });
    }

    if (currentPassword !== settings.password) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    await prisma.appSettings.update({
      where: { id: 1 },
      data: { password: newPassword },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
