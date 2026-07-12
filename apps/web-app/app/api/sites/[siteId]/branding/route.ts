import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";

async function siteFor(req: NextRequest, siteId: string) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) return null;
  return prisma.site.findFirst({ where: { id: siteId, tenantId: tenant.id } });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await siteFor(req, siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  const tokens = site.designTokens && typeof site.designTokens === "object" ? site.designTokens as Record<string, unknown> : {};
  return NextResponse.json({ siteId, name: site.name, logoUrl: site.logoUrl, profile: tokens.brandIntelligence ?? {} });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await siteFor(req, siteId);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  const body = await req.json();
  const current = site.designTokens && typeof site.designTokens === "object" ? site.designTokens as Record<string, unknown> : {};
  const profile = {
    companyName: String(body.companyName || site.name).trim(),
    industry: String(body.industry || "").trim(),
    audience: String(body.audience || "").trim(),
    offer: String(body.offer || "").trim(),
    tone: String(body.tone || "").trim(),
    websiteUrl: String(body.websiteUrl || "").trim(),
  };
  const updated = await prisma.site.update({ where: { id: siteId }, data: { name: profile.companyName || site.name, designTokens: { ...current, brandIntelligence: profile } }, select: { id: true, name: true, logoUrl: true, designTokens: true } });
  return NextResponse.json({ ok: true, site: updated, profile });
}
