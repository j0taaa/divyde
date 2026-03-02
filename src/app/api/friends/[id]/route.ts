import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/friends/[id] - Get a single friend with their debts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const friend = await prisma.friend.findFirst({
      where: {
        id,
        userId: session.userId,
      },
      include: {
        debts: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!friend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    // Calculate balance
    const balance = friend.debts
      .filter((d) => !d.isPaid)
      .reduce((sum, debt) => {
        if (debt.direction === "they-owe") {
          return sum + debt.amount;
        } else {
          return sum - debt.amount;
        }
      }, 0);

    // Build avatar data
    const avatar =
      friend.avatarType === "custom" && friend.avatarHairColor
        ? {
            hairColor: friend.avatarHairColor,
            hairStyle: friend.avatarHairStyle,
            eyeColor: friend.avatarEyeColor,
            skinColor: friend.avatarSkinColor,
            backgroundColor: friend.avatarBgColor,
          }
        : undefined;

    const debts = friend.debts.map((debt) => ({
      id: debt.id,
      amount: debt.amount,
      direction: debt.direction,
      description: debt.description,
      isPaid: debt.isPaid,
      date: debt.date.toISOString().split("T")[0],
      paidAt: debt.paidAt?.toISOString(),
    }));

    return NextResponse.json({
      friend: {
        id: friend.id,
        name: friend.name,
        email: friend.email,
        avatar,
        avatarColor: friend.avatarColor,
        balance,
        debts,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get friend error:", error);
    return NextResponse.json(
      { error: "Failed to get friend" },
      { status: 500 }
    );
  }
}

// DELETE /api/friends/[id] - Delete a friend
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Verify ownership
    const friend = await prisma.friend.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!friend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    // Delete friend (cascades to debts)
    await prisma.friend.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete friend error:", error);
    return NextResponse.json(
      { error: "Failed to delete friend" },
      { status: 500 }
    );
  }
}

// PATCH /api/friends/[id] - Update a friend
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { name, avatarType, avatarColor, avatar } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existingFriend = await prisma.friend.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!existingFriend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    const friendData: {
      name: string;
      avatarType: string;
      avatarColor: string | null;
      avatarHairColor: string | null;
      avatarHairStyle: string | null;
      avatarEyeColor: string | null;
      avatarSkinColor: string | null;
      avatarBgColor: string | null;
    } = {
      name: name.trim(),
      avatarType: avatarType || "initials",
      avatarColor: null,
      avatarHairColor: null,
      avatarHairStyle: null,
      avatarEyeColor: null,
      avatarSkinColor: null,
      avatarBgColor: null,
    };

    if (avatarType === "custom" && avatar) {
      friendData.avatarHairColor = avatar.hairColor;
      friendData.avatarHairStyle = avatar.hairStyle;
      friendData.avatarEyeColor = avatar.eyeColor;
      friendData.avatarSkinColor = avatar.skinColor;
      friendData.avatarBgColor = avatar.backgroundColor;
    } else if (avatarColor) {
      friendData.avatarColor = avatarColor;
    }

    const friend = await prisma.friend.update({
      where: { id },
      data: friendData,
    });

    return NextResponse.json({ friend });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update friend error:", error);
    return NextResponse.json(
      { error: "Failed to update friend" },
      { status: 500 }
    );
  }
}
