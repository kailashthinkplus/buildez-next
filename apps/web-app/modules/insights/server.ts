import { prisma } from "@buildez/db";
import { createHash } from "node:crypto";

import { buildInsightReport } from "./insightEngine";
import type { InsightReport } from "./types";

const INSIGHT_CACHE_KEY = "__buildezInsightCache";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function createInsightReport(input: {
  siteId: string;
  tenantId: string;
  pageId?: string;
  force?: boolean;
}) {
  const site = await prisma.site.findFirst({
    where: {
      id: input.siteId,
      tenantId: input.tenantId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      designTokens: true,
      settings: true,
      pages: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          metadata: true,
          updatedAt: true,
        },
      },
      v12Project: {
        select: {
          currentRevision: true,
          files: {
            orderBy: { path: "asc" },
            select: { path: true, content: true },
          },
        },
      },
    },
  });
  if (!site) throw new Error("Site not found");
  if (input.pageId && !site.pages.some((page) => page.id === input.pageId)) {
    throw new Error("Page not found");
  }

  const settings = record(site.settings);
  const { [INSIGHT_CACHE_KEY]: cachedValue, ...settingsForFingerprint } = settings;
  const fingerprint = createHash("sha256").update(JSON.stringify({
    site: { name: site.name, slug: site.slug, status: site.status, designTokens: site.designTokens, settings: settingsForFingerprint },
    pages: site.pages.map((page) => ({ id: page.id, slug: page.slug, status: page.status, metadata: page.metadata, updatedAt: page.updatedAt.toISOString() })),
    projectRevision: site.v12Project?.currentRevision ?? null,
    files: site.v12Project?.files.map((file) => ({ path: file.path, content: file.content })) ?? [],
  })).digest("hex");
  const cached = record(cachedValue);
  const cachedReport = cached.report as InsightReport | undefined;
  if (!input.pageId && !input.force && cached.fingerprint === fingerprint && cachedReport?.site?.id === site.id) {
    return cachedReport;
  }

  const report = buildInsightReport({
    site: {
      id: site.id,
      name: site.name,
      slug: site.slug,
      status: site.status,
      settings: settingsForFingerprint,
    },
    pages: site.pages.map((page) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      status: page.status,
      metadata: record(page.metadata),
    })),
    files: site.v12Project?.files ?? [],
    pageId: input.pageId,
  });
  // The cache lives with the exact site and carries its own source fingerprint.
  // Updating it does not invalidate itself because the cache key is excluded above.
  if (!input.pageId) await prisma.site.updateMany({
    where: { id: site.id, tenantId: input.tenantId, deletedAt: null },
    data: {
      settings: {
        ...settingsForFingerprint,
        [INSIGHT_CACHE_KEY]: {
          fingerprint,
          generatedAt: report.generatedAt,
          report,
        },
      },
    },
  });
  return report;
}

export function isInsightUrlOwnedBySite(input: {
  url: string;
  requestOrigin: string;
  siteId: string;
  siteSlug: string;
  verifiedDomains: string[];
  platformDomain: string;
}) {
  const target = new URL(input.url);
  const requestUrl = new URL(input.requestOrigin);
  const host = target.hostname.toLowerCase();
  const exactPlatformPath = `/published-preview/${encodeURIComponent(input.siteId)}`;
  const isExactPlatformUrl =
    target.host.toLowerCase() === requestUrl.host.toLowerCase() &&
    (target.pathname === exactPlatformPath || target.pathname.startsWith(`${exactPlatformPath}/`));
  const isVerifiedDomain =
    !target.port && input.verifiedDomains.some((domain) => domain.toLowerCase() === host);
  const platformDomain = input.platformDomain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  const isSiteSubdomain =
    !target.port && host === `${input.siteSlug.toLowerCase()}.${platformDomain}`;
  return isExactPlatformUrl || isVerifiedDomain || isSiteSubdomain;
}

export async function resolveOwnedInsightUrl(input: {
  siteId: string;
  tenantId: string;
  url: string;
  requestOrigin: string;
}) {
  const site = await prisma.site.findFirst({
    where: { id: input.siteId, tenantId: input.tenantId, deletedAt: null },
    select: {
      id: true,
      slug: true,
      domains: { where: { status: "VERIFIED" }, select: { domain: true } },
    },
  });
  if (!site) throw new Error("Site not found");

  const target = new URL(input.url);
  if (!isInsightUrlOwnedBySite({
    url: target.toString(),
    requestOrigin: input.requestOrigin,
    siteId: site.id,
    siteSlug: site.slug,
    verifiedDomains: site.domains.map((connection) => connection.domain),
    platformDomain: process.env.PLATFORM_DOMAIN || "buildez.site",
  })) {
    throw new Error("This URL is not connected to the selected website");
  }
  return target.toString();
}
