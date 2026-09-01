import crypto from "node:crypto";
import dns from "node:dns/promises";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { DOMAIN_SERVER_IP } from "@/lib/domain-provisioning";
import { customDomainEntitlement } from "@/lib/domains/entitlements";

async function dnsZone(hostname: string) {
  const labels = hostname.split(".");
  for (let index = 0; index <= labels.length - 2; index += 1) {
    const candidate = labels.slice(index).join(".");
    if ((await dns.resolveNs(candidate).catch(() => [])).length) return candidate;
  }
  return hostname;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const tenant = await verifyTenantAccess(req);
  const { siteId } = await params;
  const domainId = req.nextUrl.searchParams.get("domainId") || "";
  const domain = tenant && await prisma.siteDomain.findFirst({ where: { id: domainId, siteId, tenantId: tenant.id }, include: { site: { select: { slug: true } } } });
  if (!tenant || !domain?.verificationToken) return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  if (!(await customDomainEntitlement(tenant.id)).allowed) return NextResponse.json({ error: "Upgrade to connect a custom domain." }, { status: 403 });
  const providerId = process.env.DOMAIN_CONNECT_PROVIDER_ID;
  const serviceId = process.env.DOMAIN_CONNECT_SERVICE_ID || "website";
  if (!providerId) return NextResponse.json({ error: "GoDaddy connection is awaiting provider onboarding." }, { status: 503 });

  const zone = await dnsZone(domain.domain);
  const host = domain.domain === zone ? "" : domain.domain.slice(0, -(zone.length + 1));
  const redirectUri = new URL(`/app/${encodeURIComponent(domain.site.slug)}/settings`, req.nextUrl.origin);
  redirectUri.searchParams.set("tab", "domains");
  redirectUri.searchParams.set("domainConnected", "1");
  const apply = new URL(`/v2/domainTemplates/providers/${encodeURIComponent(providerId)}/services/${encodeURIComponent(serviceId)}/apply`, process.env.GODADDY_DOMAIN_CONNECT_URL || "https://domainconnect.godaddy.com");
  apply.searchParams.set("domain", zone);
  if (host) apply.searchParams.set("host", host);
  apply.searchParams.set("redirect_uri", redirectUri.toString());
  apply.searchParams.set("state", crypto.randomBytes(20).toString("base64url"));
  apply.searchParams.set("serverIp", DOMAIN_SERVER_IP);
  apply.searchParams.set("verification", domain.verificationToken);
  await prisma.siteDomain.update({ where: { id: domain.id }, data: { provider: "GODADDY", status: "PENDING" } });
  return NextResponse.redirect(apply);
}
