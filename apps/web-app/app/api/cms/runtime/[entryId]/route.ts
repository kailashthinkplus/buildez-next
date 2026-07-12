import { NextResponse } from "next/server";
import { prisma } from "@buildez/db";

export async function GET(_: Request, { params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;
  const entry = await prisma.cmsEntry.findFirst({ where: { id: entryId, status: "PUBLISHED" }, select: { id: true, data: true, updatedAt: true } });
  if (!entry) return NextResponse.json({ error: "Published entry not found" }, { status: 404, headers: { "Cache-Control": "public, max-age=30" } });
  return NextResponse.json({ entry }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
