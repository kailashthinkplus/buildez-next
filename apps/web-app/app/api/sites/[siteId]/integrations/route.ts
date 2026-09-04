import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { MARKETPLACE_APPS, validateIntegrationConfig } from "@/modules/integrations/catalog";

async function findSite(req: NextRequest, siteId: string) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) return null;
  return prisma.site.findFirst({ where: { id: siteId, tenantId: tenant.id, deletedAt: null }, select: { id: true } });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await findSite(req, siteId);
  if (!site) return NextResponse.json({ error: "Website not found" }, { status: 404 });

  const installed = await prisma.siteIntegration.findMany({ where: { siteId: site.id }, select: { appSlug: true, config: true } });
  const installedBySlug = new Map(installed.map((row) => [row.appSlug, row.config]));

  return NextResponse.json({
    apps: MARKETPLACE_APPS.map((app) => ({
      ...app,
      configFields: app.configFields?.map(({ key, label, placeholder, helpText }) => ({ key, label, placeholder, helpText })),
      installed: installedBySlug.has(app.slug),
      config: app.functional ? installedBySlug.get(app.slug) ?? null : null,
    })),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await findSite(req, siteId);
  if (!site) return NextResponse.json({ error: "Website not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const appSlug = typeof body.appSlug === "string" ? body.appSlug : "";
  const validation = validateIntegrationConfig(appSlug, body.config);
  if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });

  await prisma.siteIntegration.upsert({
    where: { siteId_appSlug: { siteId: site.id, appSlug } },
    create: { siteId: site.id, appSlug, config: validation.config },
    update: { config: validation.config },
  });

  return NextResponse.json({ appSlug, config: validation.config, installed: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = await findSite(req, siteId);
  if (!site) return NextResponse.json({ error: "Website not found" }, { status: 404 });

  const appSlug = new URL(req.url).searchParams.get("appSlug") || "";
  await prisma.siteIntegration.deleteMany({ where: { siteId: site.id, appSlug } });

  return NextResponse.json({ appSlug, installed: false });
}
