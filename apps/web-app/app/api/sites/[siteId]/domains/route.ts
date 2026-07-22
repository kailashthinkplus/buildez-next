import dns from "node:dns/promises";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { DOMAIN_SERVER_IP, provisionNginxDomain } from "@/lib/domain-provisioning";

const normalize = (value: string) => value.toLowerCase().trim().replace(/^https?:\/\//, "").split("/")[0].replace(/\.$/, "");
async function siteAccess(req: NextRequest, siteId: string) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) return null;
  const site = await prisma.site.findFirst({ where: { id: siteId, tenantId: tenant.id, deletedAt: null } });
  return site ? { site, tenant } : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params; const access = await siteAccess(req, siteId);
  if (!access) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  const domains = await prisma.siteDomain.findMany({ where: { siteId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ domains, serverIp: DOMAIN_SERVER_IP, platformUrl: `https://${access.site.slug}.${process.env.PLATFORM_DOMAIN || "buildez.app"}` });
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params; const access = await siteAccess(req, siteId); const body = await req.json().catch(() => null); const domain = normalize(body?.domain || "");
  if (!access || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain)) return NextResponse.json({ error: "Enter a valid domain" }, { status: 400 });
  try {
    const record = await prisma.siteDomain.create({ data: { siteId, tenantId: access.tenant.id, domain, cnameTarget: DOMAIN_SERVER_IP } });
    try {
      const provisioning = await provisionNginxDomain("add", domain);
      return NextResponse.json({ domain: record, provisioning }, { status: 201 });
    } catch (error) {
      await prisma.siteDomain.update({ where: { id: record.id }, data: { status: "FAILED" } });
      return NextResponse.json({ error: "Domain was saved, but the production server could not configure Nginx", detail: error instanceof Error ? error.message : "Nginx provisioning failed", domain: record }, { status: 502 });
    }
  }
  catch { return NextResponse.json({ error: "This domain is already connected" }, { status: 409 }); }
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params; const access = await siteAccess(req, siteId); const body = await req.json().catch(() => null);
  const record = access && await prisma.siteDomain.findFirst({ where: { id: body?.domainId, siteId } }); if (!record) return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  try { await provisionNginxDomain("add", record.domain); } catch (error) { return NextResponse.json({ error: "Nginx provisioning failed", detail: error instanceof Error ? error.message : "Unknown error" }, { status: 502 }); }
  let verified = false; try { const records = await dns.resolve4(record.domain); verified = records.includes(DOMAIN_SERVER_IP); } catch {}
  const domain = await prisma.siteDomain.update({ where: { id: record.id }, data: { status: verified ? "VERIFIED" : "FAILED", verifiedAt: verified ? new Date() : null } });
  return NextResponse.json({ domain, verified });
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params; const access = await siteAccess(req, siteId); const id = req.nextUrl.searchParams.get("domainId") || "";
  const record = access && await prisma.siteDomain.findFirst({ where: { id, siteId } }); if (!record) return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  try { await provisionNginxDomain("remove", record.domain); } catch (error) { return NextResponse.json({ error: "Nginx removal failed", detail: error instanceof Error ? error.message : "Unknown error" }, { status: 502 }); }
  await prisma.siteDomain.delete({ where: { id } }); return NextResponse.json({ success: true });
}
