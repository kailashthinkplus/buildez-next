import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { customDomainEntitlement } from "@/lib/domains/entitlements";
import { encodeDomainState } from "@/lib/domains/oauth-state";

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const tenant = await verifyTenantAccess(req);
  const { siteId } = await params;
  const domainId = req.nextUrl.searchParams.get("domainId") || "";
  const domain = tenant && await prisma.siteDomain.findFirst({ where: { id: domainId, siteId, tenantId: tenant.id }, include: { site: { select: { slug: true } } } });
  if (!tenant || !domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  if (!(await customDomainEntitlement(tenant.id)).allowed) return NextResponse.json({ error: "Upgrade to connect a custom domain." }, { status: 403 });
  const clientId = process.env.CLOUDFLARE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.CLOUDFLARE_OAUTH_CLIENT_SECRET;
  const scopes = process.env.CLOUDFLARE_OAUTH_SCOPES;
  if (!clientId || !clientSecret || !scopes) return NextResponse.json({ error: "Cloudflare connection is not configured yet." }, { status: 503 });

  const state = crypto.randomBytes(24).toString("base64url");
  const redirectUri = new URL("/api/domains/cloudflare/callback", req.nextUrl.origin).toString();
  const authorization = new URL("https://dash.cloudflare.com/oauth2/auth");
  authorization.searchParams.set("client_id", clientId);
  authorization.searchParams.set("redirect_uri", redirectUri);
  authorization.searchParams.set("response_type", "code");
  authorization.searchParams.set("scope", scopes);
  authorization.searchParams.set("state", state);
  const response = NextResponse.redirect(authorization);
  response.cookies.set("buildez-domain-cloudflare", encodeDomainState({ state, siteId, domainId, tenantId: tenant.id, returnSlug: domain.site.slug }), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/domains/cloudflare/callback", maxAge: 600 });
  return response;
}
