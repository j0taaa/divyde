import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/friends - List all friends with their balances
export async function GET() {
  try {
    const session = await requireAuth();

    const friends = await prisma.friend.findMany({
      where: { userId: session.userId },
      include: {
        debts: {
          select: {
            id: true,
            amount: true,
            direction: true,
            isPaid: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Calculate balance for each friend
    const friendsWithBalance = friends.map((friend) => {
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

      return {
        id: friend.id,
        name: friend.name,
        email: friend.email,
        avatar,
        avatarColor: friend.avatarColor,
        balance,
        debtCount: friend.debts.filter((d) => !d.isPaid).length,
      };
    });

    return NextResponse.json({ friends: friendsWithBalance });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get friends error:", error);
    return NextResponse.json(
      { error: "Failed to get friends" },
      { status: 500 }
    );
  }
}

// POST /api/friends - Create a new friend
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const { name, email, avatarType, avatarColor, avatar } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const friendData: {
      name: string;
      email?: string;
      userId: string;
      avatarType: string;
      avatarColor?: string;
      avatarHairColor?: string;
      avatarHairStyle?: string;
      avatarEyeColor?: string;
      avatarSkinColor?: string;
      avatarBgColor?: string;
    } = {
      name: name.trim(),
      userId: session.userId,
      avatarType: avatarType || "initials",
    };

    if (email) {
      friendData.email = email.toLowerCase();
    }

    if (avatarType === "custom" && avatar) {
      friendData.avatarHairColor = avatar.hairColor;
      friendData.avatarHairStyle = avatar.hairStyle;
      friendData.avatarEyeColor = avatar.eyeColor;
      friendData.avatarSkinColor = avatar.skinColor;
      friendData.avatarBgColor = avatar.backgroundColor;
    } else if (avatarColor) {
      friendData.avatarColor = avatarColor;
    }

    const friend = await prisma.friend.create({
      data: friendData,
    });

    return NextResponse.json({ friend }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create friend error:", error);
    return NextResponse.json(
      { error: "Failed to create friend" },
      { status: 500 }
    );
  }
}

