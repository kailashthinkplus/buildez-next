import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/auth/getUser";
import { runPageSpeed } from "@/modules/insights/pageSpeed";
import { createInsightReport, resolveOwnedInsightUrl } from "@/modules/insights/server";

const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };

async function access() {
  const auth = await getUser();
  if (!auth?.user || !auth.tenant) return null;
  return auth;
}

function pageIdFrom(req: NextRequest) {
  const value = req.nextUrl.searchParams.get("pageId");
  return value?.trim() || undefined;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const auth = await access();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });
  }
  try {
    const { siteId } = await params;
    const report = await createInsightReport({
      siteId,
      tenantId: auth.tenant.id,
      pageId: pageIdFrom(req),
    });
    return NextResponse.json({ report }, { headers: PRIVATE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Insight audit failed";
    return NextResponse.json(
      { error: message },
      { status: message === "Site not found" || message === "Page not found" ? 404 : 500, headers: PRIVATE_HEADERS },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const auth = await access();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });
  }
  try {
    const { siteId } = await params;
    const body = await req.json().catch(() => ({}));
    const pageId =
      typeof body.pageId === "string" && body.pageId.trim()
        ? body.pageId.trim()
        : undefined;
    const report = await createInsightReport({
      siteId,
      tenantId: auth.tenant.id,
      pageId,
      force: body.regenerate === true,
    });
    if (typeof body.url !== "string" || !body.url.trim()) {
      return NextResponse.json({ report }, { headers: PRIVATE_HEADERS });
    }
    const strategy = body.strategy === "desktop" ? "desktop" : "mobile";
    const targetUrl = await resolveOwnedInsightUrl({
      siteId,
      tenantId: auth.tenant.id,
      url: body.url.trim(),
      requestOrigin: req.nextUrl.origin,
    });
    const liveReport = await runPageSpeed(report, targetUrl, strategy);
    return NextResponse.json({ report: liveReport }, { headers: PRIVATE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Insight audit failed";
    return NextResponse.json(
      { error: message },
      { status: message === "Site not found" || message === "Page not found" ? 404 : 400, headers: PRIVATE_HEADERS },
    );
  }
}
