import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ user: null });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const avatarIcon = typeof body.avatarIcon === "string" ? body.avatarIcon.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        avatarIcon: avatarIcon || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarIcon: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
