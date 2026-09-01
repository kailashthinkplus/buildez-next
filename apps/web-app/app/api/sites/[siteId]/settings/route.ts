import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

import { verifyTenantAccess } from "@/lib/auth/verifyTenant";
import { isReservedPublicSiteSlug } from "@/lib/sites/public-slug";

const text = (value: unknown, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const url = (value: unknown) => {
  const valueText = text(value, 2000);
  return !valueText || /^https?:\/\//i.test(valueText) ? valueText : "";
};
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const defaults = {
  language: "en",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  contactEmail: "",
  contactPhone: "",
  faviconUrl: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  canonicalUrl: "",
  allowIndexing: true,
  socialImageUrl: "",
  twitterHandle: "",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  googleAnalyticsId: "",
  googleTagManagerId: "",
  metaPixelId: "",
  cookieBannerEnabled: true,
  cookieMessage: "We use cookies to improve your experience.",
  privacyPolicyUrl: "",
  termsUrl: "",
  frontPageId: "",
  notFoundPageId: "",
  maintenanceMode: false,
  showPoweredBy: true,
  trailingSlash: false,
  redirectToWww: false,
};

async function access(req: NextRequest, siteId: string) {
  const tenant = await verifyTenantAccess(req);
  if (!tenant) return null;
  return prisma.site.findFirst({
    where: { id: siteId, tenantId: tenant.id, deletedAt: null },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params;
  const site = await access(req, siteId);
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }
  const pages = await prisma.page.findMany({
    where: { siteId, deletedAt: null },
    orderBy: [{ status: "desc" }, { title: "asc" }],
    select: { id: true, title: true, slug: true, status: true },
  });
  return NextResponse.json({
    site: {
      id: site.id,
      name: site.name,
      slug: site.slug,
      logoUrl: site.logoUrl,
      status: site.status,
      settings: { ...defaults, ...record(site.settings) },
    },
    pages,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params;
  const site = await access(req, siteId);
  const body = await req.json().catch(() => null);
  if (!site || !body) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  if (
    Object.keys(body).every((key) => key === "status") &&
    (body.status === "DRAFT" || body.status === "PUBLISHED")
  ) {
    if (body.status === "PUBLISHED") {
      const publishedPages = await prisma.page.count({
        where: { siteId, status: "PUBLISHED", deletedAt: null },
      });
      if (!publishedPages) {
        return NextResponse.json(
          { error: "Publish at least one page before publishing the site" },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.site.update({
      where: { id: site.id },
      data: { status: body.status },
    });
    return NextResponse.json({ site: updated });
  }

  const slug = text(body.slug, 80)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!text(body.name, 120) || !slug) {
    return NextResponse.json(
      { error: "Site name and URL slug are required" },
      { status: 400 },
    );
  }
  if (isReservedPublicSiteSlug(slug)) {
    return NextResponse.json(
      { error: "That site URL is reserved. Choose another one." },
      { status: 409 },
    );
  }
  const duplicate = await prisma.site.findFirst({
    where: {
      slug,
      id: { not: site.id },
      deletedAt: null,
    },
    select: { id: true },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "That site URL is already in use" },
      { status: 409 },
    );
  }

  const routePageIds = [text(body.frontPageId, 100), text(body.notFoundPageId, 100)].filter(Boolean);
  if (routePageIds.length) {
    const ownedPages = await prisma.page.count({
      where: { siteId, id: { in: routePageIds }, deletedAt: null },
    });
    if (ownedPages !== new Set(routePageIds).size) {
      return NextResponse.json(
        { error: "Choose pages that belong to this website" },
        { status: 400 },
      );
    }
  }

  const previous = record(site.settings);
  const settings = {
    ...previous,
    language: text(body.language, 10) || "en",
    timezone: text(body.timezone, 80) || "Asia/Kolkata",
    dateFormat: text(body.dateFormat, 30) || "DD/MM/YYYY",
    contactEmail: text(body.contactEmail, 320),
    contactPhone: text(body.contactPhone, 40),
    faviconUrl: url(body.faviconUrl),
    seoTitle: text(body.seoTitle, 70),
    seoDescription: text(body.seoDescription, 170),
    seoKeywords: text(body.seoKeywords, 500),
    canonicalUrl: url(body.canonicalUrl),
    allowIndexing: body.allowIndexing !== false,
    socialImageUrl: url(body.socialImageUrl),
    twitterHandle: text(body.twitterHandle, 50),
    facebookUrl: url(body.facebookUrl),
    instagramUrl: url(body.instagramUrl),
    linkedinUrl: url(body.linkedinUrl),
    googleAnalyticsId: text(body.googleAnalyticsId, 40),
    googleTagManagerId: text(body.googleTagManagerId, 40),
    metaPixelId: text(body.metaPixelId, 40),
    cookieBannerEnabled: body.cookieBannerEnabled !== false,
    cookieMessage: text(body.cookieMessage, 300),
    privacyPolicyUrl: url(body.privacyPolicyUrl),
    termsUrl: url(body.termsUrl),
    frontPageId: text(body.frontPageId, 100),
    notFoundPageId: text(body.notFoundPageId, 100),
    maintenanceMode: body.maintenanceMode === true,
    showPoweredBy: body.showPoweredBy !== false,
    trailingSlash: body.trailingSlash === true,
    redirectToWww: body.redirectToWww === true,
  };

  let status = site.status;
  if (body.status === "DRAFT") status = "DRAFT";
  if (body.status === "PUBLISHED" && site.status !== "PUBLISHED") {
    const publishedPages = await prisma.page.count({
      where: { siteId, status: "PUBLISHED", deletedAt: null },
    });
    if (!publishedPages) {
      return NextResponse.json(
        { error: "Publish at least one page before publishing the site" },
        { status: 400 },
      );
    }
    status = "PUBLISHED";
  }

  const updated = await prisma.site.update({
    where: { id: site.id },
    data: {
      name: text(body.name, 120),
      slug,
      logoUrl: url(body.logoUrl) || null,
      settings,
      status,
    },
  });
  return NextResponse.json({ site: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params;
  const site = await access(req, siteId);
  const body = await req.json().catch(() => ({}));
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }
  if (text(body.confirmation, 120) !== site.name) {
    return NextResponse.json(
      { error: `Type “${site.name}” to confirm deletion` },
      { status: 400 },
    );
  }
  await prisma.site.update({
    where: { id: site.id },
    data: { deletedAt: new Date(), status: "DRAFT" },
  });
  return NextResponse.json({ success: true });
}
