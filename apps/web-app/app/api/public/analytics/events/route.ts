import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, prisma } from "@buildez/db";

const allowed = new Set(["pageview", "click", "heartbeat", "conversion"]);
const clean = (value: unknown, max: number) => typeof value === "string" ? value.slice(0, max) : "";
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null); const siteId = clean(body?.siteId, 64); const eventType = clean(body?.eventType, 24);
  if (!siteId || !allowed.has(eventType)) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  const site = await prisma.site.findFirst({ where: { id: siteId, status: "PUBLISHED", deletedAt: null }, select: { id: true, tenantId: true } });
  if (!site) return NextResponse.json({ error: "Site unavailable" }, { status: 404 });
  const hashSecret = process.env.ANALYTICS_HASH_SECRET || process.env.AUTH_SECRET;
  if (!hashSecret) {
    // Fail closed rather than pseudonymizing visitors with a predictable,
    // publicly-known literal key if the deploy is misconfigured.
    return NextResponse.json({ error: "Analytics unavailable" }, { status: 503 });
  }
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(); const ip = forwarded || req.headers.get("x-real-ip") || "unknown";
  const visitorHash = crypto.createHmac("sha256", hashSecret).update(`${ip}:${clean(body.visitorId, 80)}`).digest("hex");
  const ua = req.headers.get("user-agent") || ""; const device = /bot|crawler|spider/i.test(ua) ? "bot" : /mobile|android|iphone/i.test(ua) ? "mobile" : /tablet|ipad/i.test(ua) ? "tablet" : "desktop";
  const now = new Date(); const bucket = new Date(now); bucket.setMinutes(0, 0, 0);
  await prisma.trafficEvent.create({ data: { tenantId: site.tenantId, siteId, domain: clean(body.domain, 255) || req.nextUrl.hostname, path: clean(body.path, 1000) || "/", method: "CLIENT", status: 200, country: clean(req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country"), 80) || null, city: clean(req.headers.get("cf-ipcity") || req.headers.get("x-vercel-ip-city"), 120) || null, referrer: clean(body.referrer, 2000) || null, device, visitorHash, sessionId: clean(body.sessionId, 100) || null, eventType, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata as Prisma.InputJsonValue : undefined, bucket } });
  return new NextResponse(null, { status: 204 });
}
