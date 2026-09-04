import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";
import { isActivePreviewSession } from "@/modules/builder-v3/preview/PreviewSessionManager";

export async function GET(req: NextRequest) {
  const siteSlug = req.nextUrl.searchParams.get("siteSlug"); const domain = req.nextUrl.searchParams.get("domain")?.toLowerCase();
  const previewSessionId = req.headers.get("x-buildez-preview-session") || "";
  const previewSiteId = req.headers.get("x-buildez-preview-site") || "";
  const isPreview = Boolean(
    previewSessionId
    && previewSiteId
    && isActivePreviewSession(previewSessionId, previewSiteId),
  );
  const slugCandidates = !isPreview && !domain
    ? await prisma.site.findMany({
        where: { slug: siteSlug || "", status: "PUBLISHED", deletedAt: null },
        take: 2,
      })
    : [];
  const site = isPreview
    ? await prisma.site.findFirst({ where: { id: previewSiteId, deletedAt: null } })
    : domain
    ? (await prisma.siteDomain.findFirst({ where: { domain, status: "VERIFIED", site: { status: "PUBLISHED", deletedAt: null } }, include: { site: true } }))?.site
    : slugCandidates.length === 1 ? slugCandidates[0] : null;
  if (!site) return NextResponse.json({ error: "Store not found" }, { status: 404 });
  const shop = await prisma.shop.findFirst({ where: { siteId: site.id, ...(isPreview ? {} : { isPublished: true }) }, include: { products: { where: isPreview ? { status: { not: "ARCHIVED" } } : { status: "ACTIVE" }, include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: { position: "asc" } }, options: { orderBy: { position: "asc" } } }, orderBy: { updatedAt: "desc" } }, collections: { include: { products: true } }, payments: { where: { enabled: true }, select: { provider: true } } } });
  if (!shop) return NextResponse.json({ error: "This store is not published" }, { status: 404 });
  const products = shop.products.map((product) => {
    const available = !product.trackQuantity
      || product.continueSelling
      || product.variants.some((variant) => variant.inventory > 0);
    return {
      ...product,
      available,
      variants: product.variants.map((variant) => ({
        ...variant,
        available: !product.trackQuantity
          || product.continueSelling
          || variant.inventory > 0,
      })),
    };
  });
  return NextResponse.json({
    site: { id: site.id, name: site.name, slug: site.slug, logoUrl: site.logoUrl, designTokens: site.designTokens },
    shop: { ...shop, products },
  });
}
