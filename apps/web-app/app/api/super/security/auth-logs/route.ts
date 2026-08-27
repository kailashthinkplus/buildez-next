import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { requireSuperAdmin, superAdminErrorResponse } from "@/lib/superadmin/auth";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
    const logs = await prisma.authLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { email: true, name: true } } },
    });

    return NextResponse.json(logs);
  } catch (error) {
    return superAdminErrorResponse(error);
  }
}
