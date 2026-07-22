import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@buildez/db";

export async function GET(req: NextRequest) {
  const siteSlug = req.nextUrl.searchParams.get("siteSlug"); const domain = req.nextUrl.searchParams.get("domain")?.toLowerCase();
  const site = domain ? (await prisma.siteDomain.findFirst({ where: { domain, status: "VERIFIED" }, include: { site: true } }))?.site : await prisma.site.findFirst({ where: { slug: siteSlug || "", deletedAt: null } });
  if (!site) return NextResponse.json({ error: "Store not found" }, { status: 404 });
  const shop = await prisma.shop.findFirst({ where: { siteId: site.id, isPublished: true }, include: { products: { where: { status: "ACTIVE" }, include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: { position: "asc" } }, options: { orderBy: { position: "asc" } } }, orderBy: { updatedAt: "desc" } }, collections: { include: { products: true } }, payments: { where: { enabled: true }, select: { provider: true } } } });
  if (!shop) return NextResponse.json({ error: "This store is not published" }, { status: 404 });
  return NextResponse.json({ site: { id: site.id, name: site.name, slug: site.slug, logoUrl: site.logoUrl, designTokens: site.designTokens }, shop });
}
