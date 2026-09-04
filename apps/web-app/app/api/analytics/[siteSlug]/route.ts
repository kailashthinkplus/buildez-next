import { prisma } from "@buildez/db";
import { NextRequest, NextResponse } from "next/server";

import { getUser } from "@/lib/auth/getUser";
import { publishedSitePath } from "@/lib/runtime/published-site-path";

const ranges = new Set([7, 30, 90]);

type AnalyticsRow = {
  path: string;
  country: string | null;
  city: string | null;
  referrer: string | null;
  device: string | null;
  visitorHash: string;
  sessionId: string | null;
  eventType: string;
  metadata: unknown;
  createdAt: Date;
};

const change = (current: number, previous: number) =>
  previous ? Math.round(((current - previous) / previous) * 1000) / 10 : current ? 100 : 0;

function trafficSource(referrer: string | null) {
  if (!referrer) return "Direct";
  try {
    const hostname = new URL(referrer).hostname.replace(/^www\./, "");
    if (/google|bing|duckduckgo|yahoo/.test(hostname)) return "Organic search";
    if (/facebook|instagram|linkedin|twitter|t\.co|youtube|pinterest/.test(hostname)) return "Social";
    if (/mail|newsletter/.test(hostname)) return "Email";
    return hostname;
  } catch {
    return "Referral";
  }
}

async function loadEvents(siteId: string, previousSince: Date): Promise<AnalyticsRow[]> {
  try {
    return await prisma.trafficEvent.findMany({
      where: {
        siteId,
        createdAt: { gte: previousSince },
        device: { not: "bot" },
      },
      select: {
        path: true,
        country: true,
        city: true,
        referrer: true,
        device: true,
        visitorHash: true,
        sessionId: true,
        eventType: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
      take: 100000,
    });
  } catch (error) {
    // Production can briefly run the new application before its additive analytics
    // migration has completed. Keep legacy page-view analytics available meanwhile.
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code !== "P2022") throw error;

    const legacyRows = await prisma.$queryRaw<Array<{
      path: string;
      country: string | null;
      referrer: string | null;
      device: string | null;
      visitorHash: string;
      createdAt: Date;
    }>>`
      SELECT "path", "country", "referrer", "device", "visitorHash", "createdAt"
      FROM "TrafficEvent"
      WHERE "siteId" = ${siteId}
        AND "createdAt" >= ${previousSince}
        AND ("device" IS NULL OR "device" <> 'bot')
      ORDER BY "createdAt" ASC
      LIMIT 100000
    `;

    return legacyRows.map((row) => ({
      ...row,
      city: null,
      sessionId: row.visitorHash,
      eventType: "pageview",
      metadata: null,
    }));
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteSlug: string }> }
) {
  try {
    const auth = await getUser();
    if (!auth?.tenant) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { siteSlug } = await params;
    const requestedDays = Number(req.nextUrl.searchParams.get("days") || 30);
    const fromParam = req.nextUrl.searchParams.get("from");
    const toParam = req.nextUrl.searchParams.get("to");
    const customFrom = fromParam ? new Date(`${fromParam}T00:00:00.000Z`) : null;
    const customTo = toParam ? new Date(`${toParam}T23:59:59.999Z`) : null;
    const validCustomRange = Boolean(
      customFrom && customTo &&
      Number.isFinite(customFrom.getTime()) && Number.isFinite(customTo.getTime()) &&
      customFrom <= customTo && customTo.getTime() - customFrom.getTime() <= 366 * 86400000,
    );
    if ((fromParam || toParam) && !validCustomRange) {
      return NextResponse.json({ error: "INVALID_DATE_RANGE", message: "Choose a valid date range of up to 366 days." }, { status: 400 });
    }
    const presetDays = ranges.has(requestedDays) ? requestedDays : 30;
    const site = await prisma.site.findFirst({
      where: { slug: siteSlug, tenantId: auth.tenant.id },
      select: {
        id: true, name: true, slug: true, _count: { select: { pages: true } },
        pages: {
          where: { status: "PUBLISHED", deletedAt: null, deleted: false },
          select: { id: true, title: true, slug: true, metadata: true },
          orderBy: { publishedAt: "desc" },
        },
      },
    });
    if (!site) return NextResponse.json({ error: "SITE_NOT_FOUND" }, { status: 404 });

    const actualNow = new Date();
    const until = validCustomRange ? customTo! : actualNow;
    const since = validCustomRange ? customFrom! : new Date(until.getTime() - presetDays * 86400000);
    const days = Math.max(1, Math.ceil((until.getTime() - since.getTime()) / 86400000));
    const previousSince = new Date(since.getTime() - (until.getTime() - since.getTime()));
    const rows = await loadEvents(site.id, previousSince);
    const current = rows.filter((row) => row.createdAt >= since && row.createdAt <= until);
    const previous = rows.filter((row) => row.createdAt < since);
    const pageviews = current.filter((row) => row.eventType === "pageview");
    const previousViews = previous.filter((row) => row.eventType === "pageview");
    const visitors = new Set(pageviews.map((row) => row.visitorHash));
    const previousVisitors = new Set(previousViews.map((row) => row.visitorHash));

    const sessions = new Map<string, AnalyticsRow[]>();
    current.forEach((row) => {
      const sessionId = row.sessionId || row.visitorHash;
      sessions.set(sessionId, [...(sessions.get(sessionId) || []), row]);
    });
    const durations = [...sessions.values()]
      .map((events) => (events[events.length - 1].createdAt.getTime() - events[0].createdAt.getTime()) / 1000)
      .filter((duration) => duration >= 0);
    const avgSessionSeconds = durations.length
      ? Math.round(durations.reduce((total, duration) => total + duration, 0) / durations.length)
      : 0;
    const bounced = [...sessions.values()].filter(
      (events) =>
        events.filter((row) => row.eventType === "pageview").length <= 1 &&
        events.every((row) => row.eventType !== "click")
    ).length;
    const bounceRate = sessions.size ? Math.round((bounced / sessions.size) * 1000) / 10 : 0;

    const dayMap = new Map<string, { pageViews: number; visitors: Set<string> }>();
    for (let index = days - 1; index >= 0; index -= 1) {
      const date = new Date(until.getTime() - index * 86400000).toISOString().slice(0, 10);
      dayMap.set(date, { pageViews: 0, visitors: new Set() });
    }
    pageviews.forEach((row) => {
      const day = dayMap.get(row.createdAt.toISOString().slice(0, 10));
      if (day) {
        day.pageViews += 1;
        day.visitors.add(row.visitorHash);
      }
    });

    const group = (data: AnalyticsRow[], key: (row: AnalyticsRow) => string) => {
      const groups = new Map<string, AnalyticsRow[]>();
      data.forEach((row) => {
        const name = key(row);
        groups.set(name, [...(groups.get(name) || []), row]);
      });
      return [...groups].map(([name, events]) => ({
        name,
        pageViews: events.length,
        visitors: new Set(events.map((row) => row.visitorHash)).size,
      })).sort((a, b) => b.pageViews - a.pageViews);
    };

    const liveSince = new Date(actualNow.getTime() - 5 * 60000);
    const liveRows = validCustomRange ? [] : current.filter((row) => row.createdAt >= liveSince);
    const liveSessions = new Set(liveRows.map((row) => row.sessionId || row.visitorHash));

    return NextResponse.json({
      site,
      range: { days, since: since.toISOString(), until: until.toISOString(), custom: validCustomRange },
      totals: {
        pageViews: pageviews.length,
        visitors: visitors.size,
        pageViewsChange: change(pageviews.length, previousViews.length),
        visitorsChange: change(visitors.size, previousVisitors.size),
        sessions: sessions.size,
        avgSessionSeconds,
        bounceRate,
        clicks: current.filter((row) => row.eventType === "click").length,
        conversions: current.filter((row) => row.eventType === "conversion").length,
      },
      liveVisitors: liveSessions.size,
      trend: [...dayMap].map(([date, value]) => ({ date, pageViews: value.pageViews, visitors: value.visitors.size })),
      pages: group(pageviews, (row) => row.path || "/").map((item) => ({ path: item.name, pageViews: item.pageViews, visitors: item.visitors })).slice(0, 10),
      sources: group(pageviews, (row) => trafficSource(row.referrer)).slice(0, 10),
      countries: group(pageviews, (row) => row.country || "Unknown").map((item) => ({ country: item.name, pageViews: item.pageViews, visitors: item.visitors })).slice(0, 15),
      devices: group(pageviews, (row) => row.device || "unknown").map((item) => ({ device: item.name, pageViews: item.pageViews })),
      liveActivity: liveRows.filter((row) => row.eventType === "pageview").slice(-20).reverse().map((row) => ({ path: row.path, city: row.city || "", country: row.country || "Unknown", createdAt: row.createdAt })),
      clicks: current.filter((row) => row.eventType === "click").slice(-500).map((row) => ({ path: row.path, metadata: row.metadata, createdAt: row.createdAt })),
      heatmapPages: site.pages.map((page) => {
        const metadata = page.metadata && typeof page.metadata === "object" && !Array.isArray(page.metadata) ? page.metadata as Record<string, unknown> : {};
        const screenshotUrl = [metadata.screenshotUrl, metadata.thumbnailUrl, metadata.previewImageUrl, metadata.ogImage].find((value): value is string => typeof value === "string" && Boolean(value));
        return {
          id: page.id,
          title: page.title,
          slug: page.slug,
          screenshotUrl: screenshotUrl || null,
          liveUrl: publishedSitePath(site.slug, page.slug),
        };
      }),
    });
  } catch (error) {
    console.error("[analytics/site] request failed", error);
    return NextResponse.json(
      { error: "ANALYTICS_UNAVAILABLE", message: error instanceof Error ? error.message : "Analytics could not be loaded." },
      { status: 500 }
    );
  }
}
