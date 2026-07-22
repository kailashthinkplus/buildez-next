import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { authorizedSite, notFound } from "../../_auth";
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ keyId: string }> }) {
  const { keyId } = await params; const siteId = req.nextUrl.searchParams.get("siteId") || "";
  if (!await authorizedSite(req, siteId)) return notFound();
  const result = await prisma.crmApiKey.updateMany({ where: { id:keyId,siteId,revokedAt:null }, data: { revokedAt:new Date() } });
  if (!result.count) return notFound();
  return NextResponse.json({ ok:true });
}
