import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// PATCH /api/debts/[id] - Update a debt (mark as paid, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const debt = await prisma.debt.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!debt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }

    // Build update data
    const updateData: {
      isPaid?: boolean;
      paidAt?: Date | null;
      amount?: number;
      description?: string;
    } = {};

    if (typeof body.isPaid === "boolean") {
      updateData.isPaid = body.isPaid;
      updateData.paidAt = body.isPaid ? new Date() : null;
    }

    if (typeof body.amount === "number" && body.amount > 0) {
      updateData.amount = body.amount;
    }

    if (typeof body.description === "string") {
      updateData.description = body.description;
    }

    const updatedDebt = await prisma.debt.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      debt: {
        id: updatedDebt.id,
        amount: updatedDebt.amount,
        direction: updatedDebt.direction,
        description: updatedDebt.description,
        isPaid: updatedDebt.isPaid,
        date: updatedDebt.date.toISOString().split("T")[0],
        paidAt: updatedDebt.paidAt?.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update debt error:", error);
    return NextResponse.json(
      { error: "Failed to update debt" },
      { status: 500 }
    );
  }
}

// DELETE /api/debts/[id] - Delete a debt
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Verify ownership
    const debt = await prisma.debt.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!debt) {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }

    await prisma.debt.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete debt error:", error);
    return NextResponse.json(
      { error: "Failed to delete debt" },
      { status: 500 }
    );
  }
}

