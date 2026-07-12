import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { industryCollections, validFields } from "@/lib/cms";

async function siteFor(req: NextRequest, siteId: string) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) return null;
  return prisma.site.findFirst({ where: { id: siteId, tenantId: tenant.id } });
}

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get("siteId") || "";
  const site = await siteFor(req, siteId);
  if (!site) return NextResponse.json({ error: "Unauthorized or site not found" }, { status: 404 });
  let collections = await prisma.cmsCollection.findMany({ where: { siteId }, include: { _count: { select: { entries: true } } }, orderBy: { createdAt: "asc" } });
  if (!collections.length) {
    const tokens = (site.designTokens || {}) as Record<string, any>;
    const industry = tokens?.brandIntelligence?.industry || tokens?.industry || "general";
    await prisma.$transaction(industryCollections(String(industry)).map((preset) => prisma.cmsCollection.create({ data: { siteId, ...preset } })));
    collections = await prisma.cmsCollection.findMany({ where: { siteId }, include: { _count: { select: { entries: true } } }, orderBy: { createdAt: "asc" } });
  }
  return NextResponse.json({ collections });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const site = body && await siteFor(req, body.siteId);
  if (!site) return NextResponse.json({ error: "Unauthorized or site not found" }, { status: 404 });
  if (!body.name?.trim() || !validFields(body.fields)) return NextResponse.json({ error: "A name and at least one valid field are required" }, { status: 400 });
  const slug = String(body.slug || body.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const collection = await prisma.cmsCollection.create({ data: { siteId: site.id, name: body.name.trim(), slug, description: body.description || null, icon: body.icon || "database", fields: body.fields } });
  return NextResponse.json({ collection }, { status: 201 });
}
