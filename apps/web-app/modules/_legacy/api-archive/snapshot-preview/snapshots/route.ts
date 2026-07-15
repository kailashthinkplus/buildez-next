import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { requireTenantEditor } from "@/lib/preview/auth";

export async function GET(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    await requireTenantEditor(params.siteId);

    const snapshots = await db.siteSnapshot.findMany({
      where: { siteId: params.siteId },
      orderBy: { version: "desc" },
      include: { pages: true },
    });

    return NextResponse.json(snapshots);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
