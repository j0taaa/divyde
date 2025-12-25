import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/debts - List all debts
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "all" | "outstanding" | "paid"
    const friendId = searchParams.get("friendId");

    const where: {
      userId: string;
      isPaid?: boolean;
      friendId?: string;
    } = {
      userId: session.userId,
    };

    if (filter === "outstanding") {
      where.isPaid = false;
    } else if (filter === "paid") {
      where.isPaid = true;
    }

    if (friendId) {
      where.friendId = friendId;
    }

    const debts = await prisma.debt.findMany({
      where,
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            avatarType: true,
            avatarColor: true,
            avatarHairColor: true,
            avatarHairStyle: true,
            avatarEyeColor: true,
            avatarSkinColor: true,
            avatarBgColor: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const formattedDebts = debts.map((debt) => {
      const avatar =
        debt.friend.avatarType === "custom" && debt.friend.avatarHairColor
          ? {
              hairColor: debt.friend.avatarHairColor,
              hairStyle: debt.friend.avatarHairStyle,
              eyeColor: debt.friend.avatarEyeColor,
              skinColor: debt.friend.avatarSkinColor,
              backgroundColor: debt.friend.avatarBgColor,
            }
          : undefined;

      return {
        id: debt.id,
        amount: debt.amount,
        direction: debt.direction,
        description: debt.description,
        isPaid: debt.isPaid,
        date: debt.date.toISOString().split("T")[0],
        paidAt: debt.paidAt?.toISOString(),
        friendId: debt.friendId,
        friend: {
          id: debt.friend.id,
          name: debt.friend.name,
          avatar,
          avatarColor: debt.friend.avatarColor,
        },
      };
    });

    // Calculate totals
    const totals = debts.reduce(
      (acc, debt) => {
        if (!debt.isPaid) {
          if (debt.direction === "they-owe") {
            acc.totalOwed += debt.amount;
          } else {
            acc.totalOwing += debt.amount;
          }
        }
        return acc;
      },
      { totalOwed: 0, totalOwing: 0 }
    );

    return NextResponse.json({
      debts: formattedDebts,
      totals,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get debts error:", error);
    return NextResponse.json(
      { error: "Failed to get debts" },
      { status: 500 }
    );
  }
}

// POST /api/debts - Create a new debt
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const { amount, direction, description, friendIds, date } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (!direction || !["they-owe", "you-owe"].includes(direction)) {
      return NextResponse.json(
        { error: "Direction must be 'they-owe' or 'you-owe'" },
        { status: 400 }
      );
    }

    if (!friendIds || !Array.isArray(friendIds) || friendIds.length === 0) {
      return NextResponse.json(
        { error: "At least one friend must be selected" },
        { status: 400 }
      );
    }

    // Verify all friends belong to the user
    const friends = await prisma.friend.findMany({
      where: {
        id: { in: friendIds },
        userId: session.userId,
      },
    });

    if (friends.length !== friendIds.length) {
      return NextResponse.json(
        { error: "One or more friends not found" },
        { status: 404 }
      );
    }

    // Calculate amount per person (split equally)
    // Round to 2 decimal places to avoid floating-point precision issues
    const amountPerPerson = Math.round((amount / friendIds.length) * 100) / 100;

    // Create debts for each friend
    const debts = await prisma.debt.createMany({
      data: friendIds.map((friendId: string) => ({
        amount: amountPerPerson,
        direction,
        description: description || null,
        userId: session.userId,
        friendId,
        date: date ? new Date(date) : new Date(),
      })),
    });

    return NextResponse.json({ count: debts.count }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create debt error:", error);
    return NextResponse.json(
      { error: "Failed to create debt" },
      { status: 500 }
    );
  }
}

