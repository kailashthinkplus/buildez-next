import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { getUser } from "@/lib/auth/getUser";
import { DOMAIN_SERVER_IP } from "@/lib/domain-provisioning";
import { decodeDomainState } from "@/lib/domains/oauth-state";

type CloudflareZone = { id: string; name: string };
type CloudflareRecord = { id: string; name: string; type: string };

async function cloudflare(token: string, path: string, init?: RequestInit) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers } });
  const payload = await response.json();
  if (!response.ok || payload.success === false) throw new Error(payload.errors?.[0]?.message || "Cloudflare DNS update failed");
  return payload.result;
}

async function upsertRecord(token: string, zoneId: string, record: { type: "A" | "TXT"; name: string; content: string }) {
  const matches = await cloudflare(token, `/zones/${zoneId}/dns_records?type=${record.type}&name=${encodeURIComponent(record.name)}`) as CloudflareRecord[];
  const body = JSON.stringify({ ...record, ttl: 600, proxied: false });
  return matches[0]
    ? cloudflare(token, `/zones/${zoneId}/dns_records/${matches[0].id}`, { method: "PUT", body })
    : cloudflare(token, `/zones/${zoneId}/dns_records`, { method: "POST", body });
}

async function removeConflictingRoutingRecords(token: string, zoneId: string, hostname: string) {
  const records = await cloudflare(token, `/zones/${zoneId}/dns_records?name=${encodeURIComponent(hostname)}&per_page=100`) as CloudflareRecord[];
  const routingRecords = records.filter((record) => ["A", "AAAA", "CNAME"].includes(record.type));
  const keep = routingRecords.find((record) => record.type === "A");
  await Promise.all(
    routingRecords
      .filter((record) => record.id !== keep?.id)
      .map((record) => cloudflare(token, `/zones/${zoneId}/dns_records/${record.id}`, { method: "DELETE" })),
  );
}

export async function GET(req: NextRequest) {
  const state = decodeDomainState(req.cookies.get("buildez-domain-cloudflare")?.value || "");
  const auth = await getUser();
  const fallback = new URL("/app/dashboard", req.nextUrl.origin);
  if (!state || req.nextUrl.searchParams.get("state") !== state.state || !auth?.tenant || auth.tenant.id !== state.tenantId) return NextResponse.redirect(fallback);
  const destination = new URL(`/app/${encodeURIComponent(state.returnSlug)}/settings`, req.nextUrl.origin);
  destination.searchParams.set("tab", "domains");
  const code = req.nextUrl.searchParams.get("code");
  const domain = code && await prisma.siteDomain.findFirst({ where: { id: state.domainId, siteId: state.siteId, tenantId: state.tenantId } });
  if (!code || !domain?.verificationToken) {
    destination.searchParams.set("domainError", "Connection was not completed");
    return NextResponse.redirect(destination);
  }
  try {
    const clientId = process.env.CLOUDFLARE_OAUTH_CLIENT_ID || "";
    const clientSecret = process.env.CLOUDFLARE_OAUTH_CLIENT_SECRET || "";
    const tokenResponse = await fetch("https://dash.cloudflare.com/oauth2/token", { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: new URL("/api/domains/cloudflare/callback", req.nextUrl.origin).toString() }) });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok || !token.access_token) throw new Error("Cloudflare authorization failed");
    const zones = await cloudflare(token.access_token, "/zones?status=active&per_page=50") as CloudflareZone[];
    const zone = zones.filter((candidate) => domain.domain === candidate.name || domain.domain.endsWith(`.${candidate.name}`)).sort((a, b) => b.name.length - a.name.length)[0];
    if (!zone) throw new Error("The domain is not available in the connected Cloudflare account");
    await removeConflictingRoutingRecords(token.access_token, zone.id, domain.domain);
    await Promise.all([
      upsertRecord(token.access_token, zone.id, { type: "A", name: domain.domain, content: DOMAIN_SERVER_IP }),
      upsertRecord(token.access_token, zone.id, { type: "TXT", name: `_buildez-verification.${domain.domain}`, content: domain.verificationToken }),
    ]);
    await prisma.siteDomain.update({ where: { id: domain.id }, data: { provider: "CLOUDFLARE", status: "PENDING" } });
    destination.searchParams.set("domainConnected", "1");
  } catch (error) {
    destination.searchParams.set("domainError", error instanceof Error ? error.message : "Connection failed");
  }
  const response = NextResponse.redirect(destination);
  response.cookies.delete("buildez-domain-cloudflare");
  return response;
}
