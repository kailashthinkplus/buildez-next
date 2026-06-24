import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";

export async function GET() {
  const logs = await db.authLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  return NextResponse.json(logs);
}
