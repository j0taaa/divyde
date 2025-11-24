import { NextResponse } from "next/server";
import { verifyDatabaseConnection } from "@/lib/db";

export async function GET() {
  try {
    const databaseOk = await verifyDatabaseConnection();

    return NextResponse.json({ status: "ok", database: databaseOk });
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json(
      { status: "error", message: "Health check failed" },
      { status: 500 },
    );
  }
}
