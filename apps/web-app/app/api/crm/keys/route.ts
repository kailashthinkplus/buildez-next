import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { authorizedSite, notFound } from "../_auth";
import { newApiKey } from "@/lib/crm";

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId") || "";
  if (!await authorizedSite(req, siteId)) return notFound();
  const keys = await prisma.crmApiKey.findMany({ where: { siteId }, select: { id:true,name:true,keyPrefix:true,createdAt:true,lastUsedAt:true,revokedAt:true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ keys });
}
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!await authorizedSite(req, body.siteId)) return notFound();
  const generated = newApiKey();
  const key = await prisma.crmApiKey.create({ data: { siteId: body.siteId, name: String(body.name || "Website integration").slice(0, 100), keyPrefix: generated.prefix, keyHash: generated.hash } });
  return NextResponse.json({ key: { id:key.id,name:key.name,keyPrefix:key.keyPrefix,createdAt:key.createdAt }, secret: generated.raw }, { status: 201 });
}
