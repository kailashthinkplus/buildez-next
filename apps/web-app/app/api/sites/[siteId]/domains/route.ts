import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { DOMAIN_SERVER_IP, provisionNginxDomain, validDomain } from "@/lib/domain-provisioning";
import { detectDnsProvider } from "@/lib/domains/dns-verification";
import { verifyDomainRecord } from "@/lib/domains/autoVerify";
import { customDomainEntitlement } from "@/lib/domains/entitlements";

const normalize = (value: string) => value.toLowerCase().trim().replace(/^https?:\/\//, "").split("/")[0].replace(/\.$/, "");
const platformDomain = () => process.env.PLATFORM_DOMAIN || "getbuildezy.com";

async function siteAccess(req: NextRequest, siteId: string) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) return null;
  const site = await prisma.site.findFirst({ where: { id: siteId, tenantId: tenant.id, deletedAt: null } });
  return site ? { site, tenant } : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const access = await siteAccess(req, siteId);
  if (!access) return NextResponse.json({ error: "Website not found" }, { status: 404 });
  const [domainRows, entitlement] = await Promise.all([
    prisma.siteDomain.findMany({ where: { siteId }, orderBy: { createdAt: "desc" } }),
    customDomainEntitlement(access.tenant.id),
  ]);
  const domains = await Promise.all(domainRows.map(async (row) => ({
    ...row,
    detectedDnsProvider: row.status === "VERIFIED" ? null : await detectDnsProvider(row.domain),
  })));
  return NextResponse.json({
    domains,
    canUseCustomDomain: entitlement.allowed,
    serverIp: DOMAIN_SERVER_IP,
    platformUrl: `https://${access.site.slug}.${platformDomain()}`,
    records: { routing: { type: "A", value: DOMAIN_SERVER_IP }, verificationHostPrefix: "_buildez-verification" },
    integrations: {
      cloudflare: Boolean(process.env.CLOUDFLARE_OAUTH_CLIENT_ID && process.env.CLOUDFLARE_OAUTH_CLIENT_SECRET && process.env.CLOUDFLARE_OAUTH_SCOPES),
      godaddy: Boolean(process.env.DOMAIN_CONNECT_PROVIDER_ID),
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const access = await siteAccess(req, siteId);
  if (!access) return NextResponse.json({ error: "Website not found" }, { status: 404 });
  if (!(await customDomainEntitlement(access.tenant.id)).allowed) return NextResponse.json({ error: "Custom domains are available on paid plans." }, { status: 403 });
  const body = await req.json().catch(() => null);
  const domain = normalize(body?.domain || "");
  if (!validDomain(domain) || domain === platformDomain() || domain.endsWith(`.${platformDomain()}`)) return NextResponse.json({ error: "Enter a valid custom domain" }, { status: 400 });
  try {
    const record = await prisma.siteDomain.create({ data: { siteId, tenantId: access.tenant.id, domain, cnameTarget: DOMAIN_SERVER_IP, verificationToken: `buildez-verification=${crypto.randomBytes(24).toString("base64url")}` } });
    return NextResponse.json({ domain: record }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "This domain is already connected" }, { status: 409 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const access = await siteAccess(req, siteId);
  if (!access) return NextResponse.json({ error: "Website not found" }, { status: 404 });
  if (!(await customDomainEntitlement(access.tenant.id)).allowed) return NextResponse.json({ error: "Upgrade to publish on a custom domain." }, { status: 403 });
  const body = await req.json().catch(() => null);
  const record = await prisma.siteDomain.findFirst({ where: { id: body?.domainId, siteId } });
  if (!record?.verificationToken) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

  const result = await verifyDomainRecord(record);
  const domain = await prisma.siteDomain.findUnique({ where: { id: record.id } });
  if ("error" in result && result.error) {
    return NextResponse.json({ error: "DNS is ready, but secure publishing could not be activated.", detail: result.error instanceof Error ? result.error.message : "Provisioning failed", domain, propagation: result.propagation }, { status: 502 });
  }
  return NextResponse.json({ domain, verified: result.verified, propagation: result.propagation, provisioning: "provisioning" in result ? result.provisioning : undefined, activationPending: "activationPending" in result ? result.activationPending : undefined });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const access = await siteAccess(req, siteId);
  const id = req.nextUrl.searchParams.get("domainId") || "";
  const record = access && await prisma.siteDomain.findFirst({ where: { id, siteId } });
  if (!record) return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  if (record.sslStatus === "ACTIVE") {
    try { await provisionNginxDomain("remove", record.domain); }
    catch (error) { return NextResponse.json({ error: "Secure domain removal failed", detail: error instanceof Error ? error.message : "Unknown error" }, { status: 502 }); }
  }
  await prisma.siteDomain.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
